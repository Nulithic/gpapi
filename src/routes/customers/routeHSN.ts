import { Express } from "express";

import verifyToken from "controllers/customers/auth/verifyToken";
import { postHSNImport } from "controllers/customers/controllerHSN";

const routeHSN = (app: Express) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, x-access-token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    next();
  });

  //HSN
  app.post("/api/post/customer/hsn/import", [verifyToken], postHSNImport);
};

export default routeHSN;
