import { Request, Response } from "express";
import { format, parseISO } from "date-fns";
import fs from "fs";
import path from "path";

import { Translate, Walmart850Mapping } from "api/Stedi";
import { scrapB2B, convertHTML } from "puppet/B2B";
import { Customers } from "models";
import { WalmartOrder, WalmartTrackerFile, WalmartLabel } from "types/WalmartUS/walmartTypes";
import { userAction } from "utilities/userAction";
import WalmartUSCaseSizes from "models/Customers/WalmartUSCaseSizes";
import walmartSSCC from "utilities/walmartSSCC";
import WalmartUSLabelCodes from "models/Customers/WalmartUSLabelCodes";

import walmartPackingSlip from "templates/walmartPackingSlip";
import walmartUnderlyingBOL from "templates/walmartUnderlyingBOL";

import walmartCaseLabel from "templates/walmartCaseLabel";
import walmartPalletLabel from "templates/walmartPalletLabel";
import walmartMasterBOL from "templates/walmartMasterBOL";

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });

const getWalmartUSOrders = async (req: Request, res: Response) => {
  try {
    const option = req.query.option;
    const response = await Customers.WalmartUSOrders.find();
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

    const carrierResponse = await Customers.WalmartCarrierCodes.find();

    const getCarrierName = (order: any) => {
      const name = carrierResponse.find((carrier) => carrier.scac === order.carrierSCAC);
      if (!name) return "";
      return name.company;
    };

    const locationResponse = await Customers.WalmartUSLocations.find();
    const getDistributionCenterName = (order: any) => {
      const dc = locationResponse.filter(
        (location) => location.addressType === "2 GENERAL DC MERCHANDISE" && location.storeNumber === order.distributionCenterNumber
      );
      if (dc.length === 0) return "";
      return dc[0].addressLine1;
    };

    const newList = orderList.map((order) => ({
      ...order.toObject(),
      carrierName: getCarrierName(order),
      distributionCenterName: getDistributionCenterName(order),
    }));

    res.status(200).send(newList);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getWalmartUSCaseSizes = async (req: Request, res: Response) => {
  try {
    const list = await Customers.WalmartUSCaseSizes.find();
    res.status(200).send(list);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const postWalmartUSImportEDI = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postWalmartImportEDI");

    const dataEDI = req.body.dataEDI;
    const translationData = await Translate(dataEDI);
    const data = await Walmart850Mapping(translationData);

    for (const item of data) {
      await Customers.WalmartUSOrders.updateOne({ purchaseOrderNumber: item.purchaseOrderNumber }, item, { upsert: true });
    }

    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
};
const postWalmartUSImportB2B = async (req: Request, res: Response) => {
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
      await Customers.WalmartUSOrders.updateOne(
        { purchaseOrderNumber: item.purchaseOrderNumber },
        {
          ...item,
          actualWeight: "",
          billOfLading: "",
          carrierSCAC: "",
          carrierReference: "",
          carrierClass: "",
          nmfc: "",
          floorOrPallet: "",
          height: "",
          width: "",
          length: "",
          invoiceDate: "",
          loadDestination: "",
          mustArriveByDate: "",
          numberOfCartons: "",
          saleOrderNumber: "",
          shipDateScheduled: "",
          archived: "No",
          asnSent: "No",
          invoiceSent: "No",
        },
        { upsert: true }
      );
    }

    io.to(socketID).emit("postWalmartImportB2B", "Import completed.");

    res.status(200).send(translationList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const postWalmartUSImportTracker = async (req: Request, res: Response) => {
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
        carrierClass: item.Class.toString(),
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
      await Customers.WalmartUSOrders.updateOne({ purchaseOrderNumber: item.PO }, tracker, { upsert: true });
    }

    res.status(200).send(trackerList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const postWalmartUSImportLocation = (req: Request, res: Response) => {};
const postWalmartUSArchiveOrder = async (req: Request, res: Response) => {
  const list = req.body.data as WalmartOrder[];
  try {
    for (const item of list) {
      await Customers.WalmartUSOrders.findOneAndUpdate({ purchaseOrderNumber: item.purchaseOrderNumber }, { archived: "Yes" });
    }
    res.status(200).send("Archive Completed.");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const getWalmartUSPackingSlip = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getWalmartUSPackingSlip");
    let selectionForPacking = req.body.data as WalmartOrder[];

    const caseSizes = await WalmartUSCaseSizes.find();

    for (let order of selectionForPacking) {
      for (let item of order.baselineItemDataPO1Loop) {
        const walmartItem = caseSizes.find((size) => size.walmartItem === item.baselineItemDataPO1.productServiceId07);
        if (!walmartItem) return res.status(500).send(`${item.baselineItemDataPO1.productServiceId07} not found.`);

        const qty = item.baselineItemDataPO1.quantity02;
        const caseSize = parseInt(walmartItem.caseSize);
        const numOfCases = qty / caseSize;

        item.baselineItemDataPO1.numberOfCases = numOfCases;
      }
    }

    const pdfStream = await walmartPackingSlip(selectionForPacking);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Walmart Packing Slip CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getWalmartUSUnderlyingBOL = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getWalmartUSUnderlyingBOL");
    let selectionForUnderlyingBOL = req.body.data as WalmartOrder[];

    const pdfStream = await walmartUnderlyingBOL(selectionForUnderlyingBOL);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Walmart Underlying BOL CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getWalmartUSMasterBOL = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getWalmartUSMasterBOL");
    let selectionForMasterBOL = req.body.data as WalmartOrder[];

    walmartMasterBOL(selectionForMasterBOL);

    const directoryPath = path.dirname(require.main.filename) + "/resources/temp/";
    const pdfStream = fs.createReadStream(directoryPath + "asdf.pdf");
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Walmart Master BOL CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const checkWalmartUSCaseLabel = async (req: Request, res: Response) => {
  try {
    const data = req.body.data as WalmartOrder[];

    const orders = data.map((order) => order.purchaseOrderNumber);
    const getUniqueValues = (array: string[]) => [...new Set(array)];
    const unqiueOrders = getUniqueValues(orders);

    const existingList = await WalmartUSLabelCodes.find({ purchaseOrderNumber: { $in: unqiueOrders }, type: "Case" });

    res.status(200).send(existingList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getWalmartUSCaseLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getWalmartUSCaseLabel");
    const selectionForCases = req.body.data as WalmartOrder[];

    const caseSizes = await WalmartUSCaseSizes.find();

    const caseLabelList = [];

    for (const selection of selectionForCases) {
      for (const item of selection.baselineItemDataPO1Loop) {
        const walmartItem = caseSizes.find((size) => size.walmartItem === item.baselineItemDataPO1.productServiceId07);
        if (!walmartItem) return res.status(500).send(`${item.baselineItemDataPO1.productServiceId07} not found.`);

        const qty = item.baselineItemDataPO1.quantity02;
        const caseSize = parseInt(walmartItem.caseSize);
        const numOfCases = qty / caseSize;

        for (let x = 0; x < numOfCases; x++) {
          const ssccData = await walmartSSCC();

          const caseLabel = {
            purchaseOrderNumber: selection.purchaseOrderNumber,
            buyingParty: selection.buyingParty,
            buyingPartyStreet: selection.buyingPartyStreet,
            buyingPartyAddress: `${selection.buyingPartyCity}, ${selection.buyingPartyStateOrProvince} ${selection.buyingPartyPostalCode}`,
            distributionCenterNumber: selection.distributionCenterNumber,
            purchaseOrderType: selection.purchaseOrderType,
            departmentNumber: selection.departmentNumber,
            wmit: item.baselineItemDataPO1.productServiceId07,
            vsn: item.baselineItemDataPO1.productServiceId11,
            serialNumber: parseInt(ssccData.serialNumber),
            type: "Case",
            sscc: ssccData.sscc,
            date: new Date().toLocaleString(),
          };

          await WalmartUSLabelCodes.create(caseLabel);

          caseLabelList.push(caseLabel);
        }
      }
    }

    const pdfStream = await walmartCaseLabel(caseLabelList);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Walmart Case Label CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getExistingWalmartUSCaseLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getExistingWalmartUSCaseLabel");
    const existingList = req.body.data as WalmartLabel[];
    const pdfStream = await walmartCaseLabel(existingList);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Existing Walmart Case Label CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getNewWalmartUSCaseLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getNewWalmartUSCaseLabel");
    const existingList = req.body.data.caseLabels as WalmartLabel[];
    const selectionForCases = req.body.data.selection as WalmartOrder[];

    const orderList = existingList.map((item) => item.purchaseOrderNumber);
    await WalmartUSLabelCodes.deleteMany({ purchaseOrderNumber: { $in: orderList }, type: "Case" });

    const caseSizes = await WalmartUSCaseSizes.find();
    const caseLabelList = [];
    for (const selection of selectionForCases) {
      for (const item of selection.baselineItemDataPO1Loop) {
        const walmartItem = caseSizes.find((size) => size.walmartItem === item.baselineItemDataPO1.productServiceId07);
        if (!walmartItem) return res.status(500).send(`${item.baselineItemDataPO1.productServiceId07} not found.`);

        const qty = item.baselineItemDataPO1.quantity02;
        const caseSize = parseInt(walmartItem.caseSize);
        const numOfCases = qty / caseSize;

        for (let x = 0; x < numOfCases; x++) {
          const ssccData = await walmartSSCC();

          const caseLabel = {
            purchaseOrderNumber: selection.purchaseOrderNumber,
            buyingParty: selection.buyingParty,
            buyingPartyStreet: selection.buyingPartyStreet,
            buyingPartyAddress: `${selection.buyingPartyCity}, ${selection.buyingPartyStateOrProvince} ${selection.buyingPartyPostalCode}`,
            distributionCenterNumber: selection.distributionCenterNumber,
            purchaseOrderType: selection.purchaseOrderType,
            departmentNumber: selection.departmentNumber,
            wmit: item.baselineItemDataPO1.productServiceId07,
            vsn: item.baselineItemDataPO1.productServiceId11,
            serialNumber: parseInt(ssccData.serialNumber),
            type: "Case",
            sscc: ssccData.sscc,
            date: new Date().toLocaleString(),
          };

          await WalmartUSLabelCodes.create(caseLabel);

          caseLabelList.push(caseLabel);
        }
      }
    }

    const pdfStream = await walmartCaseLabel(caseLabelList);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`New Walmart Case Label CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const checkWalmartUSPalletLabel = async (req: Request, res: Response) => {
  try {
    const data = req.body.data as WalmartOrder[];

    const orders = data.map((order) => order.purchaseOrderNumber);
    const getUniqueValues = (array: string[]) => [...new Set(array)];
    const unqiueOrders = getUniqueValues(orders);

    const existingList = await WalmartUSLabelCodes.find({ purchaseOrderNumber: { $in: unqiueOrders }, type: "Pallet" });

    res.status(200).send(existingList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getWalmartUSPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getWalmartUSPalletLabel");
    const selectionForPallets = req.body.data as WalmartOrder[];

    const caseSizes = await WalmartUSCaseSizes.find();
    const palletLabelList = [];

    for (const selection of selectionForPallets) {
      let caseAmount = 0;
      const firstItem = selection.baselineItemDataPO1Loop[0].baselineItemDataPO1.productServiceId07;
      const walmartItem = selection.baselineItemDataPO1Loop.length === 1 ? firstItem : "MIXED PALLET";

      for (const item of selection.baselineItemDataPO1Loop) {
        const walmartItem = caseSizes.find((size) => size.walmartItem === item.baselineItemDataPO1.productServiceId07);
        if (!walmartItem) return res.status(500).send(`${item.baselineItemDataPO1.productServiceId07} not found.`);

        const qty = item.baselineItemDataPO1.quantity02;
        const caseSize = parseInt(walmartItem.caseSize);
        const numOfCases = qty / caseSize;
        caseAmount += numOfCases;
      }

      const ssccData = await walmartSSCC();

      const palletLabel = {
        purchaseOrderNumber: selection.purchaseOrderNumber,
        buyingParty: selection.buyingParty,
        buyingPartyStreet: selection.buyingPartyStreet,
        buyingPartyAddress: `${selection.buyingPartyCity}, ${selection.buyingPartyStateOrProvince} ${selection.buyingPartyPostalCode}`,
        distributionCenterNumber: selection.distributionCenterNumber,
        purchaseOrderType: selection.purchaseOrderType,
        departmentNumber: selection.departmentNumber,
        wmit: walmartItem,
        numberOfCases: caseAmount,
        serialNumber: parseInt(ssccData.serialNumber),
        type: "Pallet",
        sscc: ssccData.sscc,
        date: new Date().toLocaleString(),
      };

      await WalmartUSLabelCodes.create(palletLabel);

      palletLabelList.push(palletLabel);
    }

    const pdfStream = await walmartPalletLabel(palletLabelList);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Walmart Pallet Label CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getExistingWalmartUSPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getExistingWalmartUSPalletLabel");
    const existingList = req.body.data as WalmartLabel[];
    const pdfStream = await walmartPalletLabel(existingList);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Existing Walmart Pallet Label CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const getNewWalmartUSPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getNewWalmartUSPalletLabel");
    const existingList = req.body.data.palletLabels as WalmartLabel[];
    const selectionForPallets = req.body.data.selection as WalmartOrder[];

    const orderList = existingList.map((item) => item.purchaseOrderNumber);
    await WalmartUSLabelCodes.deleteMany({ purchaseOrderNumber: { $in: orderList }, type: "Pallet" });

    const caseSizes = await WalmartUSCaseSizes.find();
    const palletLabelList = [];

    for (const selection of selectionForPallets) {
      let caseAmount = 0;
      let firstItem = selection.baselineItemDataPO1Loop[0].baselineItemDataPO1.productServiceId07;

      for (const item of selection.baselineItemDataPO1Loop) {
        const walmartItem = caseSizes.find((size) => size.walmartItem === item.baselineItemDataPO1.productServiceId07);
        if (!walmartItem) return res.status(500).send(`${item.baselineItemDataPO1.productServiceId07} not found.`);

        const qty = item.baselineItemDataPO1.quantity02;
        const caseSize = parseInt(walmartItem.caseSize);
        const numOfCases = qty / caseSize;
        caseAmount += numOfCases;
      }

      const ssccData = await walmartSSCC();

      const palletLabel = {
        purchaseOrderNumber: selection.purchaseOrderNumber,
        buyingParty: selection.buyingParty,
        buyingPartyStreet: selection.buyingPartyStreet,
        buyingPartyAddress: `${selection.buyingPartyCity}, ${selection.buyingPartyStateOrProvince} ${selection.buyingPartyPostalCode}`,
        distributionCenterNumber: selection.distributionCenterNumber,
        purchaseOrderType: selection.purchaseOrderType,
        departmentNumber: selection.departmentNumber,
        wmit: selection.baselineItemDataPO1Loop.length === 1 ? firstItem : "MIXED PALLET",
        numberOfCases: caseAmount,
        serialNumber: parseInt(ssccData.serialNumber),
        type: "Pallet",
        sscc: ssccData.sscc,
        date: new Date().toLocaleString(),
      };

      await WalmartUSLabelCodes.create(palletLabel);

      palletLabelList.push(palletLabel);
    }

    const pdfStream = await walmartPalletLabel(palletLabelList);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`New Walmart Pallet Label CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const addWalmartUSCaseSizes = async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    await Customers.WalmartUSCaseSizes.updateOne({ walmartItem: data.walmartItem }, data, { upsert: true });
    const list = await Customers.WalmartUSCaseSizes.find();
    res.status(200).send(list);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const deleteWalmartUSCaseSizes = async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    const dataList = data.map((item: any) => item.walmartItem);
    await Customers.WalmartUSCaseSizes.deleteMany({ walmartItem: dataList });
    const list = await Customers.WalmartUSCaseSizes.find();
    res.status(200).send(list);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export default {
  getWalmartUSOrders,
  getWalmartUSCaseSizes,
  postWalmartUSImportEDI,
  postWalmartUSImportB2B,
  postWalmartUSImportTracker,
  postWalmartUSImportLocation,
  postWalmartUSArchiveOrder,
  getWalmartUSPackingSlip,
  getWalmartUSUnderlyingBOL,
  getWalmartUSMasterBOL,
  checkWalmartUSCaseLabel,
  getWalmartUSCaseLabel,
  getExistingWalmartUSCaseLabel,
  getNewWalmartUSCaseLabel,
  checkWalmartUSPalletLabel,
  getWalmartUSPalletLabel,
  getExistingWalmartUSPalletLabel,
  getNewWalmartUSPalletLabel,
  addWalmartUSCaseSizes,
  deleteWalmartUSCaseSizes,
};
