import { Express } from "express";

import verifyToken from "auth/verifyToken";
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
  importWalmartOrdersB2B,
  importWalmartOrdersEDI,
  importWalmartOrdersMFT,
  importWalmartTracker,
  postWalmartASN,
  postWalmartInvoice,
  postWalmartSync,
  submitWalmartMultiPalletLabel,
} from "controllers/customers/controllerWalmartUS";

const routeWalmartUS = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  app.get("/api/get/customer/walmart_us/orders", [verifyToken], getWalmartOrders);

  app.post("/api/post/customer/walmart_us/import/mft", [verifyToken], importWalmartOrdersMFT);
  app.post("/api/post/customer/walmart_us/import/edi", [verifyToken], importWalmartOrdersEDI);
  app.post("/api/post/customer/walmart_us/import/b2b", [verifyToken], importWalmartOrdersB2B);
  app.post("/api/post/customer/walmart_us/import/tracker", [verifyToken], importWalmartTracker);
  app.post("/api/post/customer/walmart_us/import/location", [verifyToken], importWalmartLocation);

  app.post("/api/post/customer/walmart_us/order/archive", [verifyToken], archiveWalmartOrder);

  app.post("/api/post/customer/walmart_us/order/packing_slip", [verifyToken], getWalmartPackingSlip);
  app.post("/api/post/customer/walmart_us/order/underlying_bol", [verifyToken], getWalmartUnderlyingBOL);
  app.post("/api/post/customer/walmart_us/order/master_bol", [verifyToken], getWalmartMasterBOL);

  app.post("/api/post/customer/walmart_us/order/case_label/check", [verifyToken], checkWalmartCaseLabel);
  app.post("/api/post/customer/walmart_us/order/case_label", [verifyToken], getWalmartCaseLabel);
  app.post("/api/post/customer/walmart_us/order/case_label/existing", [verifyToken], getExistingWalmartCaseLabel);
  app.post("/api/post/customer/walmart_us/order/case_label/new", [verifyToken], getNewWalmartCaseLabel);

  app.post("/api/post/customer/walmart_us/order/pallet_label/check", [verifyToken], checkWalmartPalletLabel);
  app.post("/api/post/customer/walmart_us/order/pallet_label", [verifyToken], getWalmartPalletLabel);
  app.post("/api/post/customer/walmart_us/order/pallet_label/existing", [verifyToken], getExistingWalmartPalletLabel);
  app.post("/api/post/customer/walmart_us/order/pallet_label/new", [verifyToken], getNewWalmartPalletLabel);

  app.post("/api/post/customer/walmart_us/order/pallet_label/multi/check", [verifyToken], checkWalmartMultiPalletLabel);
  app.post("/api/post/customer/walmart_us/order/pallet_label/multi/create", [verifyToken], submitWalmartMultiPalletLabel);
  app.post("/api/post/customer/walmart_us/order/pallet_label/multi/download", [verifyToken], downloadWalmartMultiPalletLabel);
  app.post("/api/post/customer/walmart_us/order/pallet_label/multi/delete", [verifyToken], deleteWalmartMultiPalletLabel);

  app.get("/api/get/customer/walmart_us/products", [verifyToken], getWalmartProducts);
  app.post("/api/post/customer/walmart_us/products/add", [verifyToken], addWalmartProducts);
  app.post("/api/post/customer/walmart_us/products/delete", [verifyToken], deleteWalmartProducts);

  app.post("/api/post/customer/walmart_us/asn", [verifyToken], postWalmartASN);
  app.post("/api/post/customer/walmart_us/invoice", [verifyToken], postWalmartInvoice);
  app.post("/api/post/customer/walmart_us/sync", [verifyToken], postWalmartSync);
};

export default routeWalmartUS;
