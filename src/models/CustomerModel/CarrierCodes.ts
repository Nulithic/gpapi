import mongoose from "mongoose";

const CarrierCodes = mongoose.model(
  "carrier_codes",
  new mongoose.Schema(
    {
      scac_code: String,
      company_name: String,
    },
    { versionKey: false }
  ),
  "carrier_codes"
);

export default CarrierCodes;
