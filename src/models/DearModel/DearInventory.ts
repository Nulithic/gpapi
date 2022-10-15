import mongoose from "mongoose";

const DearInventory = mongoose.model(
  "dear_inventory",
  new mongoose.Schema(
    {
      sku: String,
      name: String,
      site: String,
      bin: String,
      location_id: String,
      location: String,
      on_hand: Number,
      allocated: Number,
      available: Number,
      on_order: Number,
      stock_on_hand: Number,
    },
    { versionKey: false }
  ),
  "dear_inventory"
);

export default DearInventory;
