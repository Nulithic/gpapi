import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import routeAdmin from "routes/routeAdmin";
import routeAuth from "routes/routeAuth";
import routeCustomers from "routes/customers";
import routeWarehouse from "routes/routesWarehouse";
import routeDear from "routes/routeDear";
import routeLog from "routes/routeLog";

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

routeAdmin(app);
routeAuth(app);
routeCustomers(app);
routeWarehouse(app);
routeDear(app);
routeLog(app);

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
