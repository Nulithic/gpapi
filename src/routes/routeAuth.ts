import { Express } from "express";

import verifyToken from "controllers/customers/auth/verifyToken";
import { getUser, setStateCookie, userLogin, userLogout } from "controllers/controllerAuth";

const routeAuth = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/get/user", [verifyToken], getUser);
  app.get("/api/get/set_state_cookie", setStateCookie);

  //POST
  app.post("/api/post/user/login", userLogin);
  app.post("/api/post/user/logout", [verifyToken], userLogout);
};

export default routeAuth;
