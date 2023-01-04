import mongoose from "mongoose";

const InventoryCount = mongoose.model(
  "InventoryCount",
  new mongoose.Schema({
    _id: String,
    name: String,
    date: String,
    info: String,
  }),
  "InventoryCount"
);

export default InventoryCount;
