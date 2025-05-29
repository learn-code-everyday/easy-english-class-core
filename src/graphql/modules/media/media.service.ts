import { CrudService } from "../../../base/crudService";
import { MediaModel } from "./media.model";
class MediaService extends CrudService<typeof MediaModel> {
  constructor() {
    super(MediaModel);
  }
}

const mediaService = new MediaService();

export { mediaService };
