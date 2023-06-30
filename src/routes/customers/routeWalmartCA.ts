import { Express } from "express";

import verifyToken from "auth/verifyToken";

const routeWalmartCA = (app: Express) => {
  app.use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  // app.get("/api/get/customer/walmart_us/orders", [verifyToken], WalmartUS.getWalmartUSOrders);

  // app.post("/api/post/customer/walmart_us/import/mft", [verifyToken], WalmartUS.postWalmartUSImportMFT);
  // app.post("/api/post/customer/walmart_us/import/edi", [verifyToken], WalmartUS.postWalmartUSImportEDI);
  // app.post("/api/post/customer/walmart_us/import/tracker", [verifyToken], WalmartUS.postWalmartUSImportTracker);
  // app.post("/api/post/customer/walmart_us/import/location", [verifyToken], WalmartUS.postWalmartUSImportLocation);
  // app.post("/api/post/customer/walmart_us/order/archive", [verifyToken], WalmartUS.postWalmartUSArchiveOrder);

  // app.post("/api/post/customer/walmart_us/order/packing_slip", [verifyToken], WalmartUS.getWalmartUSPackingSlip);
  // app.post("/api/post/customer/walmart_us/order/underlying_bol", [verifyToken], WalmartUS.getWalmartUSUnderlyingBOL);
  // app.post("/api/post/customer/walmart_us/order/master_bol", [verifyToken], WalmartUS.getWalmartUSMasterBOL);

  // app.post("/api/post/customer/walmart_us/order/case_label/check", [verifyToken], WalmartUS.checkWalmartUSCaseLabel);
  // app.post("/api/post/customer/walmart_us/order/case_label", [verifyToken], WalmartUS.getWalmartUSCaseLabel);
  // app.post("/api/post/customer/walmart_us/order/case_label/existing", [verifyToken], WalmartUS.getExistingWalmartUSCaseLabel);
  // app.post("/api/post/customer/walmart_us/order/case_label/new", [verifyToken], WalmartUS.getNewWalmartUSCaseLabel);

  // app.post("/api/post/customer/walmart_us/order/pallet_label/check", [verifyToken], WalmartUS.checkWalmartUSPalletLabel);
  // app.post("/api/post/customer/walmart_us/order/pallet_label", [verifyToken], WalmartUS.getWalmartUSPalletLabel);
  // app.post("/api/post/customer/walmart_us/order/pallet_label/existing", [verifyToken], WalmartUS.getExistingWalmartUSPalletLabel);
  // app.post("/api/post/customer/walmart_us/order/pallet_label/new", [verifyToken], WalmartUS.getNewWalmartUSPalletLabel);

  // app.post("/api/post/customer/walmart_us/order/pallet_label/multi/check", [verifyToken], WalmartUS.checkWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_us/order/pallet_label/multi/create", [verifyToken], WalmartUS.submitWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_us/order/pallet_label/multi/download", [verifyToken], WalmartUS.downloadWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_us/order/pallet_label/multi/delete", [verifyToken], WalmartUS.deleteWalmartUSMultiPalletLabel);

  // app.get("/api/get/customer/walmart_us/products", [verifyToken], WalmartUS.getWalmartUSProducts);
  // app.post("/api/post/customer/walmart_us/products/add", [verifyToken], WalmartUS.addWalmartUSProducts);
  // app.post("/api/post/customer/walmart_us/products/delete", [verifyToken], WalmartUS.deleteWalmartUSProducts);

  // app.post("/api/post/customer/walmart_us/asn", [verifyToken], WalmartUS.postWalmartASN);
  // app.post("/api/post/customer/walmart_us/invoice", [verifyToken], WalmartUS.postWalmartInvoice);
  // app.post("/api/post/customer/walmart_us/sync", [verifyToken], WalmartUS.postWalmartSync);
};

export default routeWalmartCA;
