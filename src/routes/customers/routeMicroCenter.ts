import { Express } from "express";

import verifyToken from "controllers/customers/auth/verifyToken";
import { getMicroCenterOrders } from "controllers/customers/controllerMicroCenter";

const routeMicroCenter = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  //Micro Center
  app.get("/api/get/customer/micro_center/orders", [verifyToken], getMicroCenterOrders);
  // app.post("/api/post/customer/micro_center/create/order", [verifyToken], customerControllers.postMicroCenterOrder);
};

export default routeMicroCenter;
