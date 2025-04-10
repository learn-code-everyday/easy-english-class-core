import { CrudService } from "../../../base/crudService";
import { ContentModel } from "./content.model";
class ContentService extends CrudService<typeof ContentModel> {
  constructor() {
    super(ContentModel);
  }
}

const contentService = new ContentService();

export { contentService };
