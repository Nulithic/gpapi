import mongoose from "mongoose";

const WalmartShippingLabelUS = mongoose.model(
  "WalmartShippingLabelUS",
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
      numberOfCases: Number,
      serialNumber: Number,
      type: String,
      multiPallet: String,
      multiPalletID: Number,
      sscc: String,
      date: String,
    },
    { versionKey: false }
  ).index({ serialNumber: 1 }, { unique: true }),
  "WalmartShippingLabelUS"
);

export default WalmartShippingLabelUS;
