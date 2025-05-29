import { CrudService } from "../../../base/crudService";
import { CommissionSettingModel } from "./commissionSetting.model";
class CommissionSettingService extends CrudService<typeof CommissionSettingModel> {
  constructor() {
    super(CommissionSettingModel);
  }
}

const commissionSettingService = new CommissionSettingService();

export { commissionSettingService };
