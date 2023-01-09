import axios from "axios";
import { Product, ProductList } from "types/dearTypes";

const headers = {
  "api-auth-accountid": process.env.API_ID,
  "api-auth-applicationkey": process.env.API_KEY,
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getDearProducts = async (io: any, socketID: string) => {
  try {
    let products = [];
    const responseTotal = await axios.get("https://inventory.dearsystems.com/ExternalApi/v2/product?Page=1&Limit=1000", {
      headers: headers,
    });

    const productList = responseTotal.data as ProductList;
    const totalProducts = productList.Total;
    const totalPages = Math.ceil(totalProducts / 1000);
    io.to(socketID).emit("getDearProductsMax", totalPages);

    let value = 1;

    products.push(responseTotal.data.Products);
    io.to(socketID).emit("getDearProducts", value);

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
    console.log(`DEAR API Products Error - ${e}`);
    return [];
  }
};

export { getDearProducts };
