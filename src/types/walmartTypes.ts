import { StediPurchaseOrder } from "./Stedi/walmart850";

export interface WalmartTrackerFile {
  "PO Date": number;
  PO: string;
  MABD: string;
  "PO Type": string;
  "PO Event Code": string;
  "DC Number": string;
  BOL: string;
  "Carrier Reference": string;
  "Carrier SCAC": string;
  "Ship Date Scheduled": number;
  "Load Destination": string;
  "Invoice Date": number;
  SO: string;
  "Number of Cartons": string;
  "Actual Weight": string;
  Height: string;
  Width: string;
  Length: string;
  "Floor or Pallet": string;
  Class: string;
  NMFC: string;
}
export interface WalmartTracker {
  purchaseOrderNumber: string;
  actualWeight: string;
  billOfLading: string;
  carrierSCAC: string;
  carrierReference: string;
  class: string;
  nmfc: string;
  floorOrPallet: string;
  height: string;
  width: string;
  length: string;
  invoiceDate: string;
  loadDestination: string;
  mustArriveByDate: string;
  numberOfCartons: string;
  distributionCenterNumber: string;
  purchaseOrderDate: string;
  purchaseOrderType: string;
  purchaseOrderEventCode: string;
  saleOrderNumber: string;
  shipDateScheduled: string;
}

export interface WalmartOrder extends StediPurchaseOrder, WalmartTracker {}
