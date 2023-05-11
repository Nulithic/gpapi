import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import adminRoutes from "routes/admin";
import authRoutes from "routes/auth";
import customerRoutes from "routes/customer";
import warehouseRoutes from "routes/warehouse";
import dearRoutes from "routes/dear";
import logRoutes from "routes/log";

const app = express();
const port = process.env.PORT;

app.use(express.json({ limit: "10mb" }));
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: [],
  },
});

app.set("io", io);

adminRoutes(app);
authRoutes(app);
customerRoutes(app);
warehouseRoutes(app);
dearRoutes(app);
logRoutes(app);

io.on("connection", (socket) => {
  const count = io.engine.clientsCount;
  const query = socket.handshake.query;
  socket.on("user", (arg) => {
    console.log(`Total Clients: ${count} | User: ${arg.username} | Time: ${query.timeStamp}`);
  });
  socket.on("disconnect", (reason) => {
    console.log(reason);
  });
});

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL, {
    authSource: "admin",
  })
  .then(() => {
    console.log("Connected to GreenProject");
  })
  .catch((err) => {
    console.error("Connection Error", err);
    process.exit();
  });

server.listen(port, () => {
  console.log(`App is listening on port ${port}!`);
});
