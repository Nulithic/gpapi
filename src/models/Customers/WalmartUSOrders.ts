import mongoose from "mongoose";

const GroupHeader = new mongoose.Schema(
  {
    functionalIdentifierCode: String,
    applicationSenderCode: String,
    applicationReceiverCode: String,
    controlNumber: String,
    date: String,
    time: String,
    agencyCode: String,
    release: String,
  },
  { _id: false }
);

const GroupTrailer = new mongoose.Schema(
  {
    numberOfTransactions: String,
    controlNumber: String,
  },
  { _id: false }
);

const InterchangeHeader = new mongoose.Schema(
  {
    senderQualifier: String,
    senderId: String,
    receiverQualifier: String,
    receiverId: String,
    controlNumber: String,
    authorizationInformationQualifier: String,
    authorizationInformation: String,
    securityQualifier: String,
    securityInformation: String,
    date: String,
    time: String,
    repetitionSeparator: String,
    acknowledgementRequestedCode: String,
    usageIndicatorCode: String,
    componentSeparator: String,
    controlVersionNumber: String,
  },
  { _id: false }
);

const InterchangeTrailer = new mongoose.Schema(
  {
    numberOfFunctionalGroups: String,
    controlNumber: String,
  },
  { _id: false }
);

const TransactionSetHeaderST = new mongoose.Schema(
  {
    transactionSetIdentifierCode01: String,
    transactionSetControlNumber02: Number,
  },
  { _id: false }
);

const BeginningSegmentForPurchaseOrderBEG = new mongoose.Schema(
  {
    transactionSetPurposeCode01: String,
    purchaseOrderTypeCode02: String,
    purchaseOrderNumber03: String,
    date05: String,
  },
  { _id: false }
);
const CurrencyCUR = new mongoose.Schema({ entityIdentifierCode01: String, currencyCode02: String }, { _id: false });

const ReferenceInformationRef = new mongoose.Schema({ referenceIdentificationQualifier01: String, referenceIdentification02: String }, { _id: false });
const FobRelatedInstructionsFOB = new mongoose.Schema(
  { shipmentMethodOfPayment01: String, locationQualifier02: String, description03: String },
  { _id: false }
);

const ServicePromotionAllowanceOrChargeInformationSAC = new mongoose.Schema(
  {
    allowanceOrChargeIndicator01: String,
    servicePromotionAllowanceOrChargeCode02: String,
    amount05: Number,
    allowanceChargePercentQualifier06: String,
    percentDecimalFormat07: Number,
    allowanceOrChargeMethodOfHandlingCode12: String,
  },
  { _id: false }
);
const ServicePromotionAllowanceOrChargeInformationSACLoop = new mongoose.Schema(
  {
    servicePromotionAllowanceOrChargeInformationSAC: ServicePromotionAllowanceOrChargeInformationSAC,
  },
  { _id: false }
);

const TermsOfSaleDeferredTermsOfSaleITD = new mongoose.Schema(
  {
    termsTypeCode01: String,
    termsBasisDateCode02: String,
    termsDiscountPercent03: Number,
    termsDiscountDaysDue05: Number,
    termsNetDays07: Number,
  },
  { _id: false }
);

const DateTimeReferenceDTM = new mongoose.Schema({ dateTimeQualifier01: String, date02: String }, { _id: false });
const CarrierDetailsRoutingSequenceTransitTimeTD5 = new mongoose.Schema({ routingSequenceCode01: String, routing05: String }, { _id: false });

const TextMTX = new mongoose.Schema({ textualData02: String }, { _id: false });
const ExtendedReferenceInformationN9Loop = new mongoose.Schema({ extendedReferenceInformationN9: ReferenceInformationRef, textMTX: [TextMTX] }, { _id: false });

const PartyIdentificationN1 = new mongoose.Schema(
  {
    entityIdentifierCode01: String,
    name02: String,
    identificationCodeQualifier03: String,
    identificationCode04: String,
  },
  { _id: false }
);
const PartyLocationN3 = new mongoose.Schema({ addressInformation01: String }, { _id: false });
const GeographicLocationN4 = new mongoose.Schema(
  { cityName01: String, stateOrProvinceCode02: String, postalCode03: String, countryCode04: String },
  { _id: false }
);

const PartyIdentificationN1Loop = new mongoose.Schema(
  {
    partyIdentificationN1: PartyIdentificationN1,
    partyLocationN3: [PartyLocationN3],
    geographicLocationN4: [GeographicLocationN4],
  },
  { _id: false }
);

const BaselineItemDataPO1 = new mongoose.Schema(
  {
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
  },
  { _id: false }
);
const ItemPhysicalDetailsPO4 = new mongoose.Schema({ pack01: Number, innerPack14: Number }, { _id: false });

const MonetaryAmountInformationAMT = new mongoose.Schema({ amountQualifierCode01: String, monetaryAmount02: Number }, { _id: false });
const MonetaryAmountInformationAMTLoop = new mongoose.Schema({ monetaryAmountInformationAMT: MonetaryAmountInformationAMT }, { _id: false });
const BaselineItemDataPO1Loop = new mongoose.Schema(
  {
    baselineItemDataPO1: BaselineItemDataPO1,
    itemPhysicalDetailsPO4: [ItemPhysicalDetailsPO4],
    monetaryAmountInformationAMTLoop: [MonetaryAmountInformationAMTLoop],
  },
  { _id: false }
);

const TransactionTotalsCTT = new mongoose.Schema({ numberOfLineItems01: Number }, { _id: false });
const TransactionTotalsCTTLoop = new mongoose.Schema(
  {
    transactionTotalsCTT: TransactionTotalsCTT,
    monetaryAmountInformationAMT: MonetaryAmountInformationAMT,
  },
  { _id: false }
);

const TransactionSetTrailerSE = new mongoose.Schema({ numberOfIncludedSegments01: Number, transactionSetControlNumber02: Number }, { _id: false });

const WalmartUSOrders = mongoose.model(
  "WalmartUSOrders",
  new mongoose.Schema(
    {
      interchangeHeader: InterchangeHeader,
      groupHeader: GroupHeader,
      groupTrailer: GroupTrailer,
      interchangeTrailer: InterchangeTrailer,
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
      purchaseOrderDate: String,
      purchaseOrderNumber: String,
      shipNoLater: String,
      shipNotBefore: String,
      doNotDeliverAfter: String,
      fobMethodOfPayment: String,
      fobPaymentLocation: String,
      buyingParty: String,
      buyingPartyGLN: String,
      buyingPartyStreet: String,
      buyingPartyStreet2: String,
      buyingPartyCity: String,
      buyingPartyStateOrProvince: String,
      buyingPartyPostalCode: String,
      buyingPartyCountry: String,
      departmentNumber: String,
      internalVendorNumber: String,
      purchaseOrderType: String,
      purchaseOrderEventCode: String,
      distributionCenterNumber: String,
      distributionCenterName: String,
      grossValue: String,
      actualWeight: String,
      billOfLading: String,
      carrierSCAC: String,
      carrierName: String,
      carrierReference: String,
      carrierClass: String,
      nmfc: String,
      floorOrPallet: String,
      height: String,
      width: String,
      length: String,
      invoiceDate: String,
      loadDestination: String,
      mustArriveByDate: String,
      numberOfCartons: String,
      saleOrderNumber: String,
      shipDateScheduled: String,
      archived: String,
      asnSent: String,
      invoiceSent: String,
      hasPalletLabel: String,
    },
    { versionKey: false }
  ),
  "WalmartUSOrders"
);

export default WalmartUSOrders;
