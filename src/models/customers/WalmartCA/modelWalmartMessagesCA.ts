import mongoose from "mongoose";

const WalmartMessagesCA = mongoose.model(
  "WalmartMessagesCA",
  new mongoose.Schema(
    {
      ediType: String,
      dateReceived: String,
      fileName: String,
      data: String,
      imported: Boolean,
    },
    { versionKey: false }
  ),
  "WalmartMessagesCA"
);

export default WalmartMessagesCA;
