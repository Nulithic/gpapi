import axios from "axios";
import { Product, ProductList, LocationList, Inventory } from "types/dearTypes";

const headers = {
  "api-auth-accountid": process.env.API_ID,
  "api-auth-applicationkey": process.env.API_KEY,
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export { getDearProductsAPI, getDearLocationsAPI, getDearInventoryAPI };
