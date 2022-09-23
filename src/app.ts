import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";

const app: Application = express();
const port: number = 3001;

console.log(process.env.TEST);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to GreenProjectDB");
  })
  .catch((err) => {
    console.error("Connection Error", err);
    process.exit();
  });

app.listen(port, () => {
  console.log(`App is listening on port ${port} !`);
});
