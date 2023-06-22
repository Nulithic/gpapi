import axios from "axios";
import { Product, ProductList, LocationList, Inventory } from "types/dearTypes";

const headers = {
  "api-auth-accountid": process.env.API_ID,
  "api-auth-applicationkey": process.env.API_KEY,
};

const getDearProductsAPI = async (io: any, socketID: string) => {
  try {
    let products = [];
    const responseTotal = await axios.get("https://inventory.dearsystems.com/ExternalApi/v2/product?Page=1&Limit=1000", {
      headers: headers,
    });

    const productList = responseTotal.data as ProductList;
    const totalProducts = productList.Total;
    const totalPages = Math.ceil(totalProducts / 1000);
    io.to(socketID).emit("getDearProductsMax", totalPages);

    products.push(responseTotal.data.Products);
    io.to(socketID).emit("getDearProducts", 1);

    for (let i = 2; i <= totalPages; i++) {
      try {
        const res = await axios.get(`https://inventory.dearsystems.com/ExternalApi/v2/product?Page=${i}&Limit=1000`, {
          headers: headers,
        });
        products.push(res.data.Products);
        io.to(socketID).emit("getDearProducts", i);
      } catch (e) {
        console.log(`DEAR API Products Error - ${e}`);
        products = [];
        break;
      }
    }
    return products.flat() as Product[];
  } catch (e) {
    console.log(`DEAR API getDearProducts Error - ${e}`);
    return [];
  }
};

const getDearLocationsAPI = async (io: any, socketID: string) => {
  try {
    const siteList = [
      "Main Warehouse",
      "Amazon FBA (NA region) - USA",
      "Amazon FBA (NA region) - CA",
      "CA3PL",
      "GP-MTS",
      "Pending",
      "Adjustment",
      "Products on Hold",
      "Ingram Micro",
      "Testing Only",
    ];
    const locationList = [];

    io.to(socketID).emit("getDearLocationsMax", siteList.length);

    for (let i = 0; i < siteList.length; i++) {
      const res = await axios.get(`https://inventory.dearsystems.com/ExternalApi/v2/ref/location?Name=${siteList[i]}`, {
        headers: headers,
      });
      locationList.push(res.data.LocationList[0]);
      io.to(socketID).emit("getDearLocations", i + 1);
    }

    return locationList as LocationList[];
  } catch (e) {
    console.log(`DEAR API getDearLocations error. - ${e}`);
    return [];
  }
};

const getDearInventoryAPI = async (io: any, socketID: string) => {
  try {
    let inventory = [];
    const responseTotal = await axios.get("https://inventory.dearsystems.com/ExternalApi/v2/ref/productavailability?Page=1&Limit=1000", {
      headers: headers,
    });

    const inventoryList = responseTotal.data;
    const totalStock = inventoryList.Total;
    const totalPages = Math.ceil(totalStock / 1000);
    io.to(socketID).emit("getDearInventoryMax", totalPages);

    inventory.push(inventoryList.ProductAvailabilityList);
    io.to(socketID).emit("getDearInventory", 1);

    for (let i = 2; i <= totalPages; i++) {
      const res = await axios.get(`https://inventory.dearsystems.com/ExternalApi/v2/ref/productavailability?Page=${i}&Limit=1000`, {
        headers: headers,
      });
      inventory.push(res.data.ProductAvailabilityList);
      io.to(socketID).emit("getDearInventory", i);
    }

    return inventory.flat() as Inventory[];
  } catch (e) {
    console.log(`DEAR API getDearInventory error. - ${e}`);
    return [];
  }
};

