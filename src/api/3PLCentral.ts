import axios from "axios";

const data = JSON.stringify({
  grant_type: "client_credentials",
  user_login_id: "GREPRO",
});

export const getAuthToken = async () => {
  const key = `${process.env.WMCA_3PL_CLIENT_ID}:${process.env.WMCA_3PL_CLIENT_SECRET}`;
  const base64Key = Buffer.from(key).toString("base64");

  await axios
    .post("https://box.secure-wms.com/AuthServer/api/Token", data, {
      headers: {
        Host: "box.secure-wms.com",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip,deflate,sdch",
        "Accept-Language": "en-US,en;q=0.8",
        Authorization: `Basic ${base64Key}`,
      },
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};
