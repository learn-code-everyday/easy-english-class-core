import { CrudService } from "../../../base/crudService";
import {MinerModel, MinerStatuses} from "./miner.model";
import {QrTokenModel, QrTokenStatuses} from "../../modules/qrToken/qrToken.model";
class MinerService extends CrudService<typeof MinerModel> {
  constructor() {
    super(MinerModel);
  }
  async getDataMinerForAdmin() {
    try {
      const totalMiners = await MinerModel.countDocuments();
      const activeMiners = await MinerModel.countDocuments({status: MinerStatuses.ACTIVE});
      const totalMinersRegistered = await MinerModel.countDocuments({status: MinerStatuses.ACTIVE});
      const totalTokensResult = await MinerModel.aggregate([
        {
          $group: {
            _id: null,
            totalTokensMined: {$sum: "$totalTokensMined"},
          },
        },
      ]);
      const totalTokensMined = totalTokensResult[0]?.totalTokensMined || 0;
      const totalBonsaiMined = 0;

      return  {
        totalMinersRegistered,
        totalMiners,
        activeMiners,
        totalTokensMined,
        totalBonsaiMined
      };
    } catch (error) {
      console.error("Error fetch miner:", error);
      throw error;
    }
  }


  async generateMiner(customerId: string, token: string) {
    try {
      const qrToken: any = await QrTokenModel.findOne({ token });
      if (!qrToken) {
        throw new Error('QR Token not found');
      }

      if (qrToken.minerId) {
        const existingMiner = await MinerModel.findById(qrToken.minerId);
        if (existingMiner) {
          return existingMiner;
        }
      }

      const newMiner = await MinerModel.create({
        code: Date.now().toString(36).toUpperCase(),
        name: 'Miner' + Date.now().toString(36).toUpperCase(),
        blockChainAddress: Date.now().toString(36).toUpperCase(),
        customerId,
        status: MinerStatuses.INACTIVE,
        registered: false,
        totalTokensMined: 0,
        totalUptime: 0,
        currentHashRate: 0,
        lastActive: new Date(),
      });

      qrToken.status = QrTokenStatuses.REGISTERED;
      qrToken.customerId = customerId;
      qrToken.minerId = newMiner._id;
      await qrToken.save();

      return newMiner;
    } catch (error) {
      console.error("Error fetch miner:", error);
      throw error;
    }
  }
}

const minerService = new MinerService();

export { minerService };
