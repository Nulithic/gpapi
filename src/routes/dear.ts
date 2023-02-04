import { Express } from "express";

import verifyToken from "auth/verifyToken";
import dear from "controllers/dear";

const dearRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  app.get("/api/get/dear/locations", [verifyToken], dear.getDearLocations);
  app.get("/api/get/dear/products", [verifyToken], dear.getDearProducts);
  app.get("/api/get/dear/inventory", [verifyToken], dear.getDearInventory);
  // app.get("/api/get/dear/sale_list", [verifyToken], dearControllers.getDearSaleList);
  // app.post("/api/post/dear/sale_order_id", [verifyToken], dearControllers.getDearSaleOrderByID);

  app.get("/api/get/dear/update_locations", [verifyToken], dear.updateDearLocations);
  app.get("/api/get/dear/update_products", [verifyToken], dear.updateDearProducts);
  app.get("/api/get/dear/update_inventory", [verifyToken], dear.updateDearInventory);
  // app.get("/api/get/dear/update_sale_list", [verifyToken], dearControllers.updateDearSaleList);
};

export default dearRoutes;
