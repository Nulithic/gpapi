import { Express } from "express";

import verifyToken from "auth/verifyToken";
import { MicroCenter, WalmartUS, HSN } from "controllers/customers";

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
  app.get("/api/get/customer/walmart_us/orders", [verifyToken], WalmartUS.getWalmartUSOrders);
  app.post("/api/post/customer/walmart_us/import/edi", [verifyToken], WalmartUS.postWalmartUSImportEDI);
  app.post("/api/post/customer/walmart_us/import/html", [verifyToken], WalmartUS.postWalmartUSImportHTML);
  app.post("/api/post/customer/walmart_us/import/b2b", [verifyToken], WalmartUS.postWalmartUSImportB2B);
  app.post("/api/post/customer/walmart_us/import/tracker", [verifyToken], WalmartUS.postWalmartUSImportTracker);
  app.post("/api/post/customer/walmart_us/import/location", [verifyToken], WalmartUS.postWalmartUSImportLocation);
  app.post("/api/post/customer/walmart_us/order/archive", [verifyToken], WalmartUS.postWalmartUSArchiveOrder);

  app.post("/api/post/customer/hsn/import", [verifyToken], HSN.postHSNImport);
};

export default customerRoutes;
