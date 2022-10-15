import { Express } from "express";

import verifyToken from "../middleware/verifyToken";
import warehouseControllers from "../controllers/warehouseControllers";

const warehouseRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //GET
  app.get("/api/get/warehouse/bulk_ship/template", [verifyToken], warehouseControllers.getBulkShipTemplate);
  app.get("/api/get/warehouse/compare/template", [verifyToken], warehouseControllers.getCompareTemplate);
  app.get("/api/get/warehouse/transfer/template", [verifyToken], warehouseControllers.getTransferTemplate);
  app.get("/api/get/warehouse/inventory_count/template", [verifyToken], warehouseControllers.getInventoryCountTemplate);
  app.get("/api/get/warehouse/inventory_count/list", [verifyToken], warehouseControllers.getInventoryCountList);
  app.get("/api/get/warehouse/inventory_count/current", [verifyToken], warehouseControllers.getCurrentCount);

  //POST
  app.post("/api/post/warehouse/bulk_ship", [verifyToken], warehouseControllers.postBulkShip);
  app.post("/api/post/warehouse/compare", [verifyToken], warehouseControllers.postCompare);
  app.post("/api/post/warehouse/transfer", [verifyToken], warehouseControllers.postWarehouseTransfer);
  app.post("/api/post/warehouse/inventory_count/add/count", [verifyToken], warehouseControllers.addInventoryCount);
  app.post("/api/post/warehouse/inventory_count/add/item_count", [verifyToken], warehouseControllers.addItemCount);
  app.post("/api/post/warehouse/inventory_count/delete/count", [verifyToken], warehouseControllers.deleteInventoryCount);
  app.post("/api/post/warehouse/inventory_count/delete/item_count", [verifyToken], warehouseControllers.deleteItemCount);
};

export default warehouseRoutes;
