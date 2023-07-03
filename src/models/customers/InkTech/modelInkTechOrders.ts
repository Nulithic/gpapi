import mongoose from "mongoose";

const InkTechOrders = mongoose.model(
  "ink_tech_orders",
  new mongoose.Schema(
    {
      sale_id: String,
      sale_order_number: String,
      sale_invoice_number: String,
      customer_reference: String,
      lines: Array,
    },
    { versionKey: false }
  ),
  "ink_tech_orders"
);

export default InkTechOrders;
