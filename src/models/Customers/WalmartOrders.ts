import mongoose from "mongoose";

const TransactionSetHeaderST = new mongoose.Schema({
  transactionSetIdentifierCode01: String,
  transactionSetControlNumber02: Number,
});

const BeginningSegmentForPurchaseOrderBEG = new mongoose.Schema({
  transactionSetPurposeCode01: String,
  purchaseOrderTypeCode02: String,
  purchaseOrderNumber03: String,
  date05: String,
});
const CurrencyCUR = new mongoose.Schema({ entityIdentifierCode01: String, currencyCode02: String });

const ReferenceInformationRef = new mongoose.Schema({ referenceIdentificationQualifier01: String, referenceIdentification02: String });
const FobRelatedInstructionsFOB = new mongoose.Schema({ shipmentMethodOfPayment01: String, locationQualifier02: String, description03: String });

const ServicePromotionAllowanceOrChargeInformationSAC = new mongoose.Schema({
  allowanceOrChargeIndicator01: String,
  servicePromotionAllowanceOrChargeCode02: String,
  amount05: Number,
  allowanceChargePercentQualifier06: String,
  percentDecimalFormat07: Number,
  allowanceOrChargeMethodOfHandlingCode12: String,
});
const ServicePromotionAllowanceOrChargeInformationSACLoop = new mongoose.Schema({
  servicePromotionAllowanceOrChargeInformationSAC: ServicePromotionAllowanceOrChargeInformationSAC,
});

const TermsOfSaleDeferredTermsOfSaleITD = new mongoose.Schema({
  termsTypeCode01: String,
  termsBasisDateCode02: String,
  termsDiscountPercent03: Number,
  termsDiscountDaysDue05: Number,
  termsNetDays07: Number,
});

const DateTimeReferenceDTM = new mongoose.Schema({ dateTimeQualifier01: String, date02: String });
const CarrierDetailsRoutingSequenceTransitTimeTD5 = new mongoose.Schema({ routingSequenceCode01: String, routing05: String });

const TextMTX = new mongoose.Schema({ textualData02: String });
const ExtendedReferenceInformationN9Loop = new mongoose.Schema({ extendedReferenceInformationN9: ReferenceInformationRef, textMTX: [TextMTX] });

const PartyIdentificationN1 = new mongoose.Schema({
  entityIdentifierCode01: String,
  name02: String,
  identificationCodeQualifier03: String,
  identificationCode04: String,
});
const PartyLocationN3 = new mongoose.Schema({ addressInformation01: String });
const GeographicLocationN4 = new mongoose.Schema({ cityName01: String, stateOrProvinceCode02: String, postalCode03: String, countryCode04: String });

const PartyIdentificationN1Loop = new mongoose.Schema({
  partyIdentificationN1: PartyIdentificationN1,
  partyLocationN3: [PartyLocationN3],
  geographicLocationN4: [GeographicLocationN4],
});

const BaselineItemDataPO1 = new mongoose.Schema({
  assignedIdentification01: String,
  quantity02: Number,
  unitOrBasisForMeasurementCode03: String,
  unitPrice04: Number,
  basisOfUnitPriceCode05: String,
  productServiceIdQualifier06: String,
  productServiceId07: String,
  productServiceIdQualifier08: String,
  productServiceId09: String,
  productServiceIdQualifier10: String,
  productServiceId11: String,
  productServiceIdQualifier14: String,
  productServiceId15: String,
  productServiceIdQualifier22: String,
  productServiceId23: String,
  productServiceIdQualifier12: String,
  productServiceId13: String,
});
const ItemPhysicalDetailsPO4 = new mongoose.Schema({ pack01: Number, innerPack14: Number });

const MonetaryAmountInformationAMT = new mongoose.Schema({ amountQualifierCode01: String, monetaryAmount02: Number });
const MonetaryAmountInformationAMTLoop = new mongoose.Schema({ monetaryAmountInformationAMT: MonetaryAmountInformationAMT });
const BaselineItemDataPO1Loop = new mongoose.Schema({
  baselineItemDataPO1: BaselineItemDataPO1,
  itemPhysicalDetailsPO4: [ItemPhysicalDetailsPO4],
  monetaryAmountInformationAMTLoop: [MonetaryAmountInformationAMTLoop],
});

const TransactionTotalsCTT = new mongoose.Schema({ numberOfLineItems01: Number });
const TransactionTotalsCTTLoop = new mongoose.Schema({
  transactionTotalsCTT: TransactionTotalsCTT,
  monetaryAmountInformationAMT: MonetaryAmountInformationAMT,
});

const TransactionSetTrailerSE = new mongoose.Schema({ numberOfIncludedSegments01: Number, transactionSetControlNumber02: Number });

const WalmartOrders = mongoose.model(
  "WalmartOrders",
  new mongoose.Schema(
    {
      transactionSetHeaderST: TransactionSetHeaderST,
      beginningSegmentForPurchaseOrderBEG: BeginningSegmentForPurchaseOrderBEG,
      currencyCUR: CurrencyCUR,
      referenceInformationREF: [ReferenceInformationRef],
      fobRelatedInstructionsFOB: [FobRelatedInstructionsFOB],
      servicePromotionAllowanceOrChargeInformationSACLoop: [ServicePromotionAllowanceOrChargeInformationSACLoop],
      termsOfSaleDeferredTermsOfSaleITD: [TermsOfSaleDeferredTermsOfSaleITD],
      dateTimeReferenceDTM: [DateTimeReferenceDTM],
      carrierDetailsRoutingSequenceTransitTimeTD5: [CarrierDetailsRoutingSequenceTransitTimeTD5],
      extendedReferenceInformationN9Loop: [ExtendedReferenceInformationN9Loop],
      partyIdentificationN1Loop: [PartyIdentificationN1Loop],
      baselineItemDataPO1Loop: [BaselineItemDataPO1Loop],
      transactionTotalsCTTLoop: [TransactionTotalsCTTLoop],
      transactionSetTrailerSE: TransactionSetTrailerSE,
      purchaseOrderNumber: String,
      actualWeight: String,
      billOfLading: String,
      carrierSCAC: String,
      carrierReference: String,
      class: String,
      nmfc: String,
      floorOrPallet: String,
      height: String,
      width: String,
      length: String,
      invoiceDate: String,
      loadDestination: String,
      mustArriveByDate: String,
      numberOfCartons: String,
      distributionCenterNumber: String,
      purchaseOrderDate: String,
      purchaseOrderType: String,
      purchaseOrderEventCode: String,
      saleOrderNumber: String,
      shipDateScheduled: String,
    },
    { versionKey: false }
  ),
  "WalmartOrders"
);

export default WalmartOrders;
