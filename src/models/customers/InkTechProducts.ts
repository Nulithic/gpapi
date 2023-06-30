import mongoose from "mongoose";

const InkTechProducts = mongoose.model(
  "ink_tech_products",
  new mongoose.Schema(
    {
      product: String,
      dear: String,
      price: Number,
      price_date: String,
      add_date: String,
    },
    { versionKey: false }
  ),
  "ink_tech_products"
);

export default InkTechProducts;
