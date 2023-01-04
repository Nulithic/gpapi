import mongoose from "mongoose";

const DearLocations = mongoose.model(
  "DearLocations",
  new mongoose.Schema(
    {
      locationID: String,
      site: String,
      bin: String,
      location: String,
    },
    { versionKey: false }
  ),
  "DearLocations"
);

export default DearLocations;
