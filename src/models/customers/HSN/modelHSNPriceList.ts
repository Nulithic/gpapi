import mongoose from "mongoose";

const HSNPriceList = mongoose.model(
  "HSNPriceList",
  new mongoose.Schema(
    {
      sku: String,
      upc: String,
      price: Number,
    },
    { versionKey: false }
  ),
  "HSNPriceList"
);

export default HSNPriceList;
