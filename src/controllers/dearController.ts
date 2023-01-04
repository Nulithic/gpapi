import { Request, Response } from "express";
import { Server } from "socket.io";

import { DearModel } from "models";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const updateDearProducts = async (req: Request, res: Response) => {
  const socketID = req.query.socketID.toString();
  const io = req.app.get("io") as Server;

  console.log(socketID);
  let progress = 0;
  let progress2 = 0;
  io.to(socketID).emit("updateDearProductsMax", 100);
  io.to(socketID).emit("asdfMax", 100);

  for (let i = 0; i < 100; i++) {
    progress = progress + 1;
    io.to(socketID).emit("updateDearProducts", progress);
    await sleep(10);
  }

  for (let i = 0; i < 100; i++) {
    progress2 = progress2 + 1;
    io.to(socketID).emit("asdf", progress2);
    await sleep(10);
  }

  res.status(200).send("updateDearProducts");
};

const dearControllers = { updateDearProducts };
export default dearControllers;
