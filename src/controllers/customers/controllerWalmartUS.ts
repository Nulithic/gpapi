import { Request, Response } from "express";
import { format, parseISO } from "date-fns";
import fs from "fs";
import path from "path";

import { scrapB2B, convertHTML } from "puppet/B2B";

import { userAction } from "utilities/userAction";

import walmartPackingSlip from "templates/walmartPackingSlip";
import walmartUnderlyingBOL from "templates/walmartUnderlyingBOL";
import walmartCaseLabel from "templates/walmartCaseLabel";
import walmartPalletLabel from "templates/walmartPalletLabel";
import walmartMasterBOL from "templates/walmartMasterBOL";

import { walmartTranslate850, walmartMap850, walmartTranslate856, walmartTranslate997, walmartTranslate810 } from "api/Stedi";
import { mftAuthorization, mftSendMessage } from "api/MFTGateway";
import { getDearSaleOrderAPI, postDearSaleOrderAPI } from "api/DearSystems";

import { WalmartAdvanceShipNotice } from "types/Walmart/stedi856";
import { WalmartOrder, WalmartTrackerFile, WalmartLabel } from "types/Walmart/walmartTypes";
import { WalmartInvoice, BaselineItemDataInvoiceIT1Loop } from "types/Walmart/stedi810";
import { DearSaleOrder } from "types/Dear/dearSaleOrder";

import { WalmartControlGroupUS, WalmartLocationsUS, WalmartOrdersUS, WalmartProductsUS, WalmartShippingLabelUS } from "models/customers/WalmartUS";
import CarrierCodes from "models/customers/modelCarrierCodes";

const fileName = path.basename(__filename);

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });

