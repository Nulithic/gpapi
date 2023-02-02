import { Request, Response } from "express";
import path from "path";

import { getDearSaleOrderAPI, postDearSaleFulfilmentShipAPI } from "api/DearSystems";
import { userAction } from "utilities/userAction";
import sleep from "utilities/sleep";

const getBulkShipTemplate = (req: Request, res: Response) => {
  userAction(req.body.user, "getBulkShipTemplate");
  const directoryPath = path.dirname(require.main.filename) + "/resources/downloads/";
  res.download(directoryPath + "BulkShipTemplate.xlsx", "BulkShipTemplate.xlsx", (err) => {
    if (err) res.status(500);
  });
};

const postBulkShip = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postBulkShip");

    const socketID = req.body.socketID.toString();
    const io = req.app.get("io");
    const importData = req.body.importData;

    for (const item of importData) {
      const response = await getDearSaleOrderAPI(item["PO Number"] ? item["PO Number"] : item["SO Number"], io, socketID);
      const excelDate = new Date(Date.UTC(0, 0, item["Ship Date"] - 1));

      if (response) {
        const saleID = response.ID;
        const saleStatus = response.Fulfilments[0].Ship.Status;

        if (saleStatus === "NOT AVAILABLE" || "DRAFT") {
          const shipData = {
            TaskID: saleID,
            Status: "AUTHORISED",
            Lines: [
              {
                ShipmentDate: new Date(excelDate).toISOString(),
                Carrier: item["Carrier"],
                Box: "1",
                TrackingNumber: item["Tracking Number"],
                IsShipped: true,
              },
            ],
          };

          await postDearSaleFulfilmentShipAPI(item["PO Number"] ? item["PO Number"] : item["SO Number"], shipData, io, socketID);
        }
      }
      await sleep(1200);
    }

    res.status(200).send("BulkShip completed.");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const BulkShip = {
  getBulkShipTemplate,
  postBulkShip,
};
export default BulkShip;
