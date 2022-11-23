import mongoose from "mongoose";

const RoleModel = mongoose.model(
  "Roles",
  new mongoose.Schema(
    {
      role: String,
      parent: String || null,
      path: String,
      name: String,
      status: Boolean,
      children: [],
    },
    { versionKey: false }
  ),
  "Roles"
);

export default RoleModel;
