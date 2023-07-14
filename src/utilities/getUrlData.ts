import axios from "axios";

const getUrlData = async (url: string) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.log(err);
    return;
  }
};

export default getUrlData;
