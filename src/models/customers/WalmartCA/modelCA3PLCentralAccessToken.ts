import mongoose from "mongoose";

const CA3PLCentralAccessToken = mongoose.model(
  "CA3PLCentralAccessToken",
  new mongoose.Schema(
    {
      access_token: String,
      token_type: String,
      expires_in: Number,
      expiration_timestamp: Number,
    },
    { versionKey: false }
  ),
  "CA3PLCentralAccessToken"
);

export default CA3PLCentralAccessToken;
