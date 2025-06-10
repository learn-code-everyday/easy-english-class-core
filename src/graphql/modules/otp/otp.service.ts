import { CrudService } from "../../../base/crudService";
import { OtpModel } from "./otp.model";
class OtpService extends CrudService<typeof OtpModel> {
  constructor() {
    super(OtpModel);
  }
}

const otpService = new OtpService();

export { otpService };
