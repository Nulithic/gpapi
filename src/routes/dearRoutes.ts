import { Express } from "express";

import verifyToken from "auth/verifyToken";
import dearControllers from "controllers/dearController";

const dearRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  // app.get("/api/get/dear/locations", [verifyToken], dearControllers.getDearLocations);
  // app.get("/api/get/dear/inventory", [verifyToken], dearControllers.getDearInventory);
  // app.get("/api/get/dear/products", [verifyToken], dearControllers.getDearProducts);
  // app.get("/api/get/dear/sale_list", [verifyToken], dearControllers.getDearSaleList);
  // app.post("/api/post/dear/sale_order_id", [verifyToken], dearControllers.getDearSaleOrderByID);

  app.get("/api/get/dear/update_products", [verifyToken], dearControllers.updateDearProducts);
  // app.get("/api/get/dear/update_locations", [verifyToken], dearControllers.updateDearLocations);
  // app.get("/api/get/dear/update_inventory", [verifyToken], dearControllers.updateDearInventory);
  // app.get("/api/get/dear/update_sale_list", [verifyToken], dearControllers.updateDearSaleList);
};

export default dearRoutes;
