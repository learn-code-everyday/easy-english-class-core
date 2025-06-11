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
      const totalTokensResult = await MinerModel.aggregate([
        {
          $group: {
            _id: null,
            totalTokensMined: {$sum: "$totalTokensMined"},
          },
        },
      ]);
      const totalTokensMined = totalTokensResult[0]?.totalTokensMined || 0;

      return  {
        totalMiners,
        activeMiners,
        totalTokensMined,
      };
    } catch (error) {
      console.error("Error fetch miner:", error);
      throw error;
    }
  }


  async generateMiner(customerId: string, token: string) {
    try {
      const dataInsert = {
        code: Date.now().toString(36).toUpperCase(),
        name: `Miner` +  Date.now().toString(36).toUpperCase(),
        blockChainAddress: Date.now().toString(36).toUpperCase(),
        customerId,
        status: MinerStatuses.ACTIVE,
        registered: false,
        totalTokensMined: 0,
        totalUptime: 0,
        currentHashRate: 0,
        lastActive: new Date(),
      };

      await QrTokenModel.updateOne(
          {token},
          {$set: {
              status: QrTokenStatuses.REGISTERED,
              customerId,
            }},
          {upsert: true, new: true},
      );

      return MinerModel.create(dataInsert);
    } catch (error) {
      console.error("Error fetch miner:", error);
      throw error;
    }
  }
}

const minerService = new MinerService();

export { minerService };
