import { Logs } from "models";

export const userAction = async (user: string, action: string) => {
  console.log(`User: ${user} | Date: ${new Date().toLocaleString()} | Action: ${action}`);
  try {
    const userLog = {
      user: user,
      date: new Date().toLocaleString(),
      action: action,
    };
    new Logs.UserLogs(userLog).save();
  } catch (err) {
    console.log(err);
  }
};
