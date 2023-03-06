import mongoose from "mongoose";

const UserModel = mongoose.model(
  "Users",
  new mongoose.Schema(
    {
      username: String,
      password: String,
      lastLogin: String,
      online: Boolean,
      roles: [],
      admin: Boolean,
    },
    { versionKey: false }
  ),
  "Users"
);

export default UserModel;
