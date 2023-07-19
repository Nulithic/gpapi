import { Express } from "express";

import verifyToken from "controllers/customers/auth/verifyToken";
import {
  addWalmartProducts,
  archiveWalmartOrder,
  checkWalmartCaseLabel,
  checkWalmartMultiPalletLabel,
  checkWalmartPalletLabel,
  deleteWalmartMultiPalletLabel,
  deleteWalmartProducts,
  downloadWalmartMultiPalletLabel,
  getExistingWalmartCaseLabel,
  getExistingWalmartPalletLabel,
  getNewWalmartCaseLabel,
  getNewWalmartPalletLabel,
  getWalmartCaseLabel,
  getWalmartMasterBOL,
  getWalmartOrders,
  getWalmartPackingSlip,
  getWalmartPalletLabel,
  getWalmartProducts,
  getWalmartUnderlyingBOL,
  importWalmartLocation,
  importWalmartOrdersEDI,
  importWalmartOrdersMFT,
  downloadWalmartMFT,
  importWalmartTracker,
  postWalmartASN,
  postWalmartInvoice,
  postWalmartSync,
  submitWalmartMultiPalletLabel,
} from "controllers/customers/controllerWalmartCA";

const routeWalmartCA = (app: Express) => {
  app.use((_, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  app.get("/api/get/customer/walmart_ca/orders", [verifyToken], getWalmartOrders);

  app.post("/api/post/customer/walmart_ca/download/mft", [verifyToken], downloadWalmartMFT);
  app.post("/api/post/customer/walmart_ca/import/mft", [verifyToken], importWalmartOrdersMFT);

  app.post("/api/post/customer/walmart_ca/import/edi", [verifyToken], importWalmartOrdersEDI);
  // app.post("/api/post/customer/walmart_ca/import/tracker", [verifyToken], WalmartUS.postWalmartUSImportTracker);
  // app.post("/api/post/customer/walmart_ca/import/location", [verifyToken], WalmartUS.postWalmartUSImportLocation);
  // app.post("/api/post/customer/walmart_ca/order/archive", [verifyToken], WalmartUS.postWalmartUSArchiveOrder);

  app.post("/api/post/customer/walmart_ca/order/packing_slip", [verifyToken], getWalmartPackingSlip);
  // app.post("/api/post/customer/walmart_ca/order/underlying_bol", [verifyToken], WalmartUS.getWalmartUSUnderlyingBOL);
  // app.post("/api/post/customer/walmart_ca/order/master_bol", [verifyToken], WalmartUS.getWalmartUSMasterBOL);

  app.post("/api/post/customer/walmart_ca/order/case_label/check", [verifyToken], checkWalmartCaseLabel);
  app.post("/api/post/customer/walmart_ca/order/case_label", [verifyToken], getWalmartCaseLabel);
  app.post("/api/post/customer/walmart_ca/order/case_label/existing", [verifyToken], getExistingWalmartCaseLabel);
  app.post("/api/post/customer/walmart_ca/order/case_label/new", [verifyToken], getNewWalmartCaseLabel);

  app.post("/api/post/customer/walmart_ca/order/pallet_label/check", [verifyToken], checkWalmartPalletLabel);
  app.post("/api/post/customer/walmart_ca/order/pallet_label", [verifyToken], getWalmartPalletLabel);
  app.post("/api/post/customer/walmart_ca/order/pallet_label/existing", [verifyToken], getExistingWalmartPalletLabel);
  app.post("/api/post/customer/walmart_ca/order/pallet_label/new", [verifyToken], getNewWalmartPalletLabel);

  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/check", [verifyToken], WalmartUS.checkWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/create", [verifyToken], WalmartUS.submitWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/download", [verifyToken], WalmartUS.downloadWalmartUSMultiPalletLabel);
  // app.post("/api/post/customer/walmart_ca/order/pallet_label/multi/delete", [verifyToken], WalmartUS.deleteWalmartUSMultiPalletLabel);

  // app.get("/api/get/customer/walmart_ca/products", [verifyToken], WalmartUS.getWalmartUSProducts);
  // app.post("/api/post/customer/walmart_ca/products/add", [verifyToken], WalmartUS.addWalmartUSProducts);
  // app.post("/api/post/customer/walmart_ca/products/delete", [verifyToken], WalmartUS.deleteWalmartUSProducts);

  app.post("/api/post/customer/walmart_ca/asn", [verifyToken], postWalmartASN);
  app.post("/api/post/customer/walmart_ca/invoice", [verifyToken], postWalmartInvoice);
  app.post("/api/post/customer/walmart_ca/sync", [verifyToken], postWalmartSync);
};

export default routeWalmartCA;
