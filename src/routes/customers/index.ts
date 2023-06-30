import { Express } from "express";

import routeHSN from "./routeHSN";
import routeInkTech from "./routeInkTech";
import routeLovetoner from "./routeLovetoner";
import routeMicroCenter from "./routeMicroCenter";
import routeWalgreens from "./routeWalgreens";
import routeWalmartCA from "./routeWalmartCA";
import routeWalmartUS from "./routeWalmartUS";

const customerRoutes = (app: Express) => {
  routeHSN(app);
  routeInkTech(app);
  routeLovetoner(app);
  routeMicroCenter(app);
  routeWalgreens(app);
  routeWalmartUS(app);
  routeWalmartCA(app);
};

export default customerRoutes;
