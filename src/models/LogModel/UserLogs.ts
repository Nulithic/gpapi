import mongoose from "mongoose";

const UserLogs = mongoose.model(
  "UserLogs",
  new mongoose.Schema(
    {
      user: String,
      date: String,
      action: String,
    },
    { versionKey: false }
  ),
  "UserLogs"
);

export default UserLogs;
