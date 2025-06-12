import {CrudService} from "../../../base/crudService";
import {Order, OrderModel, OrderPaymentMethod, OrderStatuses} from "./order.model";
import {CommissionsModel} from "../../modules/commissions/commissions.model";
import mongoose from "mongoose";
import {CustomerModel} from "../../modules/customer/customer.model";
import {SettingModel} from "../../modules/setting/setting.model";
import {SettingKey} from "../../../configs/settingData";
import {QrTokenModel, QrTokenStatuses} from "../../modules/qrToken/qrToken.model";

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

            let totalCryptoRevenue = 0;
            let totalCashBankingRevenue = 0;
            let totalOrder = 0;

            for (const entry of ordersAggregation) {
                totalOrder += entry.totalOrder || 0;

                if (entry._id === OrderPaymentMethod.CRYPTO) {
                    totalCryptoRevenue = entry.totalRevenue;
                } else if (
                    entry._id === OrderPaymentMethod.CASH ||
                    entry._id === OrderPaymentMethod.BANKING
                ) {
                    totalCashBankingRevenue += entry.totalRevenue;
                }
            }
            const totalCommission = commissionsAggregation[0]?.totalCommission || 0;

            return {
                totalCryptoRevenue,
                totalCashBankingRevenue,
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
            const {gmail, customerId, qrNumber} = data;
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
                key: SettingKey.MINER_UNIT_PRICE,
            });

            if (!setting || isNaN(Number(setting.value))) {
                throw new Error("Miner unit price setting is missing or invalid.");
            }

            if (!Array.isArray(qrNumber) || qrNumber.length === 0) {
                throw new Error("qrNumber must be a non-empty array.");
            }

            const unusedQrTokens = await QrTokenModel.find({
                qrNumber: {$in: qrNumber},
                status: QrTokenStatuses.UNUSED
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
                {$set: {status: QrTokenStatuses.ORDER}}
            );

            return await OrderModel.create(dataInsert);
        } catch (error) {
            console.error("Error create order:", error);
            throw error;
        }
    }

    async updateOrder(id: string, data: any) {
        let {customerId, status, quantity} = data;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid order ID');
        }

        const existingOrder = await OrderModel.findById(id);
        if (!existingOrder) {
            throw new Error('Order not found');
        }

        if (!customerId) {
            data.customerId = existingOrder?.customerId
        }

        if (!quantity) {
            quantity = existingOrder?.quantity
        }

        if (existingOrder?.status == OrderStatuses.DELIVERING) {
            throw new Error('Cannot update an order that is already DELIVERING');
        }

        const setting = await SettingModel.findOne({
            key: SettingKey.MINER_UNIT_PRICE,
        });

        if (!setting || isNaN(Number(setting.value))) {
            throw new Error("Miner unit price setting is missing or invalid.");
        }
        data.amount = setting.value * quantity;

        if (status === OrderStatuses.PENDING_PAYMENT_CONFIRMATION) {
            data.paymentDate =  new Date();
        }
        await OrderModel.updateOne(
            {_id: id},
            {$set: data},
            {upsert: true, new: true},
        );

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

        if (status === OrderStatuses.SUCCESS) {
            const setting = await SettingModel.findOne({
                key: SettingKey.SELLER_COMMISSIONS_RATE,
            });

            if (!setting || isNaN(Number(setting.value))) {
                throw new Error("Miner unit price setting is missing or invalid.");
            }

            await QrTokenModel.updateMany(
                {qrNumber: {$in: existingOrder?.qrNumber}},
                {
                    $set: {
                        status: QrTokenStatuses.USED,
                        customerId: existingOrder?.customerId,
                    }
                }
            );

            await CommissionsModel.create({
                orderId: id,
                userId: existingOrder?.userId,
                commission: existingOrder?.amount * setting?.value / 100,
            });
        }

        return OrderModel.findById(id);
    }
}

const orderService = new OrderService();

export {orderService};
