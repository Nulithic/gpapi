import { Express } from "express";

import verifyToken from "auth/verifyToken";
import auth from "controllers/auth";

const authRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/get/user", [verifyToken], auth.getUser);
  app.get("/api/get/set_state_cookie", auth.setStateCookie);

  //POST
  app.post("/api/post/user/login", auth.userLogin);
  app.post("/api/post/user/logout", [verifyToken], auth.userLogout);
};

export default authRoutes;
