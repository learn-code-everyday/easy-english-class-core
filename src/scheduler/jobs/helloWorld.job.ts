import { Job } from "agenda";
import { Agenda } from "../agenda";
import { LogHelper } from "../../core/logger";

export class HelloWorldJob {
  static jobName = "HelloWorld";
  static create(data: any) {
    return Agenda.create(this.jobName, data);
  }
  static execute(job: Job) {
    LogHelper.runingJobLog(HelloWorldJob.jobName);
  }
}

export default HelloWorldJob;
