import mongoose from "mongoose";

const CarrierCodes = mongoose.model(
  "CarrierCodes",
  new mongoose.Schema(
    {
      scac: String,
      company: String,
    },
    { versionKey: false }
  ),
  "CarrierCodes"
);

export default CarrierCodes;
