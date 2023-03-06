import mongoose from "mongoose";

const DearInventory = mongoose.model(
  "DearInventory",
  new mongoose.Schema(
    {
      sku: String,
      name: String,
      site: String,
      bin: String,
      locationID: String,
      location: String,
      onHand: Number,
      allocated: Number,
      available: Number,
      onOrder: Number,
      stockOnHand: Number,
    },
    { versionKey: false }
  ),
  "DearInventory"
);

export default DearInventory;
