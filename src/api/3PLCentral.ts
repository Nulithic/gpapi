import axios from "axios";
import { CA3PLCentralAccessToken } from "models/customers/WalmartCA";

const getAccessToken = async () => {
  try {
    const ca3plData = await CA3PLCentralAccessToken.findOne();

    if (!ca3plData || Date.now() >= ca3plData.expiration_timestamp) {
      const data = JSON.stringify({
        grant_type: "client_credentials",
        user_login_id: process.env.WMCA_3PL_USERNAME,
      });

      const key = `${process.env.WMCA_3PL_CLIENT_ID}:${process.env.WMCA_3PL_CLIENT_SECRET}`;
      const base64Key = Buffer.from(key).toString("base64");

      const headers = {
        Host: "secure-wms.com",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip,deflate,sdch",
        "Accept-Language": "en-US,en;q=0.8",
        Authorization: `Basic ${base64Key}`,
      };
      const response = await axios.post("https://secure-wms.com/AuthServer/api/Token", data, { headers: headers });
      let accessTokenData = response.data;
      accessTokenData.expiration_timestamp = Date.now() + accessTokenData.expires_in * 1000;

      await CA3PLCentralAccessToken.updateOne({}, accessTokenData, { upsert: true });

      return accessTokenData.access_token;
    } else {
      console.log("Reuse");
      return ca3plData.access_token;
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const getOrderByReferenceNumber = async (referenceNum: string) => {
  try {
    const headers = {
      Host: "secure-wms.com",
      "Content-Type": "application/hal+json; charset=utf-8",
      Accept: "application/hal+json",
      "Accept-Language": "en-US,en;q=0.8",
      Authorization: `Bearer ${await getAccessToken()}`,
    };

    const response = await axios.get(`https://secure-wms.com/orders?detail=all&itemdetail=all&rql=referenceNum==${referenceNum}`, { headers: headers });
    const orderData = response.data._embedded["http://api.3plCentral.com/rels/orders/order"][0];
    return orderData;
  } catch (err) {
    console.log(err);
    return err;
  }
};
