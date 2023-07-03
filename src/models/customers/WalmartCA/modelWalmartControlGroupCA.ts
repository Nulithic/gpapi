import mongoose from "mongoose";

const WalmartControlGroupCA = mongoose.model(
  "WalmartControlGroupCA",
  new mongoose.Schema(
    {
      serialNumber: Number,
      controlGroup: String,
    },
    { versionKey: false }
  ).index({ serialNumber: 1 }, { unique: true }),
  "WalmartControlGroupCA"
);

export default WalmartControlGroupCA;
