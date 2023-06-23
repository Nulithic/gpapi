export interface DearSaleOrder {
  ID: string;
  Customer: string;
  CustomerID: string;
  Contact: string;
  Phone: string;
  Email: string;
  DefaultAccount: string;
  SkipQuote: boolean;
  BillingAddress: BillingAddress;
  ShippingAddress: ShippingAddress;
  ShippingNotes: string;
  BaseCurrency: string;
  CustomerCurrency: string;
  TaxRule: TaxRule;
  TaxCalculation: string;
  Terms: string;
  PriceTier: string;
  ShipBy: Date;
  Location: string;
  SaleOrderDate: Date;
  LastModifiedOn: Date;
  Note: string;
  CustomerReference: string;
  COGSAmount: number;
  Status: string;
  CombinedPickingStatus: string;
  CombinedPackingStatus: string;
  CombinedShippingStatus: string;
  FulFilmentStatus: string;
  CombinedInvoiceStatus: string;
  CombinedPaymentStatus: string;
  CombinedTrackingNumbers: string;
  Carrier: string;
  CurrencyRate: number;
  SalesRepresentative: string;
  ServiceOnly: boolean;
  Type: string;
  SourceChannel: string;
  Quote: Order;
  Order: Order;
  Fulfilments: Fulfilment[];
  Invoices: Invoice[];
  CreditNotes: CreditNote[];
  ManualJournals: ManualJournals;
  ExternalID: string;
  AdditionalAttributes: AdditionalAttributes;
  Attachments: Attachment[];
  InventoryMovements: InventoryMovement[];
  Transactions: any[];
}

export interface AdditionalAttributes {
  AdditionalAttribute1: string;
  AdditionalAttribute2: string;
  AdditionalAttribute3: string;
  AdditionalAttribute4: string;
  AdditionalAttribute5: string;
  AdditionalAttribute6: string;
  AdditionalAttribute7: string;
  AdditionalAttribute8: string;
  AdditionalAttribute9: string;
  AdditionalAttribute10: string;
}

export interface Attachment {
  ID: string;
  ContentType: string;
  FileName: string;
  DownloadUrl: string;
}

export interface BillingAddress {
  DisplayAddressLine1: string;
  DisplayAddressLine2: string;
  Line1: string;
  Line2: string;
  City: string;
  State: string;
  Postcode: string;
  Country: string;
}

export interface CreditNote {
  TaskID: string;
  CreditNoteInvoiceNumber: string;
  Memo: string;
  Status: string;
  CreditNoteDate: null;
  CreditNoteNumber: null;
  CreditNoteConversionRate: number;
  Lines: any[];
  AdditionalCharges: any[];
  Refunds: any[];
  Restock: any[];
  TotalBeforeTax: number;
  Tax: number;
  Total: number;
  RestockStatus: string;
}

export interface Fulfilment {
  TaskID: string;
  FulfillmentNumber: number;
  LinkedInvoiceNumber: null;
  FulFilmentStatus: string;
  Pick: ManualJournals;
  Pack: ManualJournals;
  Ship: Ship;
}

export interface ManualJournals {
  Status: string;
  Lines: ManualJournalsLine[];
}

export interface ManualJournalsLine {
  ProductID: string;
  SKU: string;
  Name: string;
  Location: Location;
  LocationID: string;
  Box?: string;
  Quantity: number;
  BatchSN: null;
  ExpiryDate: null;
  ProductLength: number;
  ProductWidth: number;
  ProductHeight: number;
  ProductWeight: number;
  WeightUnits: WeightUnits | null;
  DimensionsUnits: DimensionsUnits | null;
  ProductCustomField1: null | string;
  ProductCustomField2: string;
  ProductCustomField3: string;
  ProductCustomField4: null | string;
  ProductCustomField5: null | string;
  ProductCustomField6: null | string;
  ProductCustomField7: null | string;
  ProductCustomField8: null | string;
  ProductCustomField9: null | string;
  ProductCustomField10: null | string;
  NonInventory: boolean;
  RestockDate?: null;
  RestockLocationID?: null;
}

