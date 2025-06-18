import {CrudService} from "../../../base/crudService";
import { Order, OrderCurrency, OrderModel, OrderPaymentMethod, OrderStatuses } from "./order.model";
import {CommissionsModel} from "../../modules/commissions/commissions.model";
import mongoose from "mongoose";
import {CustomerModel} from "../../modules/customer/customer.model";
import {SettingModel} from "../../modules/setting/setting.model";
import {SettingKey} from "../../../configs/settingData";
import {QrTokenModel, QrTokenStatuses} from "../../modules/qrToken/qrToken.model";
import {UserModel, UserRoles} from "../../modules/user/user.model";

class OrderService extends CrudService<typeof OrderModel> {
    constructor() {
        super(OrderModel);
    }

    async getOrderForMerchant(userId: string) {
        try {
            const [ordersAggregation, commissionsAggregation] = await Promise.all([
                OrderModel.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            status: "SUCCESS",
                        },
                    },
                    {
                        $group: {
                            _id: "$paymentMethod",
                            totalRevenue: {$sum: "$amount"},
                            totalOrder: {$sum: "$quantity"},
                        },
                    },
                ]),
                CommissionsModel.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            status: "PAID",
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalCommission: {$sum: "$commission"},
                        },
                    },
                ]),
            ]);

            let totalUsdRevenue = 0;
            let totalUsdtRevenue = 0;
            let totalVndRevenue = 0;
            let totalOrder = 0;

            for (const record of ordersAggregation) {
                switch (record._id) {
                    case OrderCurrency.USDT:
                        totalUsdtRevenue += record.totalRevenue;
                        break;
                    case OrderCurrency.USD:
                        totalUsdRevenue += record.totalRevenue;
                        break;
                    case OrderCurrency.VND:
                        totalVndRevenue += record.totalRevenue;
                        break;
                }

                totalOrder += record.totalOrder;
            }
            const totalCommission = commissionsAggregation[0]?.totalCommission || 0;

            return {
                totalUsdRevenue,
                totalUsdtRevenue,
                totalVndRevenue,
                totalCommission,
                totalOrder,
            };
        } catch (error) {
            console.error("Error get order for merchant:", error);
            throw error;
        }
    }

    async createOrder(userId: string, data: any) {
        try {
            const {gmail, customerId, qrNumber, currency} = data;
            if (!customerId) {
                throw new Error("CustomerId not found.");
            }
            const customer = await CustomerModel.findById(customerId);
            if (!customer) {
                throw new Error("Customer not found.");
            }
            if (customer.gmail !== gmail) {
                throw new Error("Email does not match with customer record.");
            }
            const setting = await SettingModel.findOne({
                key: currency === OrderCurrency.VND ? SettingKey.MINER_UNIT_VND_PRICE : SettingKey.MINER_UNIT_USDT_PRICE,
            });

            if (!setting || isNaN(Number(setting.value))) {
                throw new Error("Miner unit price setting is missing or invalid.");
            }

            if (!Array.isArray(qrNumber) || qrNumber.length === 0) {
                throw new Error("qrNumber must be a non-empty array.");
            }

            const unusedQrTokens = await QrTokenModel.find({
                qrNumber: {$in: qrNumber},
                status: QrTokenStatuses.NEW
            });

            if (unusedQrTokens.length < qrNumber.length) {
                const foundQrNumbers = unusedQrTokens.map(qr => qr.qrNumber);
                const notFound = qrNumber.filter(qr => !foundQrNumbers.includes(qr));
                throw new Error(`Not enough UNUSED QR tokens. These are invalid or already used: ${notFound.join(", ")}`);
            }

            const quantity = qrNumber.length || 0;
            const amount = setting.value * quantity;
            const dataInsert: Order = {
                ...data,
                userId,
                customerId,
                gmail,
                quantity,
                qrNumber,
                amount,
            };
            await QrTokenModel.updateMany(
                {qrNumber: {$in: qrNumber}},
                {$set: {status: QrTokenStatuses.ORDERED}}
            );

            return await OrderModel.create(dataInsert);
        } catch (error) {
            console.error("Error create order:", error);
            throw error;
        }
    }

    async updateOrder(id: string, data: any) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid order ID');
        }

        const existingOrder = await OrderModel.findById(id);
        if (!existingOrder) {
            throw new Error('Order not found');
        }

        // Fill missing fields from existing order
        const customerId = data.customerId ?? existingOrder.customerId;
        const quantity = data.quantity ?? existingOrder.quantity;
        const currency = data.currency ?? existingOrder.currency;

        if (!quantity || !currency) {
            throw new Error('Quantity and currency must be provided or exist in the order');
        }

        const settingKey =
          currency === OrderCurrency.VND
            ? SettingKey.MINER_UNIT_VND_PRICE
            : SettingKey.MINER_UNIT_USDT_PRICE;

        const setting = await SettingModel.findOne({ key: settingKey });

        const unitPrice = Number(setting?.value);
        if (!unitPrice) {
            throw new Error('Miner unit price setting is missing or invalid.');
        }

        const updateData: any = {
            ...data,
            customerId,
            quantity,
            currency,
            amount: unitPrice * quantity,
        };

        if (data.status === OrderStatuses.PENDING_PAYMENT_CONFIRMATION) {
            updateData.paymentDate = new Date();
        }

        await OrderModel.updateOne({ _id: id }, { $set: updateData }, {upsert: true, new: true});

        return OrderModel.findById(id);
    }

    async updateOrderForAdmin(id: string, data: any) {
        let {status, trackingLink, rejectReason} = data;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid order ID');
        }

        const existingOrder = await OrderModel.findById(id);
        if (!existingOrder) {
            throw new Error('Order not found');
        }

        if (existingOrder?.status === OrderStatuses.SUCCESS) {
            throw new Error('Cannot update an order that is already SUCCESS');
        }

        await OrderModel.updateOne(
            {_id: id},
            {
                $set: {
                    status,
                    trackingLink,
                    rejectReason
                }
            },
            {upsert: true, new: true},
        );

        if (status === OrderStatuses.DELIVERING) {
            await QrTokenModel.updateMany(
                {qrNumber: {$in: existingOrder?.qrNumber}},
                {
                    $set: {
                        status: QrTokenStatuses.DELIVERING,
                        customerId: existingOrder?.customerId,
                    }
                }
            );
        }

        if (status === OrderStatuses.SUCCESS) {
            await QrTokenModel.updateMany(
                {qrNumber: {$in: existingOrder?.qrNumber}},
                {
                    $set: {
                        status: QrTokenStatuses.DELIVERED,
                        customerId: existingOrder?.customerId,
                    }
                }
            );

            const setting = await SettingModel.findOne({
                key: SettingKey.SELLER_COMMISSIONS_RATE,
            });

            if (!setting || isNaN(Number(setting.value))) {
                throw new Error("Miner unit price setting is missing or invalid.");
            }

            const commissionRate = Number(setting.value);
            const totalCommission = (existingOrder?.amount || 0) * commissionRate / 100;

            const seller = await UserModel.findById(existingOrder.userId).lean();
            if (!seller) throw new Error("Seller not found");

            const commissions = [];
            let sellerCommission = totalCommission / 3;
            let leaderCommission = 0;
            let grandLeaderCommission = 0;

            const leader = seller.referrenceId
                ? await UserModel.findOne({
                    _id: seller.referrenceId,
                    role: UserRoles.MERCHANT,
                }).lean()
                : null;

            const grandLeader = leader?.referrenceId
                ? await UserModel.findOne({
                    _id: leader.referrenceId,
                    role: UserRoles.MERCHANT,
                }).lean()
                : null;

            if (leader) {
                leaderCommission = totalCommission / 3;
                if (grandLeader) {
                    grandLeaderCommission = totalCommission / 3;
                } else {
                    leaderCommission = totalCommission - sellerCommission;
                }
            } else {
                sellerCommission = totalCommission;
            }

            commissions.push({
                orderId: id,
                userId: seller._id,
                commission: sellerCommission,
            });

            if (leader) {
                commissions.push({
                    orderId: id,
                    userId: leader._id,
                    commission: leaderCommission,
                });
            }

            if (grandLeader) {
                commissions.push({
                    orderId: id,
                    userId: grandLeader._id,
                    commission: grandLeaderCommission,
                });
            }

            await CommissionsModel.insertMany(commissions);
        }

        return OrderModel.findById(id);
    }
}

const orderService = new OrderService();

export {orderService};
