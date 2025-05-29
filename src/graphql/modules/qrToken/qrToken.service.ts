import { CrudService } from "../../../base/crudService";
import { QrTokenModel } from "./qrToken.model";
class QrTokenService extends CrudService<typeof QrTokenModel> {
  constructor() {
    super(QrTokenModel);
  }
}

const qrTokenService = new QrTokenService();

export { qrTokenService };
