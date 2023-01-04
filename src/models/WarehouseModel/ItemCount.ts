import mongoose from "mongoose";

const ItemCount = mongoose.model(
  "ItemCount",
  new mongoose.Schema({
    _id: String,
    parent: String,
    bin: String,
    upc: String,
    sku: String,
    caseSize: Number,
    caseQty: Number,
    loose: Number,
    totalQty: Number,
    po: String,
    comment: String,
    date: String,
  }),
  "ItemCount"
);

export default ItemCount;
