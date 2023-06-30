import mongoose from "mongoose";

const WalmartControlGroupUS = mongoose.model(
  "WalmartControlGroupUS",
  new mongoose.Schema(
    {
      serialNumber: Number,
      controlGroup: String,
    },
    { versionKey: false }
  ).index({ serialNumber: 1 }, { unique: true }),
  "WalmartControlGroupUS"
);

export default WalmartControlGroupUS;
