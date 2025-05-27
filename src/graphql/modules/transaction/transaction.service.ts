import { CrudService } from "../../../base/crudService";
import { TransactionModel } from "./transaction.model";
class TransactionService extends CrudService<typeof TransactionModel> {
  constructor() {
    super(TransactionModel);
  }
}

const transactionService = new TransactionService();

export { transactionService };
