import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Users from "models/auth/modelUser";

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await Users.findOne({ username: req.body.user });

    const newUser = {
      username: user.username,
      lastLogin: user.lastLogin,
      online: user.online,
      roles: user.roles,
      admin: user.admin,
      id: user._id,
    };

    res.status(200).send({ user: newUser });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const user = await Users.findOne({ username: req.body.username });
    if (!user) return res.status(404).send({ message: "User not found." });

    const verifyPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!verifyPassword) return res.status(404).send({ message: "Wrong password!" });

    const updatedUser = await Users.findOneAndUpdate({ username: req.body.username }, { lastLogin: new Date().toLocaleString("en-US"), online: true });
    const token = jwt.sign({ username: updatedUser.username }, process.env.AUTH_SECRET);

    res.status(200).send({ accessToken: token });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

export const userLogout = async (req: Request, res: Response) => {
  try {
    const user = await Users.findOne({ username: req.body.user });
    if (!user) return res.status(404).send({ message: "User not found." });
    await Users.findOneAndUpdate({ username: req.body.user }, { online: false });
    res.status(200).send({ message: "User logged out." });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

export const setStateCookie = (req: Request, res: Response) => {
  const encoded = Buffer.from(process.env.STATE_COOKIE).toString("base64");
  res.cookie("state", encoded);
  res.send("Cookie has been saved successfully");
};
