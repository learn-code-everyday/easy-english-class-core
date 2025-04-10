import { CrudService } from "../../../base/crudService";
import { EventErrorModel } from "./eventError.model";
import { BaseEvent } from "../../../base/baseEvent";
import { ErrorHelper } from "../../../helpers";
import { EventErrorStatusEnum } from "../../../constants/event.const";

class EventErrorService extends CrudService<typeof EventErrorModel> {
  constructor() {
    super(EventErrorModel);
  }

  async resolveEventError(params: any) {
    let { id } = params;

    let eventError = await this.model.findOne({
      _id: id,
    });

    if (!eventError) throw ErrorHelper.recordNotFound("event");
    if (eventError.status !== EventErrorStatusEnum.error)
      throw ErrorHelper.invalid('status');

    BaseEvent.resolve(eventError.type, eventError.data);
    eventError.set("status", EventErrorStatusEnum.resolved);
    return eventError.save();
  }

  async resolveMultiEventError(params: any) {
    let { ids } = params;

    console.log(params);
    let eventErrors = await this.model.find({
      where: {
        id: {
          $in: ids,
        },
        status: EventErrorStatusEnum.error,
      },
    });

    for (let eventError of eventErrors) {
      if (!eventError)
        throw ErrorHelper.recordNotFound("event");
      if (eventError.status !== EventErrorStatusEnum.error)
        throw ErrorHelper.invalid('status');
      BaseEvent.resolve(eventError.type, eventError.data);
      eventError.set("status", EventErrorStatusEnum.resolved);
      eventError.save();
    }

    return eventErrors.length;
  }
}

const eventErrorService = new EventErrorService();

export { eventErrorService };
