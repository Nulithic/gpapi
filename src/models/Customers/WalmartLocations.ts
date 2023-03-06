import mongoose from "mongoose";

const WalmartLocation = mongoose.model(
  "walmart_location",
  new mongoose.Schema(
    {
      division: String,
      store_number: String,
      global_location_number: String,
      duns: String,
      address_type: String,
      vendor_country: String,
      vendor_state: String,
      address_line_1: String,
      address_line_2: String,
      address_line_3: String,
      address_line_4: String,
      city: String,
      state: String,
      zip_code: String,
      store_country: String,
      telephone: String,
      extension: String,
      effective_date: String,
      expiration_date: String,
    },
    { versionKey: false }
  ),
  "walmart_location"
);

export default WalmartLocation;
