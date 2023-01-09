import { Request, Response } from "express";
import { Server } from "socket.io";

import { getDearProducts } from "api/DearSystems";
import { DearModel } from "models";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const updateDearProducts = async (req: Request, res: Response) => {
  const socketID = req.query.socketID.toString();
  const io = req.app.get("io") as Server;

  const productList = await getDearProducts(io, socketID);

  let progress2 = 0;
  const productListSize = productList.length;
  io.to(socketID).emit("updateDearProductsMax", productListSize);
  for (let i = 0; i < productListSize; i++) {
    progress2 = progress2 + 1;
    io.to(socketID).emit("updateDearProducts", progress2);
    await sleep(10);
  }

  res.status(200).send(productList);
};
const updateDearLocations = async (req: Request, res: Response) => {
  const socketID = req.query.socketID.toString();
  const io = req.app.get("io") as Server;

  console.log(socketID);
  let progress = 0;
  let progress2 = 0;
  io.to(socketID).emit("getDearLocationsMax", 100);
  io.to(socketID).emit("updateDearLocationsMax", 100);

  for (let i = 0; i < 100; i++) {
    progress = progress + 1;
    io.to(socketID).emit("getDearLocations", progress);
    await sleep(10);
  }

  for (let i = 0; i < 100; i++) {
    progress2 = progress2 + 1;
    io.to(socketID).emit("updateDearLocations", progress2);
    await sleep(10);
  }

  res.status(200).send("updateDearLocations");
};
const updateDearInventory = async (req: Request, res: Response) => {
  const socketID = req.query.socketID.toString();
  const io = req.app.get("io") as Server;

  console.log(socketID);
  let progress = 0;
  let progress2 = 0;
  io.to(socketID).emit("getDearInventory", 100);
  io.to(socketID).emit("updateDearInventoryMax", 100);

  for (let i = 0; i < 100; i++) {
    progress = progress + 1;
    io.to(socketID).emit("getDearInventory", progress);
    await sleep(10);
  }

  for (let i = 0; i < 100; i++) {
    progress2 = progress2 + 1;
    io.to(socketID).emit("updateDearInventory", progress2);
    await sleep(10);
  }

  res.status(200).send("updateDearInventory");
};

const dearControllers = { updateDearProducts, updateDearLocations, updateDearInventory };
export default dearControllers;
