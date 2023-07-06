import { WalmartPurchaseOrder } from "./stedi850";

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
  purchaseOrderDate: string;
  purchaseOrderNumber: string;
  distributionCenterNumber: string;
  purchaseOrderType: string;
  purchaseOrderEventCode: string;
  actualWeight: string;
  billOfLading: string;
  carrierName: string;
  carrierSCAC: string;
  carrierReference: string;
  carrierClass: string;
  nmfc: string;
  floorOrPallet: string;
  height: string;
  width: string;
  length: string;
  invoiceDate: string;
  loadDestination: string;
  mustArriveByDate: string;
  numberOfCartons: string;
  saleOrderNumber: string;
  shipDateScheduled: string;
}

export interface WalmartTable {
  shipNoLater: string;
  shipNotBefore: string;
  doNotDeliverAfter: string;
  fobMethodOfPayment: string;
  fobPaymentLocation: string;
  buyingParty: string;
  buyingPartyGLN: string;
  buyingPartyStreet: string;
  buyingPartyStreet2: string;
  buyingPartyCity: string;
  buyingPartyStateOrProvince: string;
  buyingPartyPostalCode: string;
  buyingPartyCountry: string;
  departmentNumber: string;
  internalVendorNumber: string;
  grossValue: string;
  archived: string;
  asnSent: string;
  invoiceSent: string;
  distributionCenterName: string;
  hasPalletLabel: string;
}

export interface WalmartOrder extends WalmartPurchaseOrder, WalmartTracker, WalmartTable {}

export interface SelectionWithLabels extends WalmartOrder {
  [key: string]: any;
  pallet: boolean;
  cases: boolean;
  multiPallet: boolean;
}

export interface WalmartLabel {
  _id?: string;
  purchaseOrderNumber?: string;
  supplierParty?: string;
  supplierPartyStreet?: string;
  supplierPartyAddress?: string;
  buyingParty?: string;
  buyingPartyStreet?: string;
  buyingPartyAddress?: string;
  distributionCenterNumber?: string;
  purchaseOrderType?: string;
  departmentNumber?: string;
  wmit?: string;
  vsn?: string;
  numberOfCases?: number;
  serialNumber?: number;
  type?: string;
  multiPallet?: string;
  multiPalletID?: number;
  sscc?: string;
  date?: string;
}
