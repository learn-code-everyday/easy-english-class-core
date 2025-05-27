import { CrudService } from "../../../base/crudService";
import { CommissionsModel } from "./commissions.model";
class CommissionsService extends CrudService<typeof CommissionsModel> {
  constructor() {
    super(CommissionsModel);
  }
}

const commissionsService = new CommissionsService();

export { commissionsService };
