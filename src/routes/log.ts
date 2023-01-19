import { Express } from "express";

import verifyToken from "../middleware/verifyToken";
import logControllers from "../controllers/logControllers";

const logRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/get/logs", [verifyToken], logControllers.getLogs);
};

export default logRoutes;
