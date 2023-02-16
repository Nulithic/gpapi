import { Express } from "express";

import verifyToken from "auth/verifyToken";
import log from "controllers/log";

const logRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/get/logs", [verifyToken], log.getLogs);
};

export default logRoutes;
