import mongoose from "mongoose";

const CarrierCodes = mongoose.model(
  "WalmartCarrierCodes",
  new mongoose.Schema(
    {
      scac: String,
      company: String,
    },
    { versionKey: false }
  ),
  "WalmartCarrierCodes"
);

export default CarrierCodes;
