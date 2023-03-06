import mongoose from "mongoose";

const DearLogs = mongoose.model(
  "DearLogs",
  new mongoose.Schema(
    {
      id: String,
      lastUpdated: String,
      updatedBy: String,
    },
    { versionKey: false }
  ),
  "DearLogs"
);

export default DearLogs;