const walmartSSCC = async () => {
  const lastRecord = await WalmartShippingLabelUS.findOne().sort("-serialNumber");
  const newSerialCode = lastRecord ? lastRecord.serialNumber + 1 : 0;
  const serialNumber = newSerialCode.toString().padStart(7, "0");

  const ssccData = "0" + "081995202" + serialNumber;

  let sum = 0;
  for (let i = 0; i < ssccData.length; i++) {
    const digit = parseInt(ssccData[i]);
    const weight = i % 2 == 0 ? 3 : 1;
    sum += digit * weight;
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  const sscc = "00" + ssccData + checkDigit;

  return { sscc: sscc, serialNumber: serialNumber };
};

const walmartCG = async () => {
  try {
    const control = await WalmartControlGroupUS.findOne();
    const newSerialCode = control ? control.serialNumber + 1 : 1;
    const controlGroup = newSerialCode.toString().padStart(8, "0");

    await WalmartControlGroupUS.findOneAndUpdate({}, { serialNumber: newSerialCode, controlGroup: controlGroup }, { upsert: true });

    return { serialNumber: newSerialCode, controlGroup: controlGroup };
  } catch (err) {
    console.log(err);
  }
};

export const getWalmartOrders = async (req: Request, res: Response) => {
  try {
    const option = req.query.option;
    const response = await WalmartOrdersUS.find();
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

export const importWalmartOrdersMFT = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - importWalmartOrdersMFT`);
    const socketID = req.body.socketID.toString();
    const io = req.app.get("io");

    // get edi
    const filePath = path.join(__dirname, "orders.txt");
    const dataEDI = fs.readFileSync(filePath, "utf8");
    //const dataEDI = await mftReceiveMessage();

    // translate and map edi to json
    const translationData = await walmartTranslate850(dataEDI);
    io.to(socketID).emit("importWalmartOrdersMFT", `Walmart 850 translate completed.`);
    const data = (await walmartMap850(translationData)) as WalmartOrder[];
    io.to(socketID).emit("importWalmartOrdersMFT", `Walmart 850 mapping completed.`);

    // save to local db
    const ak2List = [];
    for (const item of data) {
      const locationResponse = await WalmartLocationsUS.find({ gln: item.buyingPartyGLN });
      const locationFilter = locationResponse.find((item) => item.addressType == "2 GENERAL DC MERCHANDISE" || item.addressType == "1 REGULAR DC MERCHANDISE");

      const location = locationFilter ?? locationResponse[0];

      await WalmartOrdersUS.updateOne(
        { purchaseOrderNumber: item.purchaseOrderNumber },
        {
          ...item,
          actualWeight: "",
          billOfLading: "",
          carrierSCAC: "",
          carrierName: "",
          carrierReference: "",
          carrierClass: "",
          distributionCenterName: location.addressLine1,
          distributionCenterNumber: location.storeNumber,
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
          hasPalletLabel: "No",
        },
        { upsert: true }
      );

      const ak2 = {
        transaction_set_response_header_AK2: {
          transaction_set_identifier_code_01: "850",
          transaction_set_control_number_02: item.transactionSetHeaderST.transactionSetControlNumber02,
        },
        transaction_set_response_trailer_AK5: {
          transaction_set_acknowledgment_code_01: "A",
        },
      };

      ak2List.push(ak2);
    }

    // create 997 json
    const control = await walmartCG();
    const envelope = {
      interchangeHeader: {
        authorizationInformationQualifier: data[0].interchangeHeader.authorizationInformationQualifier,
        authorizationInformation: data[0].interchangeHeader.authorizationInformation,
        securityQualifier: data[0].interchangeHeader.securityQualifier,
        securityInformation: data[0].interchangeHeader.securityInformation,
        senderQualifier: data[0].interchangeHeader.senderQualifier,
        senderId: data[0].interchangeHeader.senderId,
        receiverQualifier: data[0].interchangeHeader.receiverQualifier,
        receiverId: data[0].interchangeHeader.receiverId,
        date: data[0].interchangeHeader.date,
        time: data[0].interchangeHeader.time,
        repetitionSeparator: data[0].interchangeHeader.repetitionSeparator,
        controlVersionNumber: data[0].interchangeHeader.controlVersionNumber,
        controlNumber: control.serialNumber.toString(),
        acknowledgementRequestedCode: data[0].interchangeHeader.acknowledgementRequestedCode,
        usageIndicatorCode: data[0].interchangeHeader.usageIndicatorCode,
        componentSeparator: data[0].interchangeHeader.componentSeparator,
      },
      groupHeader: {
        functionalIdentifierCode: data[0].groupHeader.functionalIdentifierCode,
        applicationSenderCode: data[0].groupHeader.applicationSenderCode,
        applicationReceiverCode: data[0].groupHeader.applicationReceiverCode,
        date: data[0].groupHeader.date,
        time: data[0].groupHeader.time,
        controlNumber: control.serialNumber.toString(),
        agencyCode: data[0].groupHeader.agencyCode,
        release: data[0].groupHeader.release,
      },
      groupTrailer: {
        numberOfTransactions: data[0].groupTrailer.numberOfTransactions,
        controlNumber: control.serialNumber.toString(),
      },
      interchangeTrailer: {
        numberOfFunctionalGroups: data[0].interchangeTrailer.numberOfFunctionalGroups,
        controlNumber: control.serialNumber.toString(),
      },
    };
    const input = {
      heading: {
        transaction_set_header_ST: {
          transaction_set_identifier_code_01: "997",
          transaction_set_control_number_02: 1,
        },
        functional_group_response_header_AK1: {
          functional_identifier_code_01: "PO",
          group_control_number_02: parseInt(data[0].interchangeHeader.controlNumber),
        },
        transaction_set_response_header_AK2_loop: ak2List,
        functional_group_response_trailer_AK9: {
          functional_group_acknowledge_code_01: "A",
          number_of_transaction_sets_included_02: 1,
          number_of_received_transaction_sets_03: 1,
          number_of_accepted_transaction_sets_04: 1,
        },
        transaction_set_trailer_SE: {
          number_of_included_segments_01: 6,
          transaction_set_control_number_02: 1,
        },
      },
    };

    // translate 997 json to edi
    const edi997 = await walmartTranslate997(input, envelope);
    io.to(socketID).emit("importWalmartOrdersMFT", `Walmart 997 translate completed.`);

    // transmit 997 edi to partner
    const tokens = await mftAuthorization();
    const headers = {
      Authorization: tokens.api_token,
      "AS2-From": "GreenProjectWalmartUS",
      "AS2-To": "08925485US00",
      Subject: "Walmart ACK - Green Project",
      "Attachment-Name": `${input.heading.functional_group_response_header_AK1.group_control_number_02}-ACK.txt`,
      "Content-Type": "text/plain",
    };
    const response = await mftSendMessage(headers, edi997);
    io.to(socketID).emit("importWalmartOrdersMFT", response.message);

    res.status(200).send(response);
  } catch (err) {
    res.status(500).send(err);
  }
};
export const importWalmartOrdersEDI = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - importWalmartOrdersEDI`);
    const socketID = req.body.socketID.toString();
    const io = req.app.get("io");

    const dataEDI = req.body.dataEDI;
    const translationData = await walmartTranslate850(dataEDI);
    io.to(socketID).emit("importWalmartOrdersEDI", `Walmart 850 translate completed.`);
    const data = await walmartMap850(translationData);
    io.to(socketID).emit("importWalmartOrdersEDI", `Walmart 850 mapping completed.`);

    for (const item of data) {
      const locationResponse = await WalmartLocationsUS.find({ gln: item.buyingPartyGLN });
      const locationFilter = locationResponse.find((item) => item.addressType == "2 GENERAL DC MERCHANDISE" || item.addressType == "1 REGULAR DC MERCHANDISE");

      const location = locationFilter ?? locationResponse[0];

      await WalmartOrdersUS.updateOne(
        { purchaseOrderNumber: item.purchaseOrderNumber },
        {
          ...item,
          actualWeight: "",
          billOfLading: "",
          carrierSCAC: "",
          carrierName: "",
          carrierReference: "",
          carrierClass: "",
          distributionCenterName: location.addressLine1,
          distributionCenterNumber: location.storeNumber,
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
          hasPalletLabel: "No",
        },
        { upsert: true }
      );
    }

    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
};
export const importWalmartOrdersB2B = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - importWalmartOrdersB2B`);

    const dataB2B = req.body.dataB2B;
    const socketID = req.body.socketID.toString();
    const io = req.app.get("io");

    const day = format(parseISO(dataB2B.date), "dd");
    const monthYear = format(parseISO(dataB2B.date), "yyyyMM");

    // scrap B2B for href links
    const data = await scrapB2B(day, monthYear, io, socketID);
    // get POS list
    const POS = data.filter((item) => new URLSearchParams(item).get("dt") === "POS");
    io.to(socketID).emit("importWalmartOrdersB2B", `Total POS found: ${POS.length}`);

    // convert HTML to text
    let posList = [];
    for (let i = 0; i < POS.length; i++) {
      const text = await convertHTML(POS[i]);
      posList.push(text);
      io.to(socketID).emit("importWalmartOrdersB2B", `Conversion ${i + 1} completed.`);
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
      const translationData = await walmartTranslate850(item);
      io.to(socketID).emit("postWalmartImportB2B", "Translate EDI completed.");

      const data = await walmartMap850(translationData);
      io.to(socketID).emit("postWalmartImportB2B", "Map EDI completed.");

      translationList.push(data);
    }

    // save JSON to database
    for (const item of translationList.flat()) {
      await WalmartOrdersUS.updateOne(
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
          hasPalletLabel: "No",
        },
        { upsert: true }
      );
    }

    io.to(socketID).emit("importWalmartOrdersB2B", "Import completed.");

    res.status(200).send(translationList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
export const importWalmartTracker = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - importWalmartTracker`);
    const dataTracker = req.body.dataTracker as WalmartTrackerFile[];

    let trackerList = [];

    for (const item of dataTracker) {
      const invoiceDate = format(new Date(Date.UTC(0, 0, item["Invoice Date"])), "MM/dd/yyyy");
      const purchaseOrderDate = format(new Date(Date.UTC(0, 0, item["PO Date"])), "MM/dd/yyyy");
      const shipDateScheduled = format(new Date(Date.UTC(0, 0, item["Ship Date Scheduled"])), "MM/dd/yyyy");

      const carrierResponse = await CarrierCodes.findOne({ scac: item["Carrier SCAC"] });

      const tracker = {
        purchaseOrderNumber: item.PO.toString(),
        actualWeight: item["Actual Weight"].toString(),
        billOfLading: item.BOL.toString(),
        carrierSCAC: item["Carrier SCAC"],
        carrierName: carrierResponse.company ?? "",
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
      await WalmartOrdersUS.updateOne({ purchaseOrderNumber: item.PO }, tracker, { upsert: true });
    }

    res.status(200).send(trackerList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
export const importWalmartLocation = (req: Request, res: Response) => {};
export const archiveWalmartOrder = async (req: Request, res: Response) => {
  const list = req.body.data as WalmartOrder[];
  try {
    for (const item of list) {
      await WalmartOrdersUS.findOneAndUpdate({ purchaseOrderNumber: item.purchaseOrderNumber }, { archived: "Yes" });
    }
    res.status(200).send("Archive Completed.");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export const getWalmartPackingSlip = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getWalmartPackingSlip`);
    let selectionForPacking = req.body.data as WalmartOrder[];

    const caseSizes = await WalmartProductsUS.find();

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
export const getWalmartUnderlyingBOL = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getWalmartUnderlyingBOL`);
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
export const getWalmartMasterBOL = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getWalmartMasterBOL`);
    let selectionForMasterBOL = req.body.data as WalmartOrder[];

    const blob = walmartMasterBOL(selectionForMasterBOL);

    res.setHeader("Content-Type", "application/pdf");
    res.status(200).send(blob);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export const checkWalmartCaseLabel = async (req: Request, res: Response) => {
  try {
    const data = req.body.data as WalmartOrder[];

    const orders = data.map((order) => order.purchaseOrderNumber);
    const getUniqueValues = (array: string[]) => [...new Set(array)];
    const unqiueOrders = getUniqueValues(orders);

    const existingList = await WalmartShippingLabelUS.find({ purchaseOrderNumber: { $in: unqiueOrders }, type: "Case" });

    res.status(200).send(existingList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
export const getWalmartCaseLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getWalmartCaseLabel`);
    const selectionForCases = req.body.data as WalmartOrder[];

    const caseSizes = await WalmartProductsUS.find();

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
            supplierParty: "Green Project Inc.",
            supplierPartyStreet: "815 Echelon Ct.",
            supplierPartyAddress: "City of Industry, CA 91744",
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
            multiPallet: "No",
            sscc: ssccData.sscc,
            date: new Date().toLocaleString(),
          };

          await WalmartShippingLabelUS.create(caseLabel);

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
export const getExistingWalmartCaseLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getExistingWalmartCaseLabel`);
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
export const getNewWalmartCaseLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getNewWalmartCaseLabel`);
    const existingList = req.body.data.caseLabels as WalmartLabel[];
    const selectionForCases = req.body.data.selection as WalmartOrder[];

    const orderList = existingList.map((item) => item.purchaseOrderNumber);
    await WalmartShippingLabelUS.deleteMany({ purchaseOrderNumber: { $in: orderList }, type: "Case" });

    const caseSizes = await WalmartProductsUS.find();
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
            supplierParty: "Green Project Inc.",
            supplierPartyStreet: "815 Echelon Ct.",
            supplierPartyAddress: "City of Industry, CA 91744",
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
            multiPallet: "No",
            sscc: ssccData.sscc,
            date: new Date().toLocaleString(),
          };

          await WalmartShippingLabelUS.create(caseLabel);

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

