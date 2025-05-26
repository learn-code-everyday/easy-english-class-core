import { CrudService } from "../../../base/crudService";
import {MinerModel, MinerStatuses} from "./miner.model";
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


  async scan(code: string) {
    try {
      const dataInsert = {
        code: Date.now().toString(36).toUpperCase(),
        name: `Miner ${code}`,
        blockChainAddress: Date.now().toString(36).toUpperCase(),
        customerId: '',
        status: MinerStatuses.ACTIVE,
        registered: false,
        totalTokensMined: 0,
        totalUptime: 0,
        currentHashRate: 0,
        lastActive: new Date(),
      };

      return MinerModel.create(dataInsert);
    } catch (error) {
      console.error("Error fetch miner:", error);
      throw error;
    }
  }
}

const minerService = new MinerService();

export { minerService };
