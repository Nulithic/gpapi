export interface Inventory {
  ID: string;
  SKU: string;
  Name: string;
  Barcode: string;
  Location: string;
  Bin: string;
  OnHand: number;
  Allocated: number;
  Available: number;
  OnOrder: number;
  StockOnHand: number;
  InTransit: number;
}
