import axios from "axios";

const stediHeaders = {
  "Content-Type": "application/json",
  Authorization: `Key ${process.env.STEDI_API_KEY}`,
};

export const walmartTranslate810 = async (data: any, envelope: any) => {
  try {
    const response = await axios.post(
      "https://edi-translate.us.stedi.com/2022-01-01/x12/from-json",
      {
        guideId: "01H30DJR3G430C3JFR135KHBF5",
        input: data,
        envelope: envelope,
      },
      { headers: stediHeaders }
    );

    return response.data.output;
  } catch (err) {
    console.log(err);
    return err.message;
  }
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
export const walmartTranslate856 = async (data: any) => {
  try {
    const response = await axios.post(
      "https://edi-translate.us.stedi.com/2022-01-01/x12/from-json",
      {
        guideId: "01H0V4SK24GYP3HQZSY9BBH6G8",
        input: data,
        envelope: {
          interchangeHeader: {
            authorizationInformationQualifier: "00",
            authorizationInformation: "          ",
            securityQualifier: "00",
            securityInformation: "          ",
            senderQualifier: "ZZ",
            senderId: "546382GP",
            receiverQualifier: "08",
            receiverId: "925485US00",
            date: "2023-05-23",
            time: "16:48",
            repetitionSeparator: ":",
            controlVersionNumber: "00501",
            controlNumber: "000012000",
            acknowledgementRequestedCode: "0",
            usageIndicatorCode: "P",
            componentSeparator: ">",
          },
          groupHeader: {
            functionalIdentifierCode: "SH",
            applicationSenderCode: "546382GP",
            applicationReceiverCode: "925485US00",
            date: "2023-05-23",
            time: "16:48",
            controlNumber: "000012000",
            agencyCode: "X",
            release: "005010",
          },
          groupTrailer: {
            numberOfTransactions: "1",
            controlNumber: "000012000",
          },
          interchangeTrailer: {
            numberOfFunctionalGroups: "1",
            controlNumber: "000012000",
          },
        },
      },
      { headers: stediHeaders }
    );

    return response.data.output;
  } catch (err) {
    console.log(err);
    return err.message;
  }
};
export const walmartTranslate997 = async (data: any, envelope: any) => {
  try {
    const response = await axios.post(
      "https://edi-translate.us.stedi.com/2022-01-01/x12/from-json",
      {
        guideId: "01H2XPVT1BHG3BBGZJX1A627K5",
        input: data,
        envelope: envelope,
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
