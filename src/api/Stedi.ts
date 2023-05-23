import axios from "axios";

const stediHeaders = {
  "Content-Type": "application/json",
  Authorization: `Key ${process.env.STEDI_API_KEY}`,
};

export const walmartTranslate850 = async (data: string) => {
  try {
    const response = await axios.post(
      "https://edi-translate.us.stedi.com/2022-01-01/x12/to-json",
      {
        guideId: "01GSZW6SDHS4CJN30WSNN8NTS0",
        input: data,
      },
      { headers: stediHeaders }
    );

    return response.data.output;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};

export const walmartMap850 = async (translationData: string) => {
  try {
    const startTime = performance.now();

    const data = JSON.stringify(translationData);
    const response = await axios.post("https://mappings.stedi.com/2021-06-01/mappings/01GTAPH54YMYMR4XRD4PNM4RCQ/map", data, { headers: stediHeaders });

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(duration.toFixed(2), "ms");

    return response.data;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};

export const walmartMap810 = async (translationData: string) => {
  try {
    const data = JSON.stringify(translationData);

    const response = await axios.post("https://mappings.stedi.com/2021-06-01/mappings/01GTAPH54YMYMR4XRD4PNM4RCQ/map", data, { headers: stediHeaders });

    return response.data;
  } catch (err) {
    return err.message;
  }
};
export const walmartMap846 = async (translationData: string) => {
  try {
    const data = JSON.stringify(translationData);

    const response = await axios.post("https://mappings.stedi.com/2021-06-01/mappings/01GTAPH54YMYMR4XRD4PNM4RCQ/map", data, { headers: stediHeaders });

    return response.data;
  } catch (err) {
    return err.message;
  }
};
