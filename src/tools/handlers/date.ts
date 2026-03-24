export const getDateHandler = async (args: {
  timezone?: string;
  currentDate?: string;
  fromDate?: string;
  agoDay?: number;
  nextDay?: number;
  tool_call_id?: string;
}) => {
  let dateExp = "Your date said as";
  if (args.currentDate) {
    dateExp += ` current date ${args.currentDate}`;
  }
  if (args.fromDate) {
    dateExp += `from the date  ${args.fromDate}`;
  }
  if (!args.currentDate) {
    dateExp += ` today is ${new Date().toLocaleDateString("en-US", { timeZone: args.timezone ?? "UTC" })}`;
  }
  if (args.agoDay) {
    dateExp += ` days before ${args.agoDay} days`;
  }
  if (args.nextDay) {
    dateExp += ` days after ${args.nextDay} days`;
  }
  return dateExp;
};
