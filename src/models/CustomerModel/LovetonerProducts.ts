import mongoose from "mongoose";

const LovetonerProducts = mongoose.model(
  "lovetoner_products",
  new mongoose.Schema(
    {
      product: String,
      dear: Array,
      date: String,
    },
    { versionKey: false }
  ),
  "lovetoner_products"
);

export default LovetonerProducts;
