import mongoose from "mongoose";

const UserModel = mongoose.model(
  "users",
  new mongoose.Schema(
    {
      username: String,
      password: String,
      last_login: String,
      online: Boolean,
      roles: [],
      admin: Boolean,
    },
    { versionKey: false }
  ),
  "users"
);

export default UserModel;
