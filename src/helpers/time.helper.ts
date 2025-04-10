import moment from "moment";

export const calculateTimeDifferenceAndAddHours = ({
  currentTime,
  specifiedTime,
  additionalHours,
}: {
  currentTime: moment.Moment;
  specifiedTime: moment.Moment;
  additionalHours: number;
}): number => {
  const futureTime = specifiedTime.clone().add(additionalHours, "hours");
  return futureTime.diff(currentTime, "seconds");
};
