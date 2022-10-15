import mongoose from "mongoose";

const DearLogs = mongoose.model(
  "dear_logs",
  new mongoose.Schema(
    {
      log_id: String,
      last_updated: String,
      updated_by: String,
    },
    { versionKey: false }
  ),
  "dear_logs"
);

export default DearLogs;