const getDearSaleOrderAPI = async (search: string, io: any, socketID: string) => {
  try {
    const response = await axios.get(`https://inventory.dearsystems.com/ExternalApi/v2/saleList?Search=${search}`, {
      headers: headers,
    });

    const total = response.data.Total;
    const saleList = response.data.SaleList;
    let filtered;

    if (total > 1) {
      const notVoided = saleList.filter((item: any) => item.Status !== "VOIDED");
      filtered = notVoided[0];
    } else filtered = saleList[0];

    const resSaleOrder = await axios.get(`https://inventory.dearsystems.com/ExternalApi/v2/sale?ID=${filtered.SaleID}`, {
      headers: headers,
    });

    io.to(socketID).emit("getDearSaleOrderAPI", "Sale Order Found.");

    return resSaleOrder.data;
  } catch (e) {
    io.to(socketID).emit("getDearSaleOrderAPI", "Sale Order Not Found.");
    console.log(`DEAR API getDearSaleOrder error. - ${e}`);
    return {};
  }
};
const getDearSaleInvoiceAPI = async (search: string, io: any, socketID: string) => {
  try {
    const response = await axios.get(`https://inventory.dearsystems.com/ExternalApi/v2/saleList?Search=${search}`, {
      headers: headers,
    });

    const total = response.data.Total;
    const saleList = response.data.SaleList;
    let filtered;

    if (total > 1) {
      const notVoided = saleList.filter((item: any) => item.Status !== "VOIDED");
      filtered = notVoided[0];
    } else filtered = saleList[0];

    const resSaleInvoice = await axios.get(`https://inventory.dearsystems.com/ExternalApi/v2/sale/invoice?SaleID=${filtered.SaleID}`, {
      headers: headers,
    });

    io.to(socketID).emit("getDearSaleInvoiceAPI", "Sale Invoice Found.");

    return resSaleInvoice.data;
  } catch (e) {
    io.to(socketID).emit("getDearSaleInvoiceAPI", "Sale Invoice Not Found.");
    console.log(`DEAR API getDearSaleInvoice error. - ${e}`);
    return {};
  }
};

const postDearSaleFulfilmentShipAPI = async (orderNumber: any, shipData: any, io: any, socketID: string) => {
  await axios
    .post("https://inventory.dearsystems.com/ExternalApi/v2/sale/fulfilment/ship", shipData, {
      headers: headers,
    })
    .then((res) => {
      io.to(socketID).emit("postDearSaleFulfilmentShipAPI", `${orderNumber} |  ${res.data.Status}`);
    })
    .catch((error) => {
      if (error.response) {
        console.log(`postDearSaleFulfilmentShipAPI error - ${orderNumber} | ${error.response.data[0].Exception}`);
        io.to(socketID).emit("postDearSaleFulfilmentShipAPI", `${orderNumber} | ${error.response.data[0].Exception}`);
      }
    });
};

const postDearStockTransferAPI = async (transfer: any, io: any, socketID: string) => {
  await axios
    .post("https://inventory.dearsystems.com/ExternalApi/v2/stockTransfer", transfer, {
      headers: headers,
    })
    .then((res) => {
      io.to(socketID).emit("postDearStockTransferAPI", `${res.data.Number}`);
    })
    .catch((error) => {
      if (error.response) {
        console.log(`postDearStockTransferAPI error - ${error.response.data[0].Exception}`);
        io.to(socketID).emit("postDearStockTransferAPI", `${error.response.data[0].Exception}`);
      }
    });
};

const postDearSaleOrderAPI = async (saleOrder: any, io: any, socketID: string) => {
  try {
    const res = await axios.post("https://inventory.dearsystems.com/ExternalApi/v2/sale", saleOrder, {
      headers: headers,
    });

    io.to(socketID).emit("postDearSaleOrderAPI", res.data);

    return res.data;
  } catch (e) {
    console.log(`DEAR API error (postDearSaleOrderAPI) - ${e}`);
    io.to(socketID).emit("postDearSaleOrderAPI", `Order Ref: ${saleOrder.CustomerReference} | DEAR API error (dearSaleOrder) - ${e}`);
    return null;
  }
};

const postDearSaleOrderLinesAPI = async (saleOrderLines: any, io: any, socketID: string) => {
  try {
    const res = await axios.post("https://inventory.dearsystems.com/ExternalApi/v2/sale/order", saleOrderLines, {
      headers: headers,
    });

    io.to(socketID).emit("postDearSaleOrderLinesAPI", res.data);

    return res.data;
  } catch (e) {
    console.log(`DEAR API error (postDearSaleOrderLinesAPI) - ${e}`);
    io.to(socketID).emit("postDearSaleOrderLinesAPI", `SaleID: ${saleOrderLines.SaleID} DEAR API error (postDearSaleOrderLinesAPI) - ${e}`);
    return null;
  }
};

export {
  getDearProductsAPI,
  getDearLocationsAPI,
  getDearInventoryAPI,
  getDearSaleOrderAPI,
  getDearSaleInvoiceAPI,
  postDearSaleFulfilmentShipAPI,
  postDearStockTransferAPI,
  postDearSaleOrderAPI,
  postDearSaleOrderLinesAPI,
};