export enum DimensionsUnits {
  Empty = "",
  In = "in",
}

export enum Location {
  MainWarehouseFloor = "Main Warehouse: Floor",
}

export enum WeightUnits {
  Empty = "",
  Oz = "oz",
}

export interface Ship {
  Status: string;
  RequireBy: Date;
  ShippingAddress: ShippingAddress;
  ShippingNotes: string;
  Lines: ShipLine[];
}

export interface ShipLine {
  ID: string;
  ShipmentDate: Date;
  Carrier: string;
  Boxes: string;
  TrackingNumber: string;
  TrackingURL: string;
  IsShipped: boolean;
}

export interface ShippingAddress {
  DisplayAddressLine1: string;
  DisplayAddressLine2: string;
  Line1: string;
  Line2: string;
  City: string;
  State: string;
  Postcode: string;
  Country: string;
  Company: string;
  Contact: string;
  ShipToOther: boolean;
}

export interface InventoryMovement {
  TaskID: string;
  ProductID: string;
  Date: Date;
  COGS: number;
  ProductLength: number;
  ProductWidth: number;
  ProductHeight: number;
  ProductWeight: number;
  WeightUnits: WeightUnits | null;
  DimensionsUnits: DimensionsUnits | null;
  ProductCustomField1: null | string;
  ProductCustomField2: string;
  ProductCustomField3: string;
  ProductCustomField4: null | string;
  ProductCustomField5: null | string;
  ProductCustomField6: null | string;
  ProductCustomField7: null | string;
  ProductCustomField8: null | string;
  ProductCustomField9: null | string;
  ProductCustomField10: null | string;
}

export interface Invoice {
  TaskID: string;
  InvoiceNumber: string;
  Memo: string;
  Status: string;
  InvoiceDate: Date;
  InvoiceDueDate: Date;
  CurrencyConversionRate: number;
  BillingAddressLine1: string;
  BillingAddressLine2: string;
  LinkedFulfillmentNumber: null;
  Lines: InvoiceLine[];
  AdditionalCharges: AdditionalCharge[];
  Payments: any[];
  TotalBeforeTax: number;
  Tax: number;
  Total: number;
  Paid: number;
}

export interface AdditionalCharge {
  Description: string;
  Quantity: number;
  Price: number;
  Discount: number;
  Tax: number;
  Total: number;
  TaxRule: TaxRule;
  Account?: string;
  Comment: null | string;
}

export enum TaxRule {
  TaxExempt = "Tax Exempt",
}

export interface InvoiceLine {
  ProductID: string;
  SKU: string;
  Name: string;
  Quantity: number;
  Price: number;
  Discount: number;
  Tax: number;
  Total: number;
  AverageCost: number;
  TaxRule: TaxRule;
  Account?: string;
  Comment: string;
  ProductLength: number;
  ProductWidth: number;
  ProductHeight: number;
  ProductWeight: number;
  WeightUnits: WeightUnits | null;
  DimensionsUnits: DimensionsUnits | null;
  ProductCustomField1: null | string;
  ProductCustomField2: string;
  ProductCustomField3: string;
  ProductCustomField4: null | string;
  ProductCustomField5: null | string;
  ProductCustomField6: null | string;
  ProductCustomField7: null | string;
  ProductCustomField8: null | string;
  ProductCustomField9: null | string;
  ProductCustomField10: null | string;
  DropShip?: boolean;
  BackorderQuantity?: number;
}

export interface Order {
  SaleOrderNumber?: string;
  Memo: string;
  Status: string;
  Lines: InvoiceLine[];
  AdditionalCharges: AdditionalCharge[];
  TotalBeforeTax: number;
  Tax: number;
  Total: number;
  Prepayments?: any[];
}
