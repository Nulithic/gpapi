import { Request, Response } from "express";

import DearLogs from "models/Logs/modelDearLogs";
import { userAction } from "utilities/userAction";

export const getLogs = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getLog");

    const id = req.query.logID;
    const log = await DearLogs.findOne({ id: id });

    res.status(200).send(log);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
