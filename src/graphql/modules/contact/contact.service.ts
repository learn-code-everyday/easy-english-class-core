import { CrudService } from "../../../base/crudService";
import { ContactModel } from "./contact.model";
class ContactService extends CrudService<typeof ContactModel> {
  constructor() {
    super(ContactModel);
  }
}

const contactService = new ContactService();

export { contactService };
