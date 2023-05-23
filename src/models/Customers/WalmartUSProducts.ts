import mongoose from "mongoose";

const WalmartUSProducts = mongoose.model(
  "WalmartUSProducts",
  new mongoose.Schema(
    {
      walmartItem: String,
      type: String,
      package: String,
      department: String,
      itemID: String,
      vsn: String,
      sku: String,
      description: String,
      productGTIN: String,
      whiteBoxGTIN: String,
      brownBoxGTIN: String,
      caseSize: String,
    },
    { versionKey: false }
  ),
  "WalmartUSProducts"
);

export default WalmartUSProducts;
