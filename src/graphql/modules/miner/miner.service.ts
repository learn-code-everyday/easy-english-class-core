import { CrudService } from "../../../base/crudService";
import { MinerModel } from "./miner.model";
class MinerService extends CrudService<typeof MinerModel> {
  constructor() {
    super(MinerModel);
  }
}

const minerService = new MinerService();

export { minerService };
