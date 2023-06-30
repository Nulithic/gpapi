import { Express } from "express";

import verifyToken from "auth/verifyToken";

const routeLovetoner = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  //Lovetoner
  // app.get("/api/get/customer/lovetoner/products", [verifyToken], customerControllers.getLovetonerProducts);
  // app.post("/api/post/customer/lovetoner/add/product", [verifyToken], customerControllers.postLovetonerProduct);
  // app.post("/api/post/customer/lovetoner/create/order", [verifyToken], customerControllers.postLovetonerOrder);
};

export default routeLovetoner;
