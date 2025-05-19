import { CrudService } from "../../../base/crudService";
import { TokensHistoryModel } from "./tokensHistory.model";
class TokensHistoryService extends CrudService<typeof TokensHistoryModel> {
  constructor() {
    super(TokensHistoryModel);
  }
}

const tokensHistoryService = new TokensHistoryService();

export { tokensHistoryService };
