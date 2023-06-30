import { Request, Response } from "express";
import { format, parseISO } from "date-fns";
import { Customers } from "models";
import { userAction } from "utilities/userAction";
import { HSNOrder } from "types/hsnTypes";
import { postDearSaleOrderAPI, postDearSaleOrderLinesAPI } from "api/DearSystems";
import HSNPriceList from "models/customers/HSNPriceList";
import sleep from "utilities/sleep";

const postHSNImport = async (req: Request, res: Response) => {
  try {
    const data = req.body.importData as HSNOrder[];

    const socketID = req.body.socketID.toString();
    const io = req.app.get("io");

    const priceList = await HSNPriceList.find();

    const findPrice = (data: any) => {
      const product = priceList.find((item) => item.sku === data);
      if (!product) return 0;
      return product.price;
    };

    const orderList = data.map((item) => ({
      OrderDate: new Date(Date.UTC(0, 0, item["PO Date"])),
      Quantity: item.QTY,
      Product: item["Supplier Product Code"],
      Price: item["Supplier Unit Sell"],
      Customer: "HSN",
      Contact: "AP",
      Phone: "",
      Email: "AccountsPayable@hsn.net",
      DefaultAccount: "47900",
      SkipQuote: true,
      BillingAddress: {
        DisplayAddressLine1: "1 HSN Drive",
        DisplayAddressLine2: "Saint Petersburg FL 33729 United States",
        Line1: "1 HSN Drive",
        Line2: "",
        City: "Saint Petersburg",
        State: "FL",
        Postcode: "33729",
        Country: "United States",
      },
      ShippingAddress: {
        DisplayAddressLine1: item["Consumer Ship To Address 1"].replace(/(\s+$)/, ""),
        DisplayAddressLine2: `${item["Consumer Ship To City"].replace(/(\s+$)/, "")} ${item["Consumer Ship To State"].replace(/(\s+$)/, "")} ${item[
          "Consumer Ship To Zip"
        ].replace(/(\s+$)/, "")} United States`,
        Line1: item["Consumer Ship To Address 1"].replace(/(\s+$)/, ""),
        Line2: item["Consumer Ship To Address 2"].replace(/(\s+$)/, ""),
        City: item["Consumer Ship To City"].replace(/(\s+$)/, ""),
        State: item["Consumer Ship To State"].replace(/(\s+$)/, ""),
        Postcode: item["Consumer Ship To Zip"].replace(/(\s+$)/, ""),
        Country: "United States",
        Company: item["Consumer Ship To Name"].replace(/(\s+$)/, ""),
        Contact: "",
        ShipToOther: true,
      },
      ShippingNotes: "",
      BaseCurrency: "USD",
      CustomerCurrency: "USD",
      TaxRule: "Tax Exempt",
      TaxCalculation: "Exclusive",
      Terms: "Net 60",
      PriceTier: "High",
      Location: "Main Warehouse",
      Note: "",
      CustomerReference: item["PO Number"],
      Carrier: "Custom Label UPS",
      SalesRepresentative: "DW",
    }));

    for (const [index, order] of orderList.entries()) {
      io.to(socketID).emit("postHSNImport", `Order ${index + 1}/${orderList.length}`);
      const resSaleOrder = await postDearSaleOrderAPI(order, io, socketID);

      if (resSaleOrder) {
        const saleOrderLines = {
          SaleID: resSaleOrder.ID,
          Memo: "",
          Status: "DRAFT",
          Lines: [
            {
              SKU: order.Product,
              Quantity: order.Quantity,
              TaxRule: "Tax Exempt",
              Price: findPrice(order.Product),
              Comment: "",
              Tax: "0",
              Discount: "0",
              Total: findPrice(order.Product) * order.Quantity,
            },
          ],
          AdditionalCharges: [
            {
              Description: "HSN Allowance 3.25%",
              Comment: "3.25% Allowance",
              Price: (-findPrice(order.Product) * 0.0325).toFixed(2),
              Quantity: 1,
              Tax: "0",
              TaxRule: "Tax Exempt",
              Total: (-findPrice(order.Product) * 0.0325).toFixed(2),
            },
          ],
        };

        await postDearSaleOrderLinesAPI(saleOrderLines, io, socketID);
      }

      await sleep(3000);
    }

    res.status(200).send(orderList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

export default { postHSNImport };
