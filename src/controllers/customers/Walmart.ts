import { Request, Response } from "express";
import { Translate, Walmart850Mapping } from "api/Stedi";
import { format, parseISO } from "date-fns";
import { scrapB2B, convertHTML } from "puppet/B2B";

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });

const getWalmartOrders = (req: Request, res: Response) => {};

const postWalmartImportEDI = async (req: Request, res: Response) => {
  try {
    const dataEDI = req.body.dataEDI;
    const translationData = await Translate(dataEDI);
    const data = await Walmart850Mapping(translationData);

    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
};
const postWalmartImportHTML = (req: Request, res: Response) => {
  try {
    const dataHTML = req.body.dataHTML;
    console.log(dataHTML);
    res.status(200).send(dataHTML);
  } catch (err) {
    res.status(500).send(err);
  }
};
const postWalmartImportB2B = async (req: Request, res: Response) => {
  const dataB2B = req.body.dataB2B;
  const socketID = req.body.socketID.toString();
  const io = req.app.get("io");

  const day = format(parseISO(dataB2B.date), "dd");
  const monthYear = format(parseISO(dataB2B.date), "yyyyMM");

  console.log(day, monthYear);

  try {
    const data = await scrapB2B(day, monthYear, io, socketID);

    // const data = [
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1190074795&dt=ASN&gcn=29766&scn=1&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1190074447&dt=ASN&gcn=29765&scn=1&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1190051274&dt=b2b820&gcn=820100690&scn=100693&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1190049174&dt=b2b812&gcn=812101237&scn=102089&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189871212&dt=POS&gcn=850100488&scn=109460&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189771538&dt=b2b812&gcn=812101236&scn=102088&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109459&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109458&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109457&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109456&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109455&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109454&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109453&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109452&ym=202303",
    //   "https://www.b2bgateway.net/docview/default.aspx?c=SS125201140714PM&id=1189743040&dt=POS&gcn=850100487&scn=109451&ym=202303",
    // ];

    const POS = data.filter((item) => new URLSearchParams(item).get("dt") === "POS");
    io.to(socketID).emit("postWalmartImportB2B", `Total POS found: ${POS.length}`);

    let posList = [];
    for (let i = 0; i < POS.length; i++) {
      const text = await convertHTML(POS[i]);
      posList.push(text);
      io.to(socketID).emit("postWalmartImportB2B", `Extration ${i + 1} completed.`);
    }

    // group EDIs by control number
    const group = groupBy(posList, (v) => v.id);
    let groupList = [];
    for (const [key, value] of Object.entries(group)) {
      let edi = value[0].header;
      for (const item of value) {
        edi = edi + item.body;
      }
      edi = edi + value[0].footer;
      edi = edi.replace(/~~/g, "~");
      groupList.push(edi);
    }

    let translationList = [];
    for (const item of groupList) {
      const translationData = await Translate(item);
      io.to(socketID).emit("postWalmartImportB2B", "Translate EDI completed.");

      const data = await Walmart850Mapping(translationData);
      io.to(socketID).emit("postWalmartImportB2B", "Map EDI completed.");

      translationList.push(data);
    }
    io.to(socketID).emit("postWalmartImportB2B", "Import completed.");

    res.status(200).send(translationList);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
const postWalmartImportTracker = (req: Request, res: Response) => {};
const postWalmartImportLocation = (req: Request, res: Response) => {};

export default { getWalmartOrders, postWalmartImportEDI, postWalmartImportHTML, postWalmartImportB2B, postWalmartImportTracker, postWalmartImportLocation };
