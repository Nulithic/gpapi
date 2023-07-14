import mongoose from "mongoose";

const MFTAuthKeys = mongoose.model(
  "MFTAuthKeys",
  new mongoose.Schema(
    {
      token_id: String,
      token: String,
    },
    { versionKey: false }
  ),
  "MFTAuthKeys"
);

export default MFTAuthKeys;
