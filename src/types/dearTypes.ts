export interface ProductList {
  Total: number;
  Page: number;
  Products: Product[];
}
export interface Product {
  ID: string;
  SKU: string;
  Name: string;
  Category: string;
  Brand: string;
  Type: string;
  CostingMethod: string;
  DropShipMode: string;
  DefaultLocation: string;
  Length: number;
  Width: number;
  Height: number;
  Weight: number;
  UOM: string;
  WeightUnits: string;
  DimensionsUnits: string;
  Barcode: string;
  MinimumBeforeReorder: number;
  ReorderQuantity: number;
  PriceTier1: number;
  PriceTier2: number;
  PriceTier3: number;
  PriceTier4: number;
  PriceTier5: number;
  PriceTier6: number;
  PriceTier7: number;
  PriceTier8: number;
  PriceTier9: number;
  PriceTier10: number;
  PriceTiers: { Low: number; "L-M": number; Mid: number; "M-H": number; High: number; "Flat Rate": number };
  AverageCost: number;
  ShortDescription: string;
  InternalNote: string;
  Description: string;
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
  AttributeSet: string;
  DiscountRule: string;
  Tags: string;
  Status: string;
  StockLocator: string;
  COGSAccount: string;
  RevenueAccount: string;
  ExpenseAccount: string;
  InventoryAccount: string;
  PurchaseTaxRule: string;
  SaleTaxRule: string;
  LastModifiedOn: string;
  Sellable: boolean;
  PickZones: string;
  BillOfMaterial: boolean;
  AutoAssembly: boolean;
  AutoDisassembly: boolean;
  QuantityToProduce: number;
  AlwaysShowQuantity: number;
  AssemblyInstructionURL: string;
  AssemblyCostEstimationMethod: string;
  Suppliers: any[];
  ReorderLevels: any[];
  BillOfMaterialsProducts: any[];
  BillOfMaterialsServices: any[];
  Movements: any[];
  Attachments: any[];
  BOMType: string;
  WarrantyName: string;
  CustomPrices: any[];
  CartonHeight: number;
  CartonWidth: number;
  CartonLength: number;
  CartonQuantity: number;
  CartonInnerQuantity: number;
}

export interface LocationList {
  ID: string;
  Name: string;
  Bins: Bin[];
}
export interface Bin {
  ID: string;
  Name: string;
}

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
