import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("x-access-token");
  if (!token) return res.status(403).send({ message: "No Token Provided." });

  jwt.verify(token, process.env.AUTH_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).send({ message: "Unauthorized, please try again." });
    req.body.user = decoded.username;
    next();
  });
};

export default verifyToken;
