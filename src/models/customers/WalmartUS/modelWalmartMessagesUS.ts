import mongoose from "mongoose";

const WalmartMessagesUS = mongoose.model(
  "WalmartMessagesUS",
  new mongoose.Schema(
    {
      ediType: String,
      dateReceived: String,
      fileName: String,
      data: String,
    },
    { versionKey: false }
  ),
  "WalmartMessagesUS"
);

export default WalmartMessagesUS;
