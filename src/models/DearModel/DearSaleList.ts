import mongoose from "mongoose";

const DearSaleList = mongoose.model(
  "DearSaleList",
  new mongoose.Schema(
    {
      saleID: String,
      orderNumber: String,
      status: String,
      orderDate: String,
      invoiceDate: String,
      customer: String,
      customerID: String,
      invoiceNumber: String,
      customerReference: String,
      invoiceAmount: Number,
      paidAmount: Number,
      invoiceDueDate: String,
      shipBy: String,
      baseCurrency: String,
      customerCurrency: String,
      creditNoteNumber: String,
      updated: String,
      quoteStatus: String,
      orderStatus: String,
      combinedPickingStatus: String,
      combinedPaymentStatus: String,
      combinedTrackingNumbers: String,
      combinedPackingStatus: String,
      combinedShippingStatus: String,
      combinedInvoiceStatus: String,
      creditNoteStatus: String,
      fulFilmentStatus: String,
      type: String,
      sourceChannel: String,
      externalID: String,
      orderLocationID: String,
      restockStatus: String,
    },
    { versionKey: false }
  ),
  "DearSaleList"
);

export default DearSaleList;
