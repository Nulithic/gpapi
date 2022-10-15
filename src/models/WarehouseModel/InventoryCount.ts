import mongoose from "mongoose";

const InventoryCount = mongoose.model(
  "inventory_count",
  new mongoose.Schema({
    name: String,
    date: String,
    info: String,
    counts: [
      {
        sku: String,
        upc: String,
        bin: String,
        case_size: Number,
        case_qty: Number,
        loose: Number,
        total_qty: Number,
        po: String,
        comment: String,
        date: String,
      },
    ],
  }),
  "inventory_count"
);

export default InventoryCount;
