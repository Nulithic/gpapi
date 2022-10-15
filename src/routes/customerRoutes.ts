import { Express } from "express";

import verifyToken from "../middleware/verifyToken";
import customerControllers from "../controllers/customerControllers";

const customerRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //Lovetoner
  app.get("/api/get/customer/lovetoner/products", [verifyToken], customerControllers.getLovetonerProducts);
  app.post("/api/post/customer/lovetoner/add/product", [verifyToken], customerControllers.postLovetonerProduct);
  app.post("/api/post/customer/lovetoner/create/order", [verifyToken], customerControllers.postLovetonerOrder);

  //Ink Technologies
  app.get("/api/get/customer/ink_technologies/products", [verifyToken], customerControllers.getInkTechProducts);
  app.post("/api/post/customer/ink_technologies/add/products", [verifyToken], customerControllers.postInkTechProducts);
  app.post("/api/post/customer/ink_technologies/file", customerControllers.postInkTechFile);
  app.post("/api/post/customer/ink_technologies/create/order", [verifyToken], customerControllers.postInkTechOrder);
  app.post("/api/post/customer/ink_technologies/revisions", [verifyToken], customerControllers.postRevisions);

  //FBA
  app.post("/api/post/customer/fba/create/order", [verifyToken], customerControllers.postFBAOrder);

  //Micro Center
  app.post("/api/post/customer/micro_center/create/order", [verifyToken], customerControllers.postMicroCenterOrder);

  //Walgreens
  app.post("/api/post/customer/walgreens/create/order", [verifyToken], customerControllers.postWalgreensOrder);

  //Walmart
  app.get("/api/get/customer/walmart/orders", [verifyToken], customerControllers.getWalmartOrderList);
  app.post("/api/post/customer/walmart/importer/edi", [verifyToken], customerControllers.postWalmartImporterEDI);
  app.post("/api/post/customer/walmart/importer/html", [verifyToken], customerControllers.postWalmartImporterHTML);
  app.post("/api/post/customer/walmart/importer/tracker", [verifyToken], customerControllers.postWalmartImporterTracker);
  app.post("/api/post/customer/walmart/importer/location", [verifyToken], customerControllers.postWalmartImporterLocation);

  app.post("/api/post/customer/walmart/order/packing_slip", [verifyToken], customerControllers.postWalmartPackingSlip);
  app.post("/api/post/customer/walmart/order/underlying_bol", [verifyToken], customerControllers.postWalmartUnderlyingBOL);
  app.post("/api/post/customer/walmart/order/master_bol", [verifyToken], customerControllers.postWalmartMasterBOL);
};

export default customerRoutes;
