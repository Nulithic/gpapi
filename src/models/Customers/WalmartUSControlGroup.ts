import mongoose from "mongoose";

const WalmartUSControlGroup = mongoose.model(
  "WalmartUSControlGroup",
  new mongoose.Schema(
    {
      serialNumber: Number,
      controlGroup: String,
    },
    { versionKey: false }
  ).index({ serialNumber: 1 }, { unique: true }),
  "WalmartUSControlGroup"
);

export default WalmartUSControlGroup;
