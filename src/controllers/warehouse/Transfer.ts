import { Request, Response } from "express";
import path from "path";

import { postDearStockTransferAPI } from "api/DearSystems";
import { userAction } from "utilities/userAction";
import sleep from "utilities/sleep";

const getTransferTemplate = (req: Request, res: Response) => {
  userAction(req.body.user, "getTransferTemplate");
  const directoryPath = path.dirname(require.main.filename) + "/resources/downloads/";
  res.download(directoryPath + "TransferTemplate.xlsx", "TransferTemplate.xlsx", (err) => {
    if (err) res.status(500);
  });
};

const postTransfer = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postTransfer");

    const socketID = req.body.socketID.toString();
    const io = req.app.get("io");
    const transferData = req.body.transferData;

    for (const item of transferData.transferList) {
      const transfer = {
        Status: transferData.completed ? "COMPLETED" : "DRAFT",
        CompletionDate: transferData.completedDate,
        From: item.fromLocationData.locationID,
        To: item.toLocationData.locationID,
        Reference: item.reference,
        Lines: [
          {
            SKU: item.sku,
            TransferQuantity: item.transferQty,
          },
        ],
        SkipOrder: transferData.skipOrder,
      };

      await postDearStockTransferAPI(transfer, io, socketID);
      await sleep(1200);
    }

    res.status(200).send({ message: "Transfer completed." });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const Transfer = {
  getTransferTemplate,
  postTransfer,
};
export default Transfer;
