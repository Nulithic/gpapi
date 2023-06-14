import axios from "axios";

const data = JSON.stringify({
  username: process.env.MFT_GATEWAY_USERNAME,
  password: process.env.MFT_GATEWAY_PASSWORD,
});

export const mftAuthorization = async () => {
  try {
    const response = await axios.post("https://api.mftgateway.com/authorize", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};

export const mftSendMessage = async (headers: any, data: any) => {
  try {
    const response = await axios.post("https://api.mftgateway.com/message/submit?service=as2", data, { headers: headers });
    return response.data;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};
