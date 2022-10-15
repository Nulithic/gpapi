import mongoose from "mongoose";

const DearProducts = mongoose.model(
  "dear_products",
  new mongoose.Schema(
    {
      product_code: String,
      barcode: String,
      average_cost: Number,
      price_tier: {
        low: Number,
        low_mid: Number,
        mid: Number,
        mid_high: Number,
        high: Number,
        flat_rate: Number,
      },
    },
    { versionKey: false }
  ),
  "dear_products"
);

export default DearProducts;
