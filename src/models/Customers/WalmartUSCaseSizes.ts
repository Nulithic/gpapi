import mongoose from "mongoose";

const WalmartUSCaseSizes = mongoose.model(
  "WalmartUSCaseSizes",
  new mongoose.Schema(
    {
      walmartItem: String,
      itemID: String,
      vsn: String,
      sku: String,
      description: String,
      caseSize: String,
    },
    { versionKey: false }
  ),
  "WalmartUSCaseSizes"
);

export default WalmartUSCaseSizes;
