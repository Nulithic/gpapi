import { Request, Response } from "express";
import { format, parseISO } from "date-fns";
import fs from "fs";
import path from "path";

import { walmartTranslate850, walmartMap850, walmartTranslate856, walmartTranslate997 } from "api/Stedi";
import { mftAuthorization, mftSendMessage } from "api/MFTGateway";
import { scrapB2B, convertHTML } from "puppet/B2B";
import { Customers } from "models";
import { WalmartAdvanceShipNotice } from "types/WalmartUS/stedi856";
import { WalmartOrder, WalmartTrackerFile, WalmartLabel } from "types/WalmartUS/walmartTypes";
import { userAction } from "utilities/userAction";
import walmartSSCC from "utilities/walmartSSCC";

import walmartPackingSlip from "templates/walmartPackingSlip";
import walmartUnderlyingBOL from "templates/walmartUnderlyingBOL";

import walmartCaseLabel from "templates/walmartCaseLabel";
import walmartPalletLabel from "templates/walmartPalletLabel";
import walmartMasterBOL from "templates/walmartMasterBOL";
import walmartCG from "utilities/walmartCG";

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

const postWalmartUSImportMFT = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postWalmartUSImportMFT");

    // get edi
    const filePath = path.join(__dirname, "orders.txt");
    const dataEDI = fs.readFileSync(filePath, "utf8");
    //const dataEDI = await mftReceiveMessage();

    // translate and map edi to json
    const translationData = await walmartTranslate850(dataEDI);
    const data = (await walmartMap850(translationData)) as WalmartOrder[];

    // save to local db
    const ak2List = [];
    for (const item of data) {
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

    res.status(200).send(response);
  } catch (err) {
    res.status(500).send(err);
  }
};
const postWalmartUSImportEDI = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "postWalmartImportEDI");

    const dataEDI = req.body.dataEDI;
    const translationData = await walmartTranslate850(dataEDI);
    const data = await walmartMap850(translationData);

    for (const item of data) {
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
      const translationData = await walmartTranslate850(item);
      io.to(socketID).emit("postWalmartImportB2B", "Translate EDI completed.");

      const data = await walmartMap850(translationData);
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
          hasPalletLabel: "No",
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

    const caseSizes = await Customers.WalmartUSProducts.find();

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

    const existingList = await Customers.WalmartUSLabelCodes.find({ purchaseOrderNumber: { $in: unqiueOrders }, type: "Case" });

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

    const caseSizes = await Customers.WalmartUSProducts.find();

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
            multiPallet: "No",
            sscc: ssccData.sscc,
            date: new Date().toLocaleString(),
          };

          await Customers.WalmartUSLabelCodes.create(caseLabel);

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
    await Customers.WalmartUSLabelCodes.deleteMany({ purchaseOrderNumber: { $in: orderList }, type: "Case" });

    const caseSizes = await Customers.WalmartUSProducts.find();
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
            multiPallet: "No",
            sscc: ssccData.sscc,
            date: new Date().toLocaleString(),
          };

          await Customers.WalmartUSLabelCodes.create(caseLabel);

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

    const existingList = await Customers.WalmartUSLabelCodes.find({ purchaseOrderNumber: { $in: unqiueOrders }, type: "Pallet" });

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

    const caseSizes = await Customers.WalmartUSProducts.find();
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
        multiPallet: "No",
        sscc: ssccData.sscc,
        date: new Date().toLocaleString(),
      };

      await Customers.WalmartUSLabelCodes.create(palletLabel);

      palletLabelList.push(palletLabel);

      await Customers.WalmartUSOrders.findOneAndUpdate({ purchaseOrderNumber: selection.purchaseOrderNumber }, { hasPalletLabel: "Yes" });
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
    await Customers.WalmartUSLabelCodes.deleteMany({ purchaseOrderNumber: { $in: orderList }, type: "Pallet" });

    const caseSizes = await Customers.WalmartUSProducts.find();
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
        multiPallet: "No",
        sscc: ssccData.sscc,
        date: new Date().toLocaleString(),
      };

      await Customers.WalmartUSLabelCodes.create(palletLabel);

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

const checkWalmartUSMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "checkWalmartUSMultiPalletLabel");
    const data = req.body;

    const linesItems = [];
    for (const item of data.Order.Lines) {
      const product = await Customers.WalmartUSProducts.findOne({ sku: item.SKU });
      linesItems.push({ sku: item.SKU, upc: item.Walmart, qty: item.Quantity, caseCount: item.Quantity / parseInt(product.caseSize) });
    }
    const order = {
      purchaseOrderNumber: data.CustomerReference,
      lineItems: linesItems,
    };

    const totalCases = order.lineItems.reduce((previous, current) => previous + current.caseCount, 0);
    const caseLabels = await Customers.WalmartUSLabelCodes.find({ purchaseOrderNumber: data.CustomerReference, type: "Case" });
    const ssccList = caseLabels.map((item) => item.sscc);

    if (totalCases !== caseLabels.length) {
      console.log("Total cases do not match with case labels.");
      console.log(`DEAR: ${totalCases}`);
      console.log(`GP Apps: ${caseLabels.length}`);
      return res.status(400).send("Total cases do not match with case labels.");
    }

    await Customers.WalmartUSLabelCodes.deleteMany({ purchaseOrderNumber: data.CustomerReference, type: "Pallet", multiPallet: "No" });

    const multiPallet = await Customers.WalmartUSLabelCodes.find({ purchaseOrderNumber: data.CustomerReference, type: "Pallet", multiPallet: "Yes" });
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
const submitWalmartUSMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "submitWalmartUSMultiPalletLabel");
    const pallets = req.body.pallets as Array<Array<String>>;

    const orderData = await Customers.WalmartUSLabelCodes.findOne({ sscc: pallets[0][0] });

    for (let i = 0; i < pallets.length; i++) {
      let itemList: string[] = [];

      for (let k = 0; k < pallets[i].length; k++) {
        const item = await Customers.WalmartUSLabelCodes.findOne({ sscc: pallets[i][k] }, { wmit: 1 });
        itemList.push(item.wmit);

        await Customers.WalmartUSLabelCodes.findOneAndUpdate({ sscc: pallets[i][k] }, { $set: { multiPallet: "Yes", multiPalletID: i } });
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

      await Customers.WalmartUSLabelCodes.create(palletLabel);

      await Customers.WalmartUSOrders.findOneAndUpdate({ purchaseOrderNumber: orderData.purchaseOrderNumber }, { hasPalletLabel: "Yes" });
    }

    return res.status(200).send("Success");
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};
const downloadWalmartUSMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "downloadWalmartUSMultiPalletLabel");

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
const deleteWalmartUSMultiPalletLabel = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "deleteWalmartUSMultiPalletLabel");
    const multiPalletList = req.body.data as WalmartLabel[];
    const idList = multiPalletList.map((item) => item._id);

    await Customers.WalmartUSLabelCodes.deleteMany({ _id: { $in: idList } });
    await Customers.WalmartUSLabelCodes.updateMany(
      { purchaseOrderNumber: multiPalletList[0].purchaseOrderNumber, type: "Case" },
      { $set: { multiPallet: "No", multiPalletID: 0 } }
    );

    res.status(200).send();
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const getWalmartUSProducts = async (req: Request, res: Response) => {
  try {
    const list = await Customers.WalmartUSProducts.find();
    res.status(200).send(list);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
const addWalmartUSProducts = async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    await Customers.WalmartUSProducts.updateOne({ walmartItem: data.walmartItem }, data, { upsert: true });
    const list = await Customers.WalmartUSProducts.find();
    res.status(200).send(list);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const deleteWalmartUSProducts = async (req: Request, res: Response) => {
  try {
    const data = req.body.data;
    const dataList = data.map((item: any) => item.walmartItem);
    await Customers.WalmartUSProducts.deleteMany({ walmartItem: dataList });
    const list = await Customers.WalmartUSProducts.find();
    res.status(200).send(list);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

const postWalmartASN = async (req: Request, res: Response) => {
  try {
    const data = req.body.data.selection as WalmartOrder[];
    const date = new Date(req.body.data.date);
    const newDate = format(date, "yyyy-MM-dd");
    const newTime = format(date, "HH:mm");

    const asnList = [];

    for (let i = 0; i < data.length; i++) {
      const hasPallet = data[i].hasPalletLabel === "Yes";
      const orderStructureKey = hasPallet ? "hierarchical_level_HL_loop_tare" : "hierarchical_level_HL_loop_pack";
      const parsedPODate = new Date(data[i].purchaseOrderDate);
      const poDate = format(parsedPODate, "yyyy-MM-dd");

      const palletInfo = await Customers.WalmartUSLabelCodes.find({ purchaseOrderNumber: data[i].purchaseOrderNumber, type: "Pallet" });
      const caseInfo = await Customers.WalmartUSLabelCodes.find({ purchaseOrderNumber: data[i].purchaseOrderNumber, type: "Case" });

      let transactionTotal = 2;

      const getCaseStructure = async (palletID?: number) => {
        const caseList = [];
        let cases;

        if (palletID !== null) cases = caseInfo.filter((item) => item.multiPalletID === palletID);
        else cases = caseInfo;

        for (const item of cases) {
          transactionTotal += 2;
          const productInfo = await Customers.WalmartUSProducts.findOne({ walmartItem: item.wmit });
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
      const edi = await walmartTranslate856(asn);
      const poNumber = asn.detail.hierarchical_level_HL_loop[0].hierarchical_level_HL_loop[0].purchase_order_reference_PRF.purchase_order_number_01;
      const headers = {
        Authorization: tokens.api_token,
        "AS2-From": "GreenProjectWalmartUS",
        "AS2-To": "08925485US00",
        Subject: "Walmart ASN - Green Project",
        "Attachment-Name": `${poNumber}-ASN.txt`,
        "Content-Type": "text/plain",
      };

      const response = await mftSendMessage(headers, edi);
      responseList.push(response);
    }

    res.status(200).send(responseList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const postWalmartInvoice = async (req: Request, res: Response) => {
  try {
    const data = req.body.data.selection as WalmartOrder[];
    res.status(200).send();
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export default {
  getWalmartUSOrders,
  postWalmartUSImportMFT,
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
  checkWalmartUSMultiPalletLabel,
  submitWalmartUSMultiPalletLabel,
  downloadWalmartUSMultiPalletLabel,
  deleteWalmartUSMultiPalletLabel,
  getWalmartUSProducts,
  addWalmartUSProducts,
  deleteWalmartUSProducts,
  postWalmartASN,
  postWalmartInvoice,
};
