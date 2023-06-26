import { Express } from "express";

import verifyToken from "auth/verifyToken";
import { BulkShip, Compare, Transfer } from "controllers/warehouse";

const warehouseRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  // app.get("/api/get/warehouse/inventory_count/template", [verifyToken], warehouseControllers.getInventoryCountTemplate);
  // app.get("/api/get/warehouse/inventory_count/list", [verifyToken], warehouseControllers.getInventoryCountList);
  // app.get("/api/get/warehouse/inventory_count/current", [verifyToken], warehouseControllers.getCurrentCount);
  // app.post("/api/post/warehouse/inventory_count/add/count", [verifyToken], warehouseControllers.addInventoryCount);
  // app.post("/api/post/warehouse/inventory_count/add/item_count", [verifyToken], warehouseControllers.addItemCount);
  // app.post("/api/post/warehouse/inventory_count/delete/count", [verifyToken], warehouseControllers.deleteInventoryCount);
  // app.post("/api/post/warehouse/inventory_count/delete/item_count", [verifyToken], warehouseControllers.deleteItemCount);

  app.get("/api/get/warehouse/bulk_ship/template", [verifyToken], BulkShip.getBulkShipTemplate);
  app.post("/api/post/warehouse/bulk_ship", [verifyToken], BulkShip.postBulkShip);

  app.get("/api/get/warehouse/compare/template", [verifyToken], Compare.getCompareTemplate);
  app.post("/api/post/warehouse/compare", [verifyToken], Compare.postCompare);

  app.get("/api/get/warehouse/transfer/template", [verifyToken], Transfer.getTransferTemplate);
  app.post("/api/post/warehouse/transfer", [verifyToken], Transfer.postTransfer);
};

export default warehouseRoutes;
