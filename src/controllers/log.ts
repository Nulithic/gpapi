import { Request, Response } from "express";

import { Logs } from "models";
import { userAction } from "utilities/userAction";

const getLogs = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getLog");

    const id = req.query.logID;
    const log = await Logs.DearLogs.findOne({ id: id });

    res.status(200).send(log);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};

const logControllers = {
  getLogs,
};
export default logControllers;
