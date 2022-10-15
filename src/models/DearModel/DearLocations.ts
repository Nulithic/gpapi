import mongoose from "mongoose";

const DearLocations = mongoose.model(
  "dear_locations",
  new mongoose.Schema(
    {
      location_id: String,
      site: String,
      bin: String,
      location: String,
    },
    { versionKey: false }
  ),
  "dear_locations"
);

export default DearLocations;
