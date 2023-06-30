import { Express } from "express";

import verifyToken from "auth/verifyToken";

const routeWalgreens = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  //Walgreens
  // app.post("/api/post/customer/walgreens/create/order", [verifyToken], customerControllers.postWalgreensOrder);
};

export default routeWalgreens;
