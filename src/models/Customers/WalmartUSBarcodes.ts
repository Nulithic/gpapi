import mongoose from "mongoose";

const WalmartUSBarcodes = mongoose.model(
  "WalmartUSBarcodes",
  new mongoose.Schema(
    {
      sscc18: String,
      poNumber: String,
      type: String,
      sku: String,
      date: String,
    },
    { versionKey: false }
  ),
  "WalmartUSBarcodes"
);

export default WalmartUSBarcodes;
