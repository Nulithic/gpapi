import { Express } from "express";

import verifyToken from "auth/verifyToken";
import authControllers from "controllers/authController";

const authRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/get/user", [verifyToken], authControllers.getUser);

  //POST
  app.post("/api/post/user/login", authControllers.userLogin);
  app.post("/api/post/user/logout", [verifyToken], authControllers.userLogout);
};

export default authRoutes;
