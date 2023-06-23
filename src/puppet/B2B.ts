import puppeteer from "puppeteer";
import axios from "axios";
import { load } from "cheerio";

export const scrapB2B = async (day: string, monthYear: string, io: any, socketID: string) => {
  let docList: any[] = [];

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });

    await page.goto("https://www.b2bgateway.net/validate/login.asp");
    await page.type("#username", process.env.B2B_EMAIL);
    await page.type("#password", process.env.B2B_PASSWORD);
    await page.click('input[value="Login"]');
    await page.waitForFunction("window.location.pathname === '/ClientPortal/splash.asp'");
    io.to(socketID).emit("postWalmartImportB2B", "Login completed.");

    await page.goto("https://www.b2bgateway.net/ClientPortal/tranreport.asp");
    await page.waitForFunction("window.location.pathname === '/ClientPortal/tranreport.asp'");
    io.to(socketID).emit("postWalmartImportB2B", "Navigate to transaction report completed.");

    await page.select('select[name="selectMonthYear"]', monthYear);
    await page.waitForSelector('select[name="selectMonthYear"]');
    io.to(socketID).emit("postWalmartImportB2B", "Change month completed.");

    await page.select('select[name="selectDay"]', day);
    await page.waitForSelector('select[name="selectDay"]');
    io.to(socketID).emit("postWalmartImportB2B", "Change day completed.");

    await page.select('select[name="FilterDocType"]', "POS");
    await page.waitForSelector('select[name="FilterDocType"]');
    io.to(socketID).emit("postWalmartImportB2B", "Change filter completed.");

    const pageSelector = await page.$('td[class="rtdb"]');

    if (pageSelector) {
      const htmlPage = await page.$eval('td[class="rtdb"]', (el) => el.innerText);

      const pageNumbers = htmlPage.match(/Page: +([0-9]+) +of +([0-9]+)/);
      io.to(socketID).emit("postWalmartImportB2B", `Total Pages: ${pageNumbers[2]}`);

      for (let i = 1; i <= parseInt(pageNumbers[2]); i++) {
        await page.waitForXPath('//a[contains(text(), "View")]');
        const list = await page.$x('//a[contains(text(), "View")]');
        const hrefs = await page.evaluate((...list: any) => {
          return list.map((e: any) => e.href);
        }, ...list);

        docList.push(hrefs);

        io.to(socketID).emit("postWalmartImportB2B", `Page: ${i} extracted.`);

        await page.click('input[value=">"]');
      }
    } else {
      await page.waitForXPath('//a[contains(text(), "View")]');
      const list = await page.$x('//a[contains(text(), "View")]');
      docList = await Promise.all(list.map(async (item) => await (await item.getProperty("href")).jsonValue()));
    }
    await browser.close();

    console.log("B2B scraping completed.");
    io.to(socketID).emit("postWalmartImportB2B", "B2B scraping completed.");
    return docList.flat();
  } catch (err) {
    console.log(err);
    io.to(socketID).emit("postWalmartImportB2B", "Import failed, try again.");
  }
};

export const convertHTML = async (data: string) => {
  try {
    const urlParams = new URLSearchParams(data);
    const id = urlParams.get("id");
    const controlNumber = urlParams.get("gcn");

    const html: any = await axios.get(data);
    const $ = load(html.data);

    const convert = $("table:eq(1) > tbody > tr > td").html().replace(/<br>/g, "~");
    $("table:eq(1) > tbody > tr > td").html(convert);
    const text = $("table:eq(1) > tbody > tr > td")
      .text()
      .replace(/\u00A0/g, " ");

    const header = text.match(/(?:ISA.*?)(?=ST\*)/)[0].replace(/(\.\.\.)/, "");
    const body = text.match(/(ST.*)(?=GE)/)[0].replace(/(\.\.\.)/, "");
    const footer = text.match(/(GE\*.*\d)/)[0].concat("~");

    const edi = {
      id: id,
      header: header,
      body: body,
      footer: footer,
      controlNumber: controlNumber,
    };

    return edi;
  } catch (err) {
    throw err;
  }
};