export const checkWalmartPalletLabel = async (req: Request, res: Response) => {
  try {
    const data = req.body.data as WalmartOrder[];

    const orders = data.map((order) => order.purchaseOrderNumber);
    const getUniqueValues = (array: string[]) => [...new Set(array)];
    const unqiueOrders = getUniqueValues(orders);

    const existingList = await WalmartShippingLabelUS.find({ purchaseOrderNumber: { $in: unqiueOrders }, type: "Pallet" });

    res.status(200).send(existingList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
export const getWalmartPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getWalmartPalletLabel`);
    const selectionForPallets = req.body.data as WalmartOrder[];

    const caseSizes = await WalmartProductsUS.find();
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
        supplierParty: "Green Project Inc.",
        supplierPartyStreet: "815 Echelon Ct.",
        supplierPartyAddress: "City of Industry, CA 91744",
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
        multiPallet: "No",
        sscc: ssccData.sscc,
        date: new Date().toLocaleString(),
      };

      await WalmartShippingLabelUS.create(palletLabel);

      palletLabelList.push(palletLabel);

      await WalmartOrdersUS.findOneAndUpdate({ purchaseOrderNumber: selection.purchaseOrderNumber }, { hasPalletLabel: "Yes" });
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
export const getExistingWalmartPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getExistingWalmartPalletLabel`);

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
export const getNewWalmartPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - getNewWalmartPalletLabel`);
    const existingList = req.body.data.palletLabels as WalmartLabel[];
    const selectionForPallets = req.body.data.selection as WalmartOrder[];

    const orderList = existingList.map((item) => item.purchaseOrderNumber);
    await WalmartShippingLabelUS.deleteMany({ purchaseOrderNumber: { $in: orderList }, type: "Pallet" });

    const caseSizes = await WalmartProductsUS.find();
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
        supplierParty: "Green Project Inc.",
        supplierPartyStreet: "815 Echelon Ct.",
        supplierPartyAddress: "City of Industry, CA 91744",
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
        multiPallet: "No",
        sscc: ssccData.sscc,
        date: new Date().toLocaleString(),
      };

      await WalmartShippingLabelUS.create(palletLabel);

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

export const checkWalmartMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - checkWalmartMultiPalletLabel`);
    const data = req.body;

    const linesItems = [];
    for (const item of data.Order.Lines) {
      const product = await WalmartProductsUS.findOne({ sku: item.SKU });
      linesItems.push({ sku: item.SKU, upc: item.Walmart, qty: item.Quantity, caseCount: item.Quantity / parseInt(product.caseSize) });
    }
    const order = {
      purchaseOrderNumber: data.CustomerReference,
      lineItems: linesItems,
    };

    const totalCases = order.lineItems.reduce((previous, current) => previous + current.caseCount, 0);
    const caseLabels = await WalmartShippingLabelUS.find({ purchaseOrderNumber: data.CustomerReference, type: "Case" });
    const ssccList = caseLabels.map((item) => item.sscc);

    if (totalCases !== caseLabels.length) {
      console.log("Total cases do not match with case labels.");
      console.log(`DEAR: ${totalCases}`);
      console.log(`GP Apps: ${caseLabels.length}`);
      return res.status(400).send("Total cases do not match with case labels.");
    }

    await WalmartShippingLabelUS.deleteMany({ purchaseOrderNumber: data.CustomerReference, type: "Pallet", multiPallet: "No" });

    const multiPallet = await WalmartShippingLabelUS.find({ purchaseOrderNumber: data.CustomerReference, type: "Pallet", multiPallet: "Yes" });
    if (multiPallet.length > 0) {
      console.log("A multi pallet already exists for this order.");
      return res.status(400).send("A multi pallet already exists for this order.");
    }

    return res.status(200).send(ssccList);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
export const submitWalmartMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - submitWalmartMultiPalletLabel`);
    const pallets = req.body.pallets as Array<Array<String>>;

    const orderData = await WalmartShippingLabelUS.findOne({ sscc: pallets[0][0] });

    for (let i = 0; i < pallets.length; i++) {
      let itemList: string[] = [];

      for (let k = 0; k < pallets[i].length; k++) {
        const item = await WalmartShippingLabelUS.findOne({ sscc: pallets[i][k] }, { wmit: 1 });
        itemList.push(item.wmit);

        await WalmartShippingLabelUS.findOneAndUpdate({ sscc: pallets[i][k] }, { $set: { multiPallet: "Yes", multiPalletID: i } });
      }

      const checkWalmartItem = itemList.every((item) => item === itemList[0]);

      const ssccData = await walmartSSCC();

      const palletLabel = {
        purchaseOrderNumber: orderData.purchaseOrderNumber,
        buyingParty: orderData.buyingParty,
        buyingPartyStreet: orderData.buyingPartyStreet,
        buyingPartyAddress: orderData.buyingPartyAddress,
        distributionCenterNumber: orderData.distributionCenterNumber,
        purchaseOrderType: orderData.purchaseOrderType,
        departmentNumber: orderData.departmentNumber,
        wmit: checkWalmartItem ? itemList[0] : "MIXED PALLET",
        numberOfCases: pallets[i].length,
        serialNumber: parseInt(ssccData.serialNumber),
        type: "Pallet",
        multiPallet: "Yes",
        multiPalletID: i,
        sscc: ssccData.sscc,
        date: new Date().toLocaleString(),
      };

      await WalmartShippingLabelUS.create(palletLabel);

      await WalmartOrdersUS.findOneAndUpdate({ purchaseOrderNumber: orderData.purchaseOrderNumber }, { hasPalletLabel: "Yes" });
    }

    return res.status(200).send("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
export const downloadWalmartMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - downloadWalmartMultiPalletLabel`);

    const multiPalletList = req.body.data as WalmartLabel[];

    const pdfStream = await walmartPalletLabel(multiPalletList);
    res.setHeader("Content-Type", "application/pdf");
    pdfStream.pipe(res);
    pdfStream.on("end", () => console.log(`Walmart Multi Pallet Label CREATED - ${new Date().toLocaleString()}`));
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
export const deleteWalmartMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, `${fileName} - deleteWalmartMultiPalletLabel`);
    const multiPalletList = req.body.data as WalmartLabel[];
    const idList = multiPalletList.map((item) => item._id);

    await WalmartShippingLabelUS.deleteMany({ _id: { $in: idList } });
    await WalmartShippingLabelUS.updateMany(
      { purchaseOrderNumber: multiPalletList[0].purchaseOrderNumber, type: "Case" },
      { $set: { multiPallet: "No", multiPalletID: 0 } }
    );

    res.status(200).send();
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export const getWalmartProducts = async (req: Request, res: Response) => {
  try {
    const list = await WalmartProductsUS.find();
    res.status(200).send(list);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
export const addWalmartProducts = async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    await WalmartProductsUS.updateOne({ walmartItem: data.walmartItem }, data, { upsert: true });
    const list = await WalmartProductsUS.find();
    res.status(200).send(list);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
export const deleteWalmartProducts = async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    const dataList = data.map((item: any) => item.walmartItem);
    await WalmartProductsUS.deleteMany({ walmartItem: dataList });
    const list = await WalmartProductsUS.find();
    res.status(200).send(list);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export const postWalmartASN = async (req: Request, res: Response) => {
  try {
    const data = req.body.data.selection as WalmartOrder[];
    const socketID = req.body.data.socketID.toString();
    const io = req.app.get("io");

    const date = new Date(req.body.data.date);
    const newDate = format(date, "yyyy-MM-dd");
    const newTime = format(date, "HH:mm");

    const asnList = [];

    for (let i = 0; i < data.length; i++) {
      const hasPallet = data[i].hasPalletLabel === "Yes";
      const orderStructureKey = hasPallet ? "hierarchical_level_HL_loop_tare" : "hierarchical_level_HL_loop_pack";
      const parsedPODate = new Date(data[i].purchaseOrderDate);
      const poDate = format(parsedPODate, "yyyy-MM-dd");

      const palletInfo = await WalmartShippingLabelUS.find({ purchaseOrderNumber: data[i].purchaseOrderNumber, type: "Pallet" });
      const caseInfo = await WalmartShippingLabelUS.find({ purchaseOrderNumber: data[i].purchaseOrderNumber, type: "Case" });

      let transactionTotal = 2;

      const getCaseStructure = async (palletID?: number) => {
        const caseList = [];
        let cases;

        if (palletID !== null) cases = caseInfo.filter((item) => item.multiPalletID === palletID);
        else cases = caseInfo;

        for (const item of cases) {
          transactionTotal += 2;
          const productInfo = await WalmartProductsUS.findOne({ walmartItem: item.wmit });
          const caseItem = {
            marks_and_numbers_information_MAN: [
              {
                marks_and_numbers_qualifier_01: "GM",
                marks_and_numbers_02: item.sscc,
              },
            ],
            hierarchical_level_HL_loop: [
              {
                item_identification_LIN: {
                  product_service_id_qualifier_02: "UP",
                  product_service_id_03: productInfo.productGTIN,
                  product_service_id_qualifier_04: "IN",
                  product_service_id_05: item.wmit,
                  product_service_id_qualifier_06: "VN",
                  product_service_id_07: item.vsn,
                },
                item_detail_shipment_SN1: {
                  number_of_units_shipped_02: parseInt(productInfo.caseSize),
                  unit_or_basis_for_measurement_code_03: "EA",
                },
              },
            ],
          };
          caseList.push(caseItem);
        }

        return caseList;
      };

      const getOrderStructure = async () => {
        if (hasPallet) {
          const pallets = [];

          for (const item of palletInfo) {
            transactionTotal += 1;

            const pallet = {
              marks_and_numbers_information_MAN: [
                {
                  marks_and_numbers_qualifier_01: "GM",
                  marks_and_numbers_02: item.sscc,
                },
              ],
              hierarchical_level_HL_loop: await getCaseStructure(palletInfo.length > 1 ? item.multiPalletID : null),
            };

            pallets.push(pallet);
          }

          return pallets;
        } else return await getCaseStructure();
      };

      const asn: WalmartAdvanceShipNotice = {
        heading: {
          transaction_set_header_ST: {
            transaction_set_identifier_code_01: "856",
            transaction_set_control_number_02: i + 1,
          },
          beginning_segment_for_ship_notice_BSN: {
            transaction_set_purpose_code_01: "00",
            shipment_identification_02: "654321",
            date_03: newDate,
            time_04: newTime,
            hierarchical_structure_code_05: "0001",
          },
        },
        detail: {
          hierarchical_level_HL_loop: [
            {
              carrier_details_quantity_and_weight_TD1: [
                {
                  weight_qualifier_06: "G",
                  weight_07: parseInt(data[i].actualWeight),
                  unit_or_basis_for_measurement_code_08: "LB",
                },
              ],
              carrier_details_routing_sequence_transit_time_TD5: [
                {
                  identification_code_qualifier_02: "2",
                  identification_code_03: data[i].carrierSCAC,
                  transportation_method_type_code_04: "M", // maybe
                },
              ],
              reference_information_REF: [
                {
                  reference_identification_qualifier_01: "BM",
                  reference_identification_02: data[i].billOfLading,
                },
                {
                  reference_identification_qualifier_01: "CN",
                  reference_identification_02: data[i].carrierReference,
                },
                {
                  reference_identification_qualifier_01: "LO",
                  reference_identification_02: "0",
                },
                {
                  reference_identification_qualifier_01: "AO",
                  reference_identification_02: "0",
                },
              ],
              date_time_reference_DTM: [
                {
                  date_time_qualifier_01: "011",
                  date_02: newDate,
                },
              ],
              fob_related_instructions_FOB: {
                shipment_method_of_payment_01: data[i].fobMethodOfPayment,
              },
              party_identification_N1_loop: [
                {
                  party_identification_N1: {
                    entity_identifier_code_01: "ST",
                    name_02: data[i].buyingParty,
                    identification_code_qualifier_03: "UL",
                    identification_code_04: data[i].buyingPartyGLN,
                  },
                },
                {
                  party_identification_N1: {
                    entity_identifier_code_01: "SF",
                    name_02: "Green Project Inc",
                    identification_code_qualifier_03: "UL",
                    identification_code_04: "0819952029607",
                  },
                  party_location_N3: [
                    {
                      address_information_01: "815 Echelon Ct",
                    },
                  ],
                  geographic_location_N4: {
                    city_name_01: "City of Industry",
                    state_or_province_code_02: "CA",
                    postal_code_03: "91744",
                    country_code_04: "US",
                  },
                },
              ],
              hierarchical_level_HL_loop: [
                {
                  purchase_order_reference_PRF: {
                    purchase_order_number_01: data[i].purchaseOrderNumber,
                    date_04: poDate,
                  },
                  reference_information_REF: [
                    {
                      reference_identification_qualifier_01: "IA",
                      reference_identification_02: data[i].internalVendorNumber,
                    },
                    {
                      reference_identification_qualifier_01: "DP",
                      reference_identification_02: data[i].departmentNumber,
                    },
                  ],
                  [orderStructureKey]: await getOrderStructure(),
                },
              ],
            },
          ],
        },
        summary: {
          transaction_totals_CTT: {
            number_of_line_items_01: transactionTotal,
          },
        },
      };

      asnList.push(asn);
    }

    const tokens = await mftAuthorization();

    const responseList = [];

    for (const asn of asnList) {
      const control = await walmartCG();
      const poNumber = asn.detail.hierarchical_level_HL_loop[0].hierarchical_level_HL_loop[0].purchase_order_reference_PRF.purchase_order_number_01;
      const order = await WalmartOrdersUS.findOne({ purchaseOrderNumber: poNumber });

      const envelope = {
        interchangeHeader: {
          authorizationInformationQualifier: order.interchangeHeader.authorizationInformationQualifier,
          authorizationInformation: order.interchangeHeader.authorizationInformation,
          securityQualifier: order.interchangeHeader.securityQualifier,
          securityInformation: order.interchangeHeader.securityInformation,
          senderQualifier: order.interchangeHeader.senderQualifier,
          senderId: order.interchangeHeader.senderId,
          receiverQualifier: order.interchangeHeader.receiverQualifier,
          receiverId: order.interchangeHeader.receiverId,
          date: order.interchangeHeader.date,
          time: order.interchangeHeader.time,
          repetitionSeparator: order.interchangeHeader.repetitionSeparator,
          controlVersionNumber: order.interchangeHeader.controlVersionNumber,
          controlNumber: control.serialNumber.toString(),
          acknowledgementRequestedCode: order.interchangeHeader.acknowledgementRequestedCode,
          usageIndicatorCode: order.interchangeHeader.usageIndicatorCode,
          componentSeparator: order.interchangeHeader.componentSeparator,
        },
        groupHeader: {
          functionalIdentifierCode: order.groupHeader.functionalIdentifierCode,
          applicationSenderCode: order.groupHeader.applicationSenderCode,
          applicationReceiverCode: order.groupHeader.applicationReceiverCode,
          date: order.groupHeader.date,
          time: order.groupHeader.time,
          controlNumber: control.serialNumber.toString(),
          agencyCode: order.groupHeader.agencyCode,
          release: order.groupHeader.release,
        },
        groupTrailer: {
          numberOfTransactions: "1",
          controlNumber: control.serialNumber.toString(),
        },
        interchangeTrailer: {
          numberOfFunctionalGroups: "1",
          controlNumber: control.serialNumber.toString(),
        },
      };
      const edi = await walmartTranslate856(asn, envelope);
      io.to(socketID).emit("postWalmartASN", `${poNumber} - Translate completed.`);
      const headers = {
        Authorization: tokens.api_token,
        "AS2-From": "GreenProjectWalmartUS",
        "AS2-To": "08925485US00",
        Subject: "Walmart ASN - Green Project",
        "Attachment-Name": `${poNumber}-ASN.txt`,
        "Content-Type": "text/plain",
      };

      const response = await mftSendMessage(headers, edi);
      io.to(socketID).emit("postWalmartASN", `${poNumber} - ${response.message}`);
      responseList.push(response);
    }

    res.status(200).send(responseList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
export const postWalmartInvoice = async (req: Request, res: Response) => {
  try {
    const data = req.body.data.selection as WalmartOrder[];
    const socketID = req.body.data.socketID.toString();
    const io = req.app.get("io");

    const date = new Date(req.body.data.date);
    const newDate = format(date, "yyyy-MM-dd");
    const newTime = format(date, "HH:mm");

    const invoiceList = [];

    for (const item of data) {
      const saleData = (await getDearSaleOrderAPI(item.purchaseOrderNumber, io, socketID)) as DearSaleOrder;

      const cityStateZip = `${item.buyingPartyCity} ${item.buyingPartyStateOrProvince} ${item.buyingPartyPostalCode} ${item.buyingPartyCountry}`;

      const tds01 = saleData.Invoices[0].Total;
      const tds02 = saleData.Invoices[0].Lines.reduce((a, b) => a + b.Total, 0);
      const tds04 = tds02 * 0.01;
      const tds03 = tds01 - tds04;

      const dateISO = parseISO(saleData.Fulfilments[0].Ship.Lines[0].ShipmentDate.toString());
      const shipDate = format(dateISO, "yyyy-MM-dd");

      const lineItemList: BaselineItemDataInvoiceIT1Loop[] = [];
      for (const line of saleData.Invoices[0].Lines) {
        const walmartItem = await WalmartProductsUS.findOne({ sku: line.SKU });

        const lineItem = {
          baseline_item_data_invoice_IT1: {
            quantity_invoiced_02: line.Quantity,
            unit_or_basis_for_measurement_code_03: "EA",
            unit_price_04: line.Price,
            product_service_id_qualifier_06: "IN",
            product_service_id_07: walmartItem.walmartItem,
            product_service_id_qualifier_08: "UP",
            product_service_id_09: line.ProductCustomField3,
          },
        };
        lineItemList.push(lineItem);
      }

      const invoice: WalmartInvoice = {
        heading: {
          transaction_set_header_ST: {
            transaction_set_identifier_code_01: "810",
            transaction_set_control_number_02: 1,
          },
          beginning_segment_for_invoice_BIG: {
            date_01: newDate,
            invoice_number_02: saleData.Invoices[0].InvoiceNumber.match(/\d+/).join(""),
            date_03: format(new Date(item.purchaseOrderDate), "yyyy-MM-dd"),
            purchase_order_number_04: item.purchaseOrderNumber,
          },
          reference_information_REF: [
            {
              reference_identification_qualifier_01: "IA",
              reference_identification_02: "546382721",
            },
            {
              reference_identification_qualifier_01: "DP",
              reference_identification_02: item.departmentNumber,
            },
          ],
          party_identification_N1_loop: [
            {
              party_identification_N1: {
                entity_identifier_code_01: "SU",
                name_02: "Green Project",
              },
            },
            {
              party_identification_N1: {
                entity_identifier_code_01: "ST",
                name_02: item.buyingParty,
                identification_code_qualifier_03: "UL",
                identification_code_04: item.buyingPartyGLN,
              },
              party_location_N3: [
                {
                  address_information_01: item.buyingPartyStreet,
                  address_information_02: cityStateZip,
                },
              ],
              geographic_location_N4: {
                city_name_01: item.buyingPartyCity,
                state_or_province_code_02: item.buyingPartyStateOrProvince,
                postal_code_03: item.buyingPartyPostalCode,
                country_code_04: item.buyingPartyCountry,
              },
            },
          ],
          terms_of_sale_deferred_terms_of_sale_ITD: [
            {
              terms_type_code_01: "08",
              terms_basis_date_code_02: "3",
              terms_discount_percent_03: 1,
              terms_discount_days_due_05: 50,
              terms_net_days_07: 90,
              terms_discount_amount_08: parseFloat(tds04.toFixed(2)),
              description_12: "Net 90",
            },
          ],
          date_time_reference_DTM: [
            {
              date_time_qualifier_01: "011",
              date_02: shipDate,
            },
          ],
          fob_related_instructions_FOB: {
            shipment_method_of_payment_01: item.fobMethodOfPayment,
          },
        },
        detail: {
          baseline_item_data_invoice_IT1_loop: lineItemList,
        },
        summary: {
          total_monetary_value_summary_TDS: {
            amount_01: tds01,
            amount_02: parseFloat(tds02.toFixed(2)),
            amount_03: parseFloat(tds03.toFixed(2)),
            amount_04: parseFloat(tds04.toFixed(2)),
          },
          service_promotion_allowance_or_charge_information_SAC_loop: [
            {
              service_promotion_allowance_or_charge_information_SAC: {
                allowance_or_charge_indicator_01: "A",
                service_promotion_allowance_or_charge_code_02: "I410",
                amount_05: saleData.Invoices[0].AdditionalCharges[0].Total * -1,
                allowance_or_charge_method_of_handling_code_12: "02",
              },
            },
            {
              service_promotion_allowance_or_charge_information_SAC: {
                allowance_or_charge_indicator_01: "A",
                service_promotion_allowance_or_charge_code_02: "F910",
                amount_05: saleData.Invoices[0].AdditionalCharges[1].Total * -1,
                allowance_or_charge_method_of_handling_code_12: "02",
              },
            },
          ],
          transaction_totals_CTT: {
            number_of_line_items_01: item.transactionTotalsCTTLoop[0].transactionTotalsCTT.numberOfLineItems01,
          },
        },
      };

      invoiceList.push(invoice);
    }

    const tokens = await mftAuthorization();

    const responseList = [];

    for (const invoice of invoiceList) {
      const control = await walmartCG();
      const poNumber = invoice.heading.beginning_segment_for_invoice_BIG.purchase_order_number_04;
      const order = await WalmartOrdersUS.findOne({ purchaseOrderNumber: poNumber });

      const envelope = {
        interchangeHeader: {
          authorizationInformationQualifier: order.interchangeHeader.authorizationInformationQualifier,
          authorizationInformation: order.interchangeHeader.authorizationInformation,
          securityQualifier: order.interchangeHeader.securityQualifier,
          securityInformation: order.interchangeHeader.securityInformation,
          senderQualifier: order.interchangeHeader.senderQualifier,
          senderId: order.interchangeHeader.senderId,
          receiverQualifier: order.interchangeHeader.receiverQualifier,
          receiverId: order.interchangeHeader.receiverId,
          date: order.interchangeHeader.date,
          time: order.interchangeHeader.time,
          repetitionSeparator: order.interchangeHeader.repetitionSeparator,
          controlVersionNumber: order.interchangeHeader.controlVersionNumber,
          controlNumber: control.serialNumber.toString(),
          acknowledgementRequestedCode: order.interchangeHeader.acknowledgementRequestedCode,
          usageIndicatorCode: order.interchangeHeader.usageIndicatorCode,
          componentSeparator: order.interchangeHeader.componentSeparator,
        },
        groupHeader: {
          functionalIdentifierCode: order.groupHeader.functionalIdentifierCode,
          applicationSenderCode: order.groupHeader.applicationSenderCode,
          applicationReceiverCode: order.groupHeader.applicationReceiverCode,
          date: order.groupHeader.date,
          time: order.groupHeader.time,
          controlNumber: control.serialNumber.toString(),
          agencyCode: order.groupHeader.agencyCode,
          release: order.groupHeader.release,
        },
        groupTrailer: {
          numberOfTransactions: "1",
          controlNumber: control.serialNumber.toString(),
        },
        interchangeTrailer: {
          numberOfFunctionalGroups: "1",
          controlNumber: control.serialNumber.toString(),
        },
      };

      const edi = await walmartTranslate810(invoice, envelope);
      io.to(socketID).emit("postWalmartInvoice", `${poNumber} - Translate completed.`);
      const headers = {
        Authorization: tokens.api_token,
        "AS2-From": "GreenProjectWalmartUS",
        "AS2-To": "08925485US00",
        Subject: "Walmart Invoice - Green Project",
        "Attachment-Name": `${poNumber}-invoice.txt`,
        "Content-Type": "text/plain",
      };

      const response = await mftSendMessage(headers, edi);
      io.to(socketID).emit("postWalmartInvoice", `${poNumber} - ${response.message}`);
      responseList.push(response);
    }

    res.status(200).send(responseList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export const postWalmartSync = async (req: Request, res: Response) => {
  try {
    const data = req.body.data.selection as WalmartOrder[];
    const socketID = req.body.data.socketID.toString();
    const io = req.app.get("io");

    const dearList = [];

    for (const order of data) {
      const poNumber = order.purchaseOrderNumber;
      const lineItems = order.baselineItemDataPO1Loop;

      const dearData = await getDearSaleOrderAPI(poNumber, io, socketID);

      dearList.push(dearData);
    }

    res.status(200).send(dearList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
