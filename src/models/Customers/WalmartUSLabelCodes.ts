import mongoose from "mongoose";

const WalmartUSLabelCodes = mongoose.model(
  "WalmartUSLabelCodes",
  new mongoose.Schema(
    {
      purchaseOrderNumber: String,
      buyingParty: String,
      buyingPartyStreet: String,
      buyingPartyAddress: String,
      distributionCenterNumber: String,
      purchaseOrderType: String,
      departmentNumber: String,
      wmit: String,
      vsn: String,
      serialNumber: Number,
      type: String,
      sscc: String,
      date: String,
    },
    { versionKey: false }
  ).index({ serialNumber: 1 }, { unique: true }),
  "WalmartUSLabelCodes"
);

export default WalmartUSLabelCodes;
