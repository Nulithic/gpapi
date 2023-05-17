export interface StediPurchaseOrder {
  transactionSetHeaderST: TransactionSetHeaderST;
  beginningSegmentForPurchaseOrderBEG: BeginningSegmentForPurchaseOrderBEG;
  currencyCUR: CurrencyCUR;
  referenceInformationREF: ReferenceInformationRef[];
  fobRelatedInstructionsFOB: FobRelatedInstructionsFOB[];
  servicePromotionAllowanceOrChargeInformationSACLoop: ServicePromotionAllowanceOrChargeInformationSACLoop[];
  termsOfSaleDeferredTermsOfSaleITD: TermsOfSaleDeferredTermsOfSaleITD[];
  dateTimeReferenceDTM: DateTimeReferenceDTM[];
  carrierDetailsRoutingSequenceTransitTimeTD5: CarrierDetailsRoutingSequenceTransitTimeTD5[];
  extendedReferenceInformationN9Loop: ExtendedReferenceInformationN9Loop[];
  partyIdentificationN1Loop: PartyIdentificationN1Loop[];
  baselineItemDataPO1Loop: BaselineItemDataPO1Loop[];
  transactionTotalsCTTLoop: TransactionTotalsCTTLoop[];
  transactionSetTrailerSE: TransactionSetTrailerSE;
}

export interface BaselineItemDataPO1Loop {
  baselineItemDataPO1: BaselineItemDataPO1;
  itemPhysicalDetailsPO4: ItemPhysicalDetailsPO4[];
  monetaryAmountInformationAMTLoop: MonetaryAmountInformationAMTLoop[];
}

export interface BaselineItemDataPO1 {
  assignedIdentification01: string;
  quantity02: number;
  unitOrBasisForMeasurementCode03: string;
  unitPrice04: number;
  basisOfUnitPriceCode05: string;
  productServiceIdQualifier06: string;
  productServiceId07: string;
  productServiceIdQualifier08: string;
  productServiceId09: string;
  productServiceIdQualifier10: string;
  productServiceId11: string;
  productServiceIdQualifier14: string;
  productServiceId15: string;
  productServiceIdQualifier22: string;
  productServiceId23: string;
  productServiceIdQualifier12?: string;
  productServiceId13?: string;
  numberOfCases?: number;
}

export interface ItemPhysicalDetailsPO4 {
  pack01: number;
  innerPack14: number;
}

export interface MonetaryAmountInformationAMTLoop {
  monetaryAmountInformationAMT: MonetaryAmountInformationAMT;
}

export interface MonetaryAmountInformationAMT {
  amountQualifierCode01: string;
  monetaryAmount02: number;
}

export interface BeginningSegmentForPurchaseOrderBEG {
  transactionSetPurposeCode01: string;
  purchaseOrderTypeCode02: string;
  purchaseOrderNumber03: string;
  date05: string;
}

export interface CarrierDetailsRoutingSequenceTransitTimeTD5 {
  routingSequenceCode01: string;
  routing05: string;
}

export interface CurrencyCUR {
  entityIdentifierCode01: string;
  currencyCode02: string;
}

export interface DateTimeReferenceDTM {
  dateTimeQualifier01: string;
  date02: string;
}

export interface ExtendedReferenceInformationN9Loop {
  extendedReferenceInformationN9: ReferenceInformationRef;
  textMTX: TextMTX[];
}

export interface ReferenceInformationRef {
  referenceIdentificationQualifier01: string;
  referenceIdentification02: string;
}

export interface TextMTX {
  textualData02: string;
}

export interface FobRelatedInstructionsFOB {
  shipmentMethodOfPayment01: string;
  locationQualifier02: string;
  description03: string;
}

export interface PartyIdentificationN1Loop {
  partyIdentificationN1: PartyIdentificationN1;
  partyLocationN3?: PartyLocationN3[];
  geographicLocationN4?: GeographicLocationN4[];
}

export interface GeographicLocationN4 {
  cityName01: string;
  stateOrProvinceCode02: string;
  postalCode03: string;
  countryCode04: string;
}

export interface PartyIdentificationN1 {
  entityIdentifierCode01: string;
  name02: string;
  identificationCodeQualifier03?: string;
  identificationCode04?: string;
}

export interface PartyLocationN3 {
  addressInformation01: string;
}

export interface ServicePromotionAllowanceOrChargeInformationSACLoop {
  servicePromotionAllowanceOrChargeInformationSAC: ServicePromotionAllowanceOrChargeInformationSAC;
}

export interface ServicePromotionAllowanceOrChargeInformationSAC {
  allowanceOrChargeIndicator01: string;
  servicePromotionAllowanceOrChargeCode02: string;
  amount05: number;
  allowanceChargePercentQualifier06: string;
  percentDecimalFormat07: number;
  allowanceOrChargeMethodOfHandlingCode12: string;
}

export interface TermsOfSaleDeferredTermsOfSaleITD {
  termsTypeCode01: string;
  termsBasisDateCode02: string;
  termsDiscountPercent03: number;
  termsDiscountDaysDue05: number;
  termsNetDays07: number;
}

export interface TransactionSetHeaderST {
  transactionSetIdentifierCode01: string;
  transactionSetControlNumber02: number;
}

export interface TransactionSetTrailerSE {
  numberOfIncludedSegments01: number;
  transactionSetControlNumber02: number;
}

export interface TransactionTotalsCTTLoop {
  transactionTotalsCTT: TransactionTotalsCTT;
  monetaryAmountInformationAMT: MonetaryAmountInformationAMT;
}

export interface TransactionTotalsCTT {
  numberOfLineItems01: number;
}
