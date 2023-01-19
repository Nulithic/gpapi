import { Request, Response } from "express";
import axios from "axios";
import xml2js from "xml2js";

const parseXml = async (xmlString: string) => {
  const parser = new xml2js.Parser({ explicitArray: false });
  return await new Promise((resolve, reject) =>
    parser.parseString(xmlString, (err, jsonData) => {
      if (err) {
        reject(err);
      }
      resolve(jsonData);
    })
  );
};

const getMicroCenterOrders = async (req: Request, res: Response) => {
  const spsToken = "Bearer " + req.query.spsToken;
  const pathName = req.query.pathName;

  try {
    const response = await axios.get(`https://api.spscommerce.com/transactions/v5/data/`, {
      headers: { Authorization: spsToken },
    });

    const xmlData = response.data;
    // const jsonData = await parseXml(xmlData);

    return res.status(200).send({ orders: xmlData });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

export default { getMicroCenterOrders };
