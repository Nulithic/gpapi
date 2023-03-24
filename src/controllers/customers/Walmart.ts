import { Request, Response } from "express";
import { Translate, Walmart850Mapping } from "api/Stedi";
import { format, parseISO } from "date-fns";
import { scrapB2B, convertHTML } from "puppet/B2B";
import { Customers } from "models";
import { WalmartOrder, WalmartTrackerFile } from "types/walmartTypes";
import { userAction } from "utilities/userAction";
import axios from "axios";

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });

const getWalmartOrders = async (req: Request, res: Response) => {
  try {
    const option = req.query.option;
    console.log(option);
    const response = await Customers.WalmartOrders.find();
    let orderList;

    switch (option) {
      case "All Orders":
        orderList = response;
        break;
      case "Active Orders":
        orderList = response.filter((item) => item.archived === "No");
        break;
      case "Archived Orders":
        orderList = response.filter((item) => item.archived === "Yes");
        break;
      default:
        break;
    }

    res.status(200).send(orderList);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const postWalmartImportEDI = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postWalmartImportEDI");

    const dataEDI = req.body.dataEDI;
    const translationData = await Translate(dataEDI);
    const data = await Walmart850Mapping(translationData);

    for (const item of data) {
      await Customers.WalmartOrders.updateOne({ purchaseOrderNumber: item.purchaseOrderNumber }, item, { upsert: true });
    }

    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
};
const postWalmartImportHTML = (req: Request, res: Response) => {
  try {
    const dataHTML = req.body.dataHTML;
    console.log(dataHTML);
    res.status(200).send(dataHTML);
  } catch (err) {
    res.status(500).send(err);
  }
};
const postWalmartImportB2B = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postWalmartImportB2B");

    const dataB2B = req.body.dataB2B;
    const socketID = req.body.socketID.toString();
    const io = req.app.get("io");

    const day = format(parseISO(dataB2B.date), "dd");
    const monthYear = format(parseISO(dataB2B.date), "yyyyMM");

    // scrap B2B for href links
    const data = await scrapB2B(day, monthYear, io, socketID);
    // get POS list
    const POS = data.filter((item) => new URLSearchParams(item).get("dt") === "POS");
    io.to(socketID).emit("postWalmartImportB2B", `Total POS found: ${POS.length}`);

    // convert HTML to text
    let posList = [];
    for (let i = 0; i < POS.length; i++) {
      const text = await convertHTML(POS[i]);
      posList.push(text);
      io.to(socketID).emit("postWalmartImportB2B", `Conversion ${i + 1} completed.`);
    }

    // group EDIs by control number
    const group = groupBy(posList, (v) => v.id);
    let groupList = [];
    for (const [key, value] of Object.entries(group)) {
      let edi = value[0].header;
      for (const item of value) {
        edi = edi + item.body;
      }
      edi = edi + value[0].footer;
      edi = edi.replace(/~~/g, "~");
      groupList.push(edi);
    }

    // convert EDIs to JSON
    let translationList: WalmartOrder[] = [];
    for (const item of groupList) {
      const translationData = await Translate(item);
      io.to(socketID).emit("postWalmartImportB2B", "Translate EDI completed.");

      const data = await Walmart850Mapping(translationData);
      io.to(socketID).emit("postWalmartImportB2B", "Map EDI completed.");

      translationList.push(data);
    }

    // save JSON to database
    for (const item of translationList.flat()) {
      await Customers.WalmartOrders.updateOne({ purchaseOrderNumber: item.purchaseOrderNumber }, item, { upsert: true });
    }

    io.to(socketID).emit("postWalmartImportB2B", "Import completed.");

    res.status(200).send(translationList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const postWalmartImportTracker = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postWalmartImportTracker");
    const dataTracker = req.body.dataTracker as WalmartTrackerFile[];

    let trackerList = [];

    for (const item of dataTracker) {
      const invoiceDate = format(new Date(Date.UTC(0, 0, item["Invoice Date"])), "MM/dd/yyyy");
      const purchaseOrderDate = format(new Date(Date.UTC(0, 0, item["PO Date"])), "MM/dd/yyyy");
      const shipDateScheduled = format(new Date(Date.UTC(0, 0, item["Ship Date Scheduled"])), "MM/dd/yyyy");

      const tracker = {
        purchaseOrderNumber: item.PO.toString(),
        actualWeight: item["Actual Weight"].toString(),
        billOfLading: item.BOL.toString(),
        carrierSCAC: item["Carrier SCAC"],
        carrierReference: item["Carrier Reference"].toString(),
        class: item.Class.toString(),
        nmfc: item.NMFC,
        floorOrPallet: item["Floor or Pallet"],
        height: item.Height.toString(),
        width: item.Width.toString(),
        length: item.Length.toString(),
        invoiceDate: invoiceDate,
        loadDestination: item["Load Destination"].toString(),
        mustArriveByDate: item.MABD,
        numberOfCartons: item["Number of Cartons"].toString(),
        distributionCenterNumber: item["DC Number"].toString(),
        purchaseOrderDate: purchaseOrderDate,
        purchaseOrderType: item["PO Type"],
        purchaseOrderEventCode: item["PO Event Code"],
        saleOrderNumber: item.SO.toString(),
        shipDateScheduled: shipDateScheduled,
      };
      trackerList.push(tracker);
      await Customers.WalmartOrders.updateOne({ purchaseOrderNumber: item.PO }, tracker, { upsert: true });
    }

    res.status(200).send(trackerList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const postWalmartImportLocation = (req: Request, res: Response) => {};

const postWalmartArchiveOrder = async (req: Request, res: Response) => {
  const list = req.body.data as WalmartOrder[];
  try {
    for (const item of list) {
      await Customers.WalmartOrders.findOneAndUpdate({ purchaseOrderNumber: item.purchaseOrderNumber }, { archived: "Yes" });
    }
    res.status(200).send("Archive Completed.");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const postWalmartPackingList = async (req: Request, res: Response) => {
  const selection = req.body.selection;
  console.log(selection);

  res.status(200).send();
};

export default {
  getWalmartOrders,
  postWalmartImportEDI,
  postWalmartImportHTML,
  postWalmartImportB2B,
  postWalmartImportTracker,
  postWalmartImportLocation,
  postWalmartArchiveOrder,
  postWalmartPackingList,
};
