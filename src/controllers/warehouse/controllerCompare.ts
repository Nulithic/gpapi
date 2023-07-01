import { Request, Response } from "express";
import path from "path";

import { getDearSaleOrderAPI, postDearSaleFulfilmentShipAPI } from "api/DearSystems";
import { userAction } from "utilities/userAction";
import sleep from "utilities/sleep";
import { Dear } from "models";

export const getCompareTemplate = (req: Request, res: Response) => {
  userAction(req.body.user, "getCompareTemplate");
  const directoryPath = path.dirname(require.main.filename) + "/resources/downloads/";
  res.download(directoryPath + "CompareTemplate.xlsx", "CompareTemplate.xlsx", (err) => {
    if (err) res.status(500);
  });
};

export const postCompare = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postCompare");

    const importData = req.body.importData;
    const site = req.body.location;

    const products = await Dear.DearProducts.find();
    const inventory = await Dear.DearInventory.find();

    const list = [];
    for (let data of importData) {
      if (data.Bin === "") data.Bin = null;

      const checkProduct = products.some((item) => item.sku === data.SKU);
      if (!checkProduct) {
        list.push({ ...data, dearStock: 0, status: "Product Not Found" });
        continue;
      }

      const checkLocation = inventory.filter((item) => item.site === site && item.bin === data.Bin && item.sku === data.SKU);
      const product = products.find((item) => item.sku === data.SKU);
      if (checkLocation.length === 0) {
        list.push({ ...data, dearStock: 0, cost: product.averageCost, status: "No Stock in Location", adjustment: "Zero" });
        continue;
      }

      const checkEqual = checkLocation.filter((item) => item.onHand === data.Quantity);
      if (checkEqual.length > 0) {
        list.push({ ...data, dearStock: checkEqual[0].onHand, status: "Equal", adjustment: "NonZero" });
        continue;
      }

      const checkNotEqual = checkLocation.filter((item) => item.onHand !== data.Quantity);
      if (checkNotEqual.length > 0) {
        list.push({ ...data, dearStock: checkNotEqual[0].onHand, status: "Not Equal", adjustment: "NonZero" });
        continue;
      }
    }

    res.status(200).send(list);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
