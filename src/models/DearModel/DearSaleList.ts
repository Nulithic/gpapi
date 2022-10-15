import mongoose from "mongoose";

const DearSaleList = mongoose.model(
  "dear_sale_list",
  new mongoose.Schema(
    {
      sale_id: String,
      order_number: String,
      status: String,
      order_date: String,
      invoice_date: String,
      customer: String,
      customer_id: String,
      invoice_number: String,
      customer_reference: String,
      invoice_amount: Number,
      paid_amount: Number,
      invoice_due_date: String,
      ship_by: String,
      base_currency: String,
      customer_currency: String,
      credit_note_number: String,
      updated: String,
      quote_status: String,
      order_status: String,
      combined_picking_status: String,
      combined_payment_status: String,
      combined_tracking_numbers: String,
      combined_packing_status: String,
      combined_shipping_status: String,
      combined_invoice_status: String,
      credit_note_status: String,
      fulfilment_status: String,
      type: String,
      source_channel: String,
      external_id: String,
      order_location_id: String,
      restock_status: String,
    },
    { versionKey: false }
  ),
  "dear_sale_list"
);

export default DearSaleList;
