import { CrudService } from "../../../base/crudService";
import { MinerErrorLogsModel } from "./minerErrorLogs.model";
class MinerErrorLogsService extends CrudService<typeof MinerErrorLogsModel> {
  constructor() {
    super(MinerErrorLogsModel);
  }
}

const minerErrorLogsService = new MinerErrorLogsService();

export { minerErrorLogsService };
