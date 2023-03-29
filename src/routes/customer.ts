import { Express } from "express";

import verifyToken from "auth/verifyToken";
import { MicroCenter, Walmart } from "controllers/customers";

const customerRoutes = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    next();
  });

  //Lovetoner
  // app.get("/api/get/customer/lovetoner/products", [verifyToken], customerControllers.getLovetonerProducts);
  // app.post("/api/post/customer/lovetoner/add/product", [verifyToken], customerControllers.postLovetonerProduct);
  // app.post("/api/post/customer/lovetoner/create/order", [verifyToken], customerControllers.postLovetonerOrder);

  //Ink Technologies
  // app.get("/api/get/customer/ink_technologies/products", [verifyToken], customerControllers.getInkTechProducts);
  // app.post("/api/post/customer/ink_technologies/add/products", [verifyToken], customerControllers.postInkTechProducts);
  // app.post("/api/post/customer/ink_technologies/file", customerControllers.postInkTechFile);
  // app.post("/api/post/customer/ink_technologies/create/order", [verifyToken], customerControllers.postInkTechOrder);
  // app.post("/api/post/customer/ink_technologies/revisions", [verifyToken], customerControllers.postRevisions);

  //FBA
  // app.post("/api/post/customer/fba/create/order", [verifyToken], customerControllers.postFBAOrder);

  //Micro Center
  app.get("/api/get/customer/micro_center/orders", [verifyToken], MicroCenter.getMicroCenterOrders);
  // app.post("/api/post/customer/micro_center/create/order", [verifyToken], customerControllers.postMicroCenterOrder);

  //Walgreens
  // app.post("/api/post/customer/walgreens/create/order", [verifyToken], customerControllers.postWalgreensOrder);

  //Walmart
  app.get("/api/get/customer/walmart/orders", [verifyToken], Walmart.getWalmartOrders);
  app.post("/api/post/customer/walmart/import/edi", [verifyToken], Walmart.postWalmartImportEDI);
  app.post("/api/post/customer/walmart/import/html", [verifyToken], Walmart.postWalmartImportHTML);
  app.post("/api/post/customer/walmart/import/b2b", [verifyToken], Walmart.postWalmartImportB2B);
  app.post("/api/post/customer/walmart/import/tracker", [verifyToken], Walmart.postWalmartImportTracker);
  app.post("/api/post/customer/walmart/import/location", [verifyToken], Walmart.postWalmartImportLocation);

  app.post("/api/post/customer/walmart/order/archive", [verifyToken], Walmart.postWalmartArchiveOrder);

  // app.post("/api/post/customer/walmart/order/packing_list", [verifyToken], Walmart.postWalmartPackingList);
  // app.post("/api/post/customer/walmart/order/underlying_bol", [verifyToken], customerControllers.postWalmartUnderlyingBOL);
  // app.post("/api/post/customer/walmart/order/master_bol", [verifyToken], customerControllers.postWalmartMasterBOL);
};

export default customerRoutes;
