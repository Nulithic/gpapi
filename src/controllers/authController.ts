import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { AuthModel } from "models";

const getUser = (req: Request, res: Response) => {
  AuthModel.User.findOne({ username: req.body.user }, (err: any, user: any) => {
    if (err) return res.status(500).send({ message: err });

    const newUser = {
      username: user.username,
      lastLogin: user.lastLogin,
      online: user.online,
      roles: user.roles,
      admin: user.admin,
    };

    res.status(200).send({ user: newUser });
  });
};

const userLogin = (req: Request, res: Response) => {
  AuthModel.User.findOne({ username: req.body.username }, (err: any, user: any) => {
    if (err) return res.status(500).send({ message: err.message });
    if (!user) return res.status(404).send({ message: "User not found." });

    const verifyPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!verifyPassword) return res.status(404).send({ message: "Wrong password!" });

    AuthModel.User.findOneAndUpdate(
      { username: req.body.username },
      { lastLogin: new Date().toLocaleString("en-US"), online: true },
      (err: any, updatedUser: any) => {
        if (err) return res.status(500).send({ message: err });

        const token = jwt.sign({ username: updatedUser.username }, process.env.AUTH_SECRET);
        res.status(200).send({ accessToken: token });
      }
    );
  });
};

const userLogout = (req: Request, res: Response) => {
  AuthModel.User.findOne({ username: req.body.user }, (err: any, user: any) => {
    if (err) return res.status(500).send({ message: err.message });
    if (!user) return res.status(404).send({ message: "User not found." });

    AuthModel.User.findOneAndUpdate({ username: req.body.user }, { online: false }, (err: any) => {
      if (err) return res.status(500).send({ message: err });
      res.status(200).send({ message: "User logged out." });
    });
  });
};

const authControllers = {
  getUser,
  userLogin,
  userLogout,
};
export default authControllers;
