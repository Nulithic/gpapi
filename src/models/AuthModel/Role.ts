import mongoose from "mongoose";

const RoleModel = mongoose.model(
  "roles",
  new mongoose.Schema(
    {
      role: String,
      parent: String || null,
      name: String,
      status: Boolean,
      children: [],
    },
    { versionKey: false }
  ),
  "roles"
);

export default RoleModel;
