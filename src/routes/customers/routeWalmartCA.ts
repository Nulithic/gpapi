import { Express } from "express";

import verifyToken from "auth/verifyToken";
import { getWalmartOrdersCA } from "controllers/customers/controllerWalmartCA";

const routeWalmartCA = (app: Express) => {
  app.use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  app.get("/api/get/customer/walmart_ca/orders", [verifyToken], getWalmartOrdersCA);

  // app.post("/api/post/customer/walmart_ca/import/mft", [verifyToken], WalmartUS.postWalmartUSImportMFT);
  // app.post("/api/post/customer/walmart_ca/import/edi", [verifyToken], WalmartUS.postWalmartUSImportEDI);
  // app.post("/api/post/customer/walmart_ca/import/tracker", [verifyToken], WalmartUS.postWalmartUSImportTracker);
  // app.post("/api/post/customer/walmart_ca/import/location", [verifyToken], WalmartUS.postWalmartUSImportLocation);
  // app.post("/api/post/customer/walmart_ca/order/archive", [verifyToken], WalmartUS.postWalmartUSArchiveOrder);

  // app.post("/api/post/customer/walmart_ca/order/packing_slip", [verifyToken], WalmartUS.getWalmartUSPackingSlip);
  // app.post("/api/post/customer/walmart_ca/order/underlying_bol", [verifyToken], WalmartUS.getWalmartUSUnderlyingBOL);
  // app.post("/api/post/customer/walmart_ca/order/master_bol", [verifyToken], WalmartUS.getWalmartUSMasterBOL);

  // app.post("/api/post/customer/walmart_ca/order/case_label/check", [verifyToken], WalmartUS.checkWalmartUSCaseLabel);
  // app.post("/api/post/customer/walmart_ca/order/case_label", [verifyToken], WalmartUS.getWalmartUSCaseLabel);
  // app.post("/api/post/customer/walmart_ca/order/case_label/existing", [verifyToken], WalmartUS.getExistingWalmartUSCaseLabel);
  // app.post("/api/post/customer/walmart_ca/order/case_label/new", [verifyToken], WalmartUS.getNewWalmartUSCaseLabel);

  // app.post("/api/post/customer/walmart_ca/order/pallet_label/check", [verifyToken], WalmartUS.checkWalmartUSPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label", [verifyToken], WalmartUS.getWalmartUSPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/existing", [verifyToken], WalmartUS.getExistingWalmartUSPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/new", [verifyToken], WalmartUS.getNewWalmartUSPalletLabel);

  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/check", [verifyToken], WalmartUS.checkWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/create", [verifyToken], WalmartUS.submitWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/download", [verifyToken], WalmartUS.downloadWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/delete", [verifyToken], WalmartUS.deleteWalmartUSMultiPalletLabel);

  // app.get("/api/get/customer/walmart_ca/products", [verifyToken], WalmartUS.getWalmartUSProducts);
  // app.post("/api/post/customer/walmart_ca/products/add", [verifyToken], WalmartUS.addWalmartUSProducts);
  // app.post("/api/post/customer/walmart_ca/products/delete", [verifyToken], WalmartUS.deleteWalmartUSProducts);

  // app.post("/api/post/customer/walmart_ca/asn", [verifyToken], WalmartUS.postWalmartASN);
  // app.post("/api/post/customer/walmart_ca/invoice", [verifyToken], WalmartUS.postWalmartInvoice);
  // app.post("/api/post/customer/walmart_ca/sync", [verifyToken], WalmartUS.postWalmartSync);
};

export default routeWalmartCA;
