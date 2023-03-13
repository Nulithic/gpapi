import mongoose from "mongoose";

const WalmartLocation = mongoose.model(
  "WalmartLocation",
  new mongoose.Schema(
    {
      division: String,
      storeNumber: String,
      gln: String,
      duns: String,
      addressType: String,
      vendorCountry: String,
      vendorState: String,
      addressLine1: String,
      addressLine2: String,
      addressLine3: String,
      addressLine4: String,
      city: String,
      state: String,
      zipCode: String,
      storeCountry: String,
      telephone: String,
      extension: String,
      effectiveDate: String,
      expirationDate: String,
    },
    { versionKey: false }
  ),
  "WalmartLocation"
);

export default WalmartLocation;
