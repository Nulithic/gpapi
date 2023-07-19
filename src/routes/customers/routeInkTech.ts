import { Express } from "express";

import verifyToken from "controllers/customers/auth/verifyToken";

const routeInkTech = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  //Ink Technologies
  // app.get("/api/get/customer/ink_technologies/products", [verifyToken], customerControllers.getInkTechProducts);
  // app.post("/api/post/customer/ink_technologies/add/products", [verifyToken], customerControllers.postInkTechProducts);
  // app.post("/api/post/customer/ink_technologies/file", customerControllers.postInkTechFile);
  // app.post("/api/post/customer/ink_technologies/create/order", [verifyToken], customerControllers.postInkTechOrder);
  // app.post("/api/post/customer/ink_technologies/revisions", [verifyToken], customerControllers.postRevisions);
};

export default routeInkTech;
