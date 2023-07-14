import axios from "axios";
import MFTAuthKeys from "models/customers/modelMFTAuthKeys";

const mftInit = async () => {
  try {
    const data = JSON.stringify({
      username: process.env.MFT_GATEWAY_USERNAME,
      password: process.env.MFT_GATEWAY_PASSWORD,
    });

    const res = await axios.post("https://api.mftgateway.com/authorize", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { api_token, refresh_token } = res.data;
    await MFTAuthKeys.findOneAndUpdate({ token_id: "refresh_token" }, { token: refresh_token }, { upsert: true });

    return api_token;
  } catch (err) {
    console.log(err.response.data);
    return err;
  }
};
const mftRefresh = async () => {
  try {
    const refreshToken = await MFTAuthKeys.findOne({ token_id: "refresh_token" });

    const data = JSON.stringify({
      username: process.env.MFT_GATEWAY_USERNAME,
      refreshToken: refreshToken.token,
    });

    const res = await axios.post("https://api.mftgateway.com/refresh-session", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { api_token, refresh_token } = res.data;
    await MFTAuthKeys.findOneAndUpdate({ token_id: "refresh_token" }, { token: refresh_token }, { upsert: true });

    return api_token;
  } catch (err) {
    console.log(err.response.data);
    return false;
  }
};
export const mftAuthorization = async () => {
  try {
    const refresh = await mftRefresh();

    if (!refresh) {
      const init = await mftInit();
      return init;
    }

    return refresh;
  } catch (err) {
    console.log(err);
    return;
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

export const mftGetMessages = async (headers: any, params: any) => {
  try {
    const response = await axios.get("https://api.mftgateway.com/message/inbox", {
      params: {
        partnerIdentifier: params.partner,
      },
      headers: headers,
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};

export const mftReadMessage = async (headers: any, identifier: string) => {
  try {
    const response = await axios.get(`https://api.mftgateway.com/message/inbox/${identifier}`, {
      params: {
        markAsRead: false,
      },
      headers: headers,
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};

export const mftUnreadMessage = async (headers: any, identifier: string) => {
  try {
    const response = await axios.post(`https://api.mftgateway.com/message/inbox/${identifier}/markUnread`, "", {
      headers: headers,
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};

export const mftGetAttachments = async (headers: any, identifier: string) => {
  try {
    const response = await axios.get(`https://api.mftgateway.com/message/inbox/${identifier}/attachments`, {
      headers: headers,
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};
