import chalk from "chalk";
import HelloWorldJob from "./jobs/helloWorld.job";

export function InitRepeatJobs() {
  HelloWorldJob.create({})
    .repeatEvery("30 seconds")
    .unique({ name: HelloWorldJob.jobName })
    .save();
}
