import { format } from "date-fns";
import fs from "fs";
import { jsPDF, AcroFormCheckBox, AcroFormTextField } from "jspdf";
import path from "path";

import { WalmartOrder } from "types/WalmartUS/walmartTypes";

const walmartMasterBOL = (selection: WalmartOrder[]) => {
  const orderGroup = (group: any[]) => {
    const len = group.length;
    let emptyList = group;
    if (emptyList.length < 8) {
      for (let i = 0; i < 8 - len; i++) {
        emptyList.push({
          purchaseOrderNumber: " ",
          numberOfCartons: " ",
          actualWeight: " ",
          floorOrPallet: " ",
          purchaseOrderType: " ",
          departmentNumber: " ",
          distributionCenterNumber: " ",
          additionalInfo: " ",
        });
      }
    }
    return emptyList;
  };

  const carrierGroup = (group: any[]) => {
    const len = group.length;
    let emptyList = group;
    if (emptyList.length < 6) {
      for (let i = 0; i < 6 - len; i++) {
        emptyList.push({
          totalHandlingQty: " ",
          floorOrPallet: " ",
          totalPackageQty: " ",
          packageType: " ",
          totalWeightQty: " ",
          hm: " ",
          description: " ",
          nmfc: " ",
          carrierClass: " ",
        });
      }
    }
    return emptyList;
  };

  const extraGroup = (group: any[]) => {
    const len = group.length;
    let emptyList = group;
    if (emptyList.length < 37) {
      for (let i = 0; i < 37 - len; i++) {
        emptyList.push({
          purchaseOrderNumber: " ",
          numberOfCartons: " ",
          actualWeight: " ",
          floorOrPallet: " ",
          purchaseOrderType: " ",
          departmentNumber: " ",
          distributionCenterNumber: " ",
          additionalInfo: " ",
        });
      }
    }
    return emptyList;
  };

  const totalUnit = (group: WalmartOrder[]) => {
    const total = group.map((item) => (item.floorOrPallet === "P" ? 1 : parseInt(item.numberOfCartons)));
    return total.reduce((a, b) => a + b, 0);
  };

  const totalPackage = (group: WalmartOrder[]) => {
    const total = group.map((item) => parseInt(item.numberOfCartons));
    return total.reduce((a, b) => a + b, 0);
  };

  const totalWeight = (group: WalmartOrder[]) => {
    const total = group.map((item) => parseInt(item.actualWeight));
    return total.reduce((a, b) => a + b, 0);
  };

  const carrierTotal = (group: WalmartOrder[]) => {
    const carrierInfo = [
      ...group
        .reduce((r, o) => {
          const key = o.floorOrPallet;

          const pick = (({ floorOrPallet }) => ({
            floorOrPallet,
          }))(o);

          const item =
            r.get(key) ||
            Object.assign({}, pick, {
              totalHandlingQty: 0,
              totalPackageQty: 0,
              packageType: "CTN",
              totalWeightQty: 0,
              hm: " ",
              description: " ",
              nmfc: " ",
              carrierClass: " ",
            });

          item.totalHandlingQty += Number(o.floorOrPallet === "P" ? 1 : o.numberOfCartons);
          item.totalPackageQty += Number(o.numberOfCartons);
          item.totalWeightQty += Number(o.actualWeight);

          return r.set(key, item);
        }, new Map())
        .values(),
    ];
    return carrierInfo;
  };

  const firstPage = selection.slice(0, 8);
  const remainingOrders = selection.slice(8);

  const splitPage = () => {
    const numberOfPages = Math.ceil(remainingOrders.length / 37);
    const pages = [];

    for (let i = 0; i < numberOfPages; i++) {
      const page = remainingOrders.splice(0, 37);
      pages.push(page);
    }

    return pages;
  };

  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
  });

  doc.setLineWidth(1);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MASTER BILL OF LADING", 306, 29, { align: "center" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Date: " + format(new Date(), "MM/dd/yyyy"), 14, 29);
  doc.text("Page #1", 598, 29, { align: "right" });

  doc.rect(14, 35, 584, 310);
  doc.line(306, 35, 306, 310);

  /* #region Left Side  */
  var checkBoxFOB1 = new AcroFormCheckBox();
  checkBoxFOB1.height = 15;
  checkBoxFOB1.width = 15;
  checkBoxFOB1.x = 280;
  checkBoxFOB1.y = 100;
  checkBoxFOB1.maxFontSize = 10;
  checkBoxFOB1.textAlign = "center";
  checkBoxFOB1.appearanceState = "Off";
  doc.addField(checkBoxFOB1);
  doc.rect(280, 100, 15, 15);

  var checkBoxFOB2 = new AcroFormCheckBox();
  checkBoxFOB2.height = 15;
  checkBoxFOB2.width = 15;
  checkBoxFOB2.x = 280;
  checkBoxFOB2.y = 182;
  checkBoxFOB2.maxFontSize = 10;
  checkBoxFOB2.textAlign = "center";
  checkBoxFOB2.appearanceState = "Off";
  doc.addField(checkBoxFOB2);
  doc.rect(280, 182, 15, 15);

  doc.setFont("helvetica", "normal");
  doc.text("Green Project Inc.", 16, 66);
  doc.text("815 Echelon Ct.", 16, 80);
  doc.text("City of Industry, CA 91744", 16, 94);

  doc.setFont("helvetica", "bold");
  doc.text("WALMART CENTERPOINT CP 6909", 16, 148);
  doc.text("3485 WINEVILLE RD", 16, 162);
  doc.text("JURUPA VALLEY, CA 91752", 16, 176);

  doc.text("WALMART C/O US BANK SYNCADA", 16, 230);
  doc.text("PO BOX 3001", 16, 244);
  doc.text("NAPERVILLE, IL 60566", 16, 258);

  doc.setFontSize(18);
  doc.text("SID#", 16, 114);
  doc.text("CID#", 16, 196);
  doc.text("FOB", 240, 114);
  doc.text("FOB", 240, 196);

  doc.line(14, 262, 306, 262);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Freight Charge Terms (Prepaid unless marked otherwise):", 16, 272);
  doc.text("Prepaid", 16, 286);
  doc.text("Collect", 116, 286);
  doc.text("3rd Party", 216, 286);

  var checkBoxPrepaid = new AcroFormCheckBox();
  checkBoxPrepaid.height = 12;
  checkBoxPrepaid.width = 12;
  checkBoxPrepaid.x = 55;
  checkBoxPrepaid.y = 275;
  checkBoxPrepaid.maxFontSize = 8;
  checkBoxPrepaid.textAlign = "center";
  checkBoxPrepaid.appearanceState = "Off";
  doc.addField(checkBoxPrepaid);
  doc.rect(55, 275, 12, 12);

  var checkBoxCollect = new AcroFormCheckBox();
  checkBoxCollect.height = 12;
  checkBoxCollect.width = 12;
  checkBoxCollect.x = 150;
  checkBoxCollect.y = 275;
  checkBoxCollect.maxFontSize = 8;
  checkBoxCollect.textAlign = "center";
  checkBoxCollect.appearanceState = "On";
  doc.addField(checkBoxCollect);
  doc.rect(150, 275, 12, 12);

  var checkBoxThird = new AcroFormCheckBox();
  checkBoxThird.height = 12;
  checkBoxThird.width = 12;
  checkBoxThird.x = 260;
  checkBoxThird.y = 275;
  checkBoxThird.maxFontSize = 8;
  checkBoxThird.textAlign = "center";
  checkBoxThird.appearanceState = "Off";
  doc.addField(checkBoxThird);
  doc.rect(260, 275, 12, 12);

  doc.line(14, 290, 306, 290);

  var checkBoxMaster = new AcroFormCheckBox();
  checkBoxMaster.height = 10;
  checkBoxMaster.width = 10;
  checkBoxMaster.x = 20;
  checkBoxMaster.y = 295;
  checkBoxMaster.maxFontSize = 6;
  checkBoxMaster.textAlign = "center";
  checkBoxMaster.appearanceState = "On";
  doc.addField(checkBoxMaster);
  doc.rect(20, 295, 10, 10);

  doc.setFontSize(9);
  doc.text("Master Bill of Lading: with attached Underlying Bills of Lading.", 35, 303);
  /* #endregion */

  /* #region Right Side */
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BOL#:", 312, 54);

  var textFieldBOL = new AcroFormTextField();
  textFieldBOL.height = 20;
  textFieldBOL.width = 225;
  textFieldBOL.x = 370;
  textFieldBOL.y = 38;
  doc.addField(textFieldBOL);

  doc.line(306, 60, 598, 60);

  doc.text("SCAC:", 312, 102);
  doc.text("Seal#:", 312, 124);
  doc.text("MABD:", 312, 146);
  doc.text("Delivery#:", 312, 168);
  doc.text("Trailer#:", 312, 190);
  doc.text("Pro#:", 312, 212);

  var textFieldCarrier = new AcroFormTextField();
  textFieldCarrier.height = 20;
  textFieldCarrier.width = 175;
  textFieldCarrier.x = 420;
  textFieldCarrier.y = 64;
  doc.addField(textFieldCarrier);

  var textFieldSCAC = new AcroFormTextField();
  textFieldSCAC.height = 20;
  textFieldSCAC.width = 223;
  textFieldSCAC.x = 372;
  textFieldSCAC.y = 86;
  doc.addField(textFieldSCAC);

  var textFieldSeal = new AcroFormTextField();
  textFieldSeal.height = 20;
  textFieldSeal.width = 227;
  textFieldSeal.x = 368;
  textFieldSeal.y = 108;
  doc.addField(textFieldSeal);

  var textFieldMABD = new AcroFormTextField();
  textFieldMABD.height = 20;
  textFieldMABD.width = 221;
  textFieldMABD.x = 374;
  textFieldMABD.y = 130;
  doc.addField(textFieldMABD);

  var textFieldDelivery = new AcroFormTextField();
  textFieldDelivery.height = 20;
  textFieldDelivery.width = 195;
  textFieldDelivery.x = 400;
  textFieldDelivery.y = 152;
  doc.addField(textFieldDelivery);

  var textFieldTrailer = new AcroFormTextField();
  textFieldTrailer.height = 20;
  textFieldTrailer.width = 210;
  textFieldTrailer.x = 385;
  textFieldTrailer.y = 174;
  doc.addField(textFieldTrailer);

  var textFieldPro = new AcroFormTextField();
  textFieldPro.height = 20;
  textFieldPro.width = 235;
  textFieldPro.x = 360;
  textFieldPro.y = 196;
  doc.addField(textFieldPro);

  var textFieldArea = new AcroFormTextField();
  textFieldArea.height = 65;
  textFieldArea.width = 283;
  textFieldArea.x = 312;
  textFieldArea.y = 240;
  textFieldArea.fontSize = 12;
  textFieldArea.multiline = true;
  doc.addField(textFieldArea);

  doc.setFontSize(16);
  doc.text("Carrier Name:", 312, 80);

  doc.line(306, 222, 598, 222);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Special Instructions:", 312, 235);
  /* #endregion */

  const orderConfig = [
    {
      name: "purchaseOrderNumber",
      prompt: "Customer Order#",
      align: "center",
      padding: 0,
      width: 180,
    },
    {
      name: "numberOfCartons",
      prompt: "#Pkgs",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "actualWeight",
      prompt: "Weight",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "floorOrPallet",
      prompt: "Pallet/Slip",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "purchaseOrderType",
      prompt: "Type",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "departmentNumber",
      prompt: "Dept",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "distributionCenterNumber",
      prompt: "DC",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "additionalInfo",
      prompt: "Additional Info",
      align: "center",
      padding: 0,
      width: 118.7,
    },
  ] as any[];

  let firstPageData = firstPage.map((item) => ({
    purchaseOrderNumber: item.purchaseOrderNumber,
    numberOfCartons: item.numberOfCartons === "" ? " " : item.numberOfCartons,
    actualWeight: item.actualWeight === "" ? " " : item.actualWeight,
    floorOrPallet: item.floorOrPallet === "P" ? "Yes" : "No",
    purchaseOrderType: item.purchaseOrderType,
    departmentNumber: item.departmentNumber,
    distributionCenterNumber: item.distributionCenterNumber,
    additionalInfo: " ",
  }));

  doc.table(14, 328.5, orderGroup(firstPageData), orderConfig, { autoSize: false, fontSize: 10, headerBackgroundColor: "white" });

  doc.rect(14, 486, 255, 18);
  doc.line(149, 486, 149, 504);
  doc.line(209, 486, 209, 504);
  doc.line(269, 486, 269, 504);

  doc.setFillColor("#636466");
  doc.rect(269, 486, 329, 18, "F");
  doc.rect(269, 486, 329, 18);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PAGE SUBTOTAL", 81, 500, { align: "center" });
  doc.text(totalPackage(firstPage).toString(), 180, 500, { align: "center" });
  doc.text(totalWeight(firstPage).toString(), 238, 500, { align: "center" });

  doc.rect(14, 515, 584, 263);

  const carrierConfig = [
    {
      name: "totalHandlingQty",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 70,
    },
    {
      name: "floorOrPallet",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 60,
    },
    {
      name: "totalPackageQty",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 70,
    },
    {
      name: "packageType",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 60,
    },

    {
      name: "totalWeightQty",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "hm",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 40,
    },
    {
      name: "description",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 238.67,
    },
    {
      name: "nmfc",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 80,
    },
    {
      name: "carrierClass",
      prompt: " ",
      align: "center",
      padding: 0,
      width: 80,
    },
  ] as any[];

  const carrierData = carrierTotal(selection).map((item) => ({
    floorOrPallet: item.floorOrPallet === "P" ? "Pallet" : "Floor",
    totalHandlingQty: item.totalHandlingQty.toString(),
    totalPackageQty: item.totalPackageQty.toString(),
    packageType: "CTN",
    totalWeightQty: item.totalWeightQty.toString(),
    hm: " ",
    description: "Printer Accessories",
    nmfc: " ",
    carrierClass: " ",
  }));

  doc.table(14, 551.5, carrierGroup(carrierData), carrierConfig, {
    autoSize: false,
    fontSize: 10,
    headerBackgroundColor: "white",
  });

  doc.setFillColor("white");
  doc.rect(14.65, 533, 582.7, 35.5, "F");

  doc.line(66.5, 552, 66.5, 570);
  doc.line(111.5, 530, 111.5, 570);
  doc.line(164, 552, 164, 570);
  doc.line(209, 530, 209, 570);
  doc.line(14, 551.5, 209, 551.5);

  doc.line(269, 530, 269, 570);
  doc.line(299, 530, 299, 570);

  doc.line(477.95, 530, 477.95, 570);
  doc.line(537.95, 552, 537.95, 570);
  doc.line(477.95, 551.5, 598, 551.5);

  doc.line(598, 530, 598, 570);

  doc.text("Handling Unit", 62, 545, { align: "center" });
  doc.text("QTY", 41, 564, { align: "center" });
  doc.text("TYPE", 89, 564, { align: "center" });

  doc.text("Package", 161, 545, { align: "center" });
  doc.text("QTY", 139, 564, { align: "center" });
  doc.text("TYPE", 187, 564, { align: "center" });

  doc.text("Weight", 239, 555, { align: "center" });
  doc.text("H.M.", 285, 555, { align: "center" });

  doc.text("Commodity Description", 387, 545, { align: "center" });

  doc.text("LTL Only", 538, 545, { align: "center" });
  doc.text("NMFC#", 508, 564, { align: "center" });
  doc.text("Class", 568, 564, { align: "center" });

  doc.text("Shipper Signature/Date", 18, 733);
  doc.text("Carrier Signature/Date", 245, 733);

  doc.setFont("helvetica", "bold");
  doc.text("GRAND TOTAL", 387, 686, { align: "center" });
  doc.text(totalUnit(selection).toString(), 41, 686, { align: "center" });
  doc.text(totalPackage(selection).toString(), 139, 686, { align: "center" });
  doc.text(totalWeight(selection).toString(), 239, 686, { align: "center" });

  doc.setFontSize(5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Commodities requiring special or additional care or attention in handling or stowing must be marked and packaged as to ensure safe transportation with ordinary care. See Section 2(a) of NMFC Item 360",
    387,
    553,
    { align: "center", maxWidth: 170 }
  );

  /* #region LTL Fields */
  var textFieldNMFC1 = new AcroFormTextField();
  textFieldNMFC1.height = 16;
  textFieldNMFC1.width = 58;
  textFieldNMFC1.x = 479;
  textFieldNMFC1.y = 570;
  textFieldNMFC1.fontSize = 12;
  textFieldNMFC1.textAlign = "center";
  doc.addField(textFieldNMFC1);

  var textFieldNMFC2 = new AcroFormTextField();
  textFieldNMFC2.height = 16;
  textFieldNMFC2.width = 58;
  textFieldNMFC2.x = 479;
  textFieldNMFC2.y = 587.5;
  textFieldNMFC2.fontSize = 12;
  textFieldNMFC2.textAlign = "center";
  doc.addField(textFieldNMFC2);

  var textFieldNMFC3 = new AcroFormTextField();
  textFieldNMFC3.height = 16;
  textFieldNMFC3.width = 58;
  textFieldNMFC3.x = 479;
  textFieldNMFC3.y = 605;
  textFieldNMFC3.fontSize = 12;
  textFieldNMFC3.textAlign = "center";
  doc.addField(textFieldNMFC3);

  var textFieldNMFC4 = new AcroFormTextField();
  textFieldNMFC4.height = 16;
  textFieldNMFC4.width = 58;
  textFieldNMFC4.x = 479;
  textFieldNMFC4.y = 622.5;
  textFieldNMFC4.fontSize = 12;
  textFieldNMFC4.textAlign = "center";
  doc.addField(textFieldNMFC4);

  var textFieldNMFC5 = new AcroFormTextField();
  textFieldNMFC5.height = 16;
  textFieldNMFC5.width = 58;
  textFieldNMFC5.x = 479;
  textFieldNMFC5.y = 640;
  textFieldNMFC5.fontSize = 12;
  textFieldNMFC5.textAlign = "center";
  doc.addField(textFieldNMFC5);

  var textFieldNMFC6 = new AcroFormTextField();
  textFieldNMFC6.height = 16;
  textFieldNMFC6.width = 58;
  textFieldNMFC6.x = 479;
  textFieldNMFC6.y = 657.5;
  textFieldNMFC6.fontSize = 12;
  textFieldNMFC6.textAlign = "center";
  doc.addField(textFieldNMFC6);

  var textFieldClass1 = new AcroFormTextField();
  textFieldClass1.height = 16;
  textFieldClass1.width = 58;
  textFieldClass1.x = 539;
  textFieldClass1.y = 570;
  textFieldClass1.fontSize = 12;
  textFieldClass1.textAlign = "center";
  doc.addField(textFieldClass1);

  var textFieldClass2 = new AcroFormTextField();
  textFieldClass2.height = 16;
  textFieldClass2.width = 58;
  textFieldClass2.x = 539;
  textFieldClass2.y = 587.5;
  textFieldClass2.fontSize = 12;
  textFieldClass2.textAlign = "center";
  doc.addField(textFieldClass2);

  var textFieldClass3 = new AcroFormTextField();
  textFieldClass3.height = 16;
  textFieldClass3.width = 58;
  textFieldClass3.x = 539;
  textFieldClass3.y = 605;
  textFieldClass3.fontSize = 12;
  textFieldClass3.textAlign = "center";
  doc.addField(textFieldClass3);

  var textFieldClass4 = new AcroFormTextField();
  textFieldClass4.height = 16;
  textFieldClass4.width = 58;
  textFieldClass4.x = 539;
  textFieldClass4.y = 622.5;
  textFieldClass4.fontSize = 12;
  textFieldClass4.textAlign = "center";
  doc.addField(textFieldClass4);

  var textFieldClass5 = new AcroFormTextField();
  textFieldClass5.height = 16;
  textFieldClass5.width = 58;
  textFieldClass5.x = 539;
  textFieldClass5.y = 640;
  textFieldClass5.fontSize = 12;
  textFieldClass5.textAlign = "center";
  doc.addField(textFieldClass5);

  var textFieldClass6 = new AcroFormTextField();
  textFieldClass6.height = 16;
  textFieldClass6.width = 58;
  textFieldClass6.x = 539;
  textFieldClass6.y = 657.5;
  textFieldClass6.fontSize = 12;
  textFieldClass6.textAlign = "center";
  doc.addField(textFieldClass6);
  /* #endregion */

  doc.setFillColor("#636466");
  doc.rect(66.5, 674.6, 45, 17, "F");
  doc.rect(164, 674.6, 45, 17, "F");
  doc.rect(269, 674.6, 30, 17, "F");
  doc.rect(478, 674.6, 119.5, 17, "F");

  doc.line(66.5, 674, 66.5, 691);
  doc.line(111.5, 674, 111.5, 691);
  doc.line(164, 674, 164, 691);
  doc.line(209, 674, 209, 691);
  doc.line(269, 674, 269, 691);
  doc.line(299, 674, 299, 691);

  /* #region Fine Print */
  doc.line(14, 691.5, 598, 691.5);
  doc.line(14, 723, 598, 723);

  doc.line(202, 692, 202, 723);
  doc.line(412, 692, 412, 723);
  doc.line(477.95, 674, 477.95, 778);
  doc.line(240, 723, 240, 778);

  doc.line(18, 766, 180, 766);
  doc.line(190, 766, 230, 766);
  doc.line(245, 766, 407, 766);
  doc.line(417, 766, 457, 766);

  doc.text(
    "Where the rate is dependent on value, shippers are required to state specifically in writing the agreed or declared value of the property as follows: “The agreed or declared value of the property is specifically stated by the shipper to be not exceeding __________________ per ___________________.”",
    18,
    700,
    { maxWidth: 180 }
  );
  doc.text(
    "RECEIVED, subject to the individually determined rates or contracts that have been agreed upon in writing between the carrier and shipper, if applicable, otherwise to the rates, classifications and rules that have been established by the carrier and are available to the shipper, on request, and to all applicable state and federal regulations.",
    210,
    700,
    { maxWidth: 200 }
  );
  doc.text("NOTE - Liability Limitation applies. See 49 U.S.C. 14706(c) (1) (A) and (B).", 420, 700, { maxWidth: 50 });
  doc.text("COD Amount: $ ______________________", 482, 700);
  doc.text("Fee Terms:Collect:             Prepaid:", 482, 710);
  doc.text("Personal/company check NOT acceptable:", 482, 720);

  var checkBoxFeeCollect = new AcroFormCheckBox();
  checkBoxFeeCollect.height = 10;
  checkBoxFeeCollect.width = 10;
  checkBoxFeeCollect.x = 526;
  checkBoxFeeCollect.y = 703;
  checkBoxFeeCollect.maxFontSize = 6;
  checkBoxFeeCollect.textAlign = "center";
  checkBoxFeeCollect.appearanceState = "Off";
  doc.addField(checkBoxFeeCollect);
  doc.rect(526, 703, 10, 10);

  var checkBoxFeePrepaid = new AcroFormCheckBox();
  checkBoxFeePrepaid.height = 10;
  checkBoxFeePrepaid.width = 10;
  checkBoxFeePrepaid.x = 563;
  checkBoxFeePrepaid.y = 703;
  checkBoxFeePrepaid.maxFontSize = 6;
  checkBoxFeePrepaid.textAlign = "center";
  checkBoxFeePrepaid.appearanceState = "Off";
  doc.addField(checkBoxFeePrepaid);
  doc.rect(563, 703, 10, 10);

  var checkBoxFeePrepaid = new AcroFormCheckBox();
  checkBoxFeePrepaid.height = 10;
  checkBoxFeePrepaid.width = 10;
  checkBoxFeePrepaid.x = 580;
  checkBoxFeePrepaid.y = 712;
  checkBoxFeePrepaid.maxFontSize = 6;
  checkBoxFeePrepaid.textAlign = "center";
  checkBoxFeePrepaid.appearanceState = "Off";
  doc.addField(checkBoxFeePrepaid);
  doc.rect(580, 712, 10, 10);
  /* #endregion */

  doc.text(
    "This is to certify that the above named materials are properly classified, described, packaged, marked and labeled, and are in proper condition for transportation according to the applicable regulations of the U.S. DOT.",
    18,
    740,
    { maxWidth: 220 }
  );
  doc.text(
    "Carrier acknowledges receipt of packages and required placards. Carrier certifies emergency response information was made available and/or carrier has the U.S. DOT emergency response guidebook or equivalent documentation in the vehicle.",
    245,
    740,
    { maxWidth: 230 }
  );

  /* #region Trailer/Frieght Checkbox */
  doc.setFont("helvetica", "bold");
  doc.text("Trailer Loaded", 482, 731);
  doc.text("Freight Counted", 535, 731);

  doc.setFont("helvetica", "normal");
  doc.text("By Shipper", 492, 740);
  doc.text("By Driver", 492, 750);

  doc.text("By Shipper", 545, 740);
  doc.text("By Driver/Pallets", 545, 750);
  doc.text("By Driver/Pieces", 545, 760);

  var checkBoxTrailerShip = new AcroFormCheckBox();
  checkBoxTrailerShip.height = 8;
  checkBoxTrailerShip.width = 8;
  checkBoxTrailerShip.x = 482;
  checkBoxTrailerShip.y = 734;
  checkBoxTrailerShip.maxFontSize = 4;
  checkBoxTrailerShip.textAlign = "center";
  checkBoxTrailerShip.appearanceState = "Off";
  doc.addField(checkBoxTrailerShip);
  doc.rect(482, 734, 8, 8);

  var checkBoxTrailerDrive = new AcroFormCheckBox();
  checkBoxTrailerDrive.height = 8;
  checkBoxTrailerDrive.width = 8;
  checkBoxTrailerDrive.x = 482;
  checkBoxTrailerDrive.y = 744;
  checkBoxTrailerDrive.maxFontSize = 4;
  checkBoxTrailerDrive.textAlign = "center";
  checkBoxTrailerDrive.appearanceState = "Off";
  doc.addField(checkBoxTrailerDrive);
  doc.rect(482, 744, 8, 8);

  var checkBoxFreightShip = new AcroFormCheckBox();
  checkBoxFreightShip.height = 8;
  checkBoxFreightShip.width = 8;
  checkBoxFreightShip.x = 535;
  checkBoxFreightShip.y = 734;
  checkBoxFreightShip.maxFontSize = 4;
  checkBoxFreightShip.textAlign = "center";
  checkBoxFreightShip.appearanceState = "Off";
  doc.addField(checkBoxFreightShip);
  doc.rect(535, 734, 8, 8);

  var checkBoxFreightPallet = new AcroFormCheckBox();
  checkBoxFreightPallet.height = 8;
  checkBoxFreightPallet.width = 8;
  checkBoxFreightPallet.x = 535;
  checkBoxFreightPallet.y = 744;
  checkBoxFreightPallet.maxFontSize = 4;
  checkBoxFreightPallet.textAlign = "center";
  checkBoxFreightPallet.appearanceState = "Off";
  doc.addField(checkBoxFreightPallet);
  doc.rect(535, 744, 8, 8);

  var checkBoxFreightPiece = new AcroFormCheckBox();
  checkBoxFreightPiece.height = 8;
  checkBoxFreightPiece.width = 8;
  checkBoxFreightPiece.x = 535;
  checkBoxFreightPiece.y = 754;
  checkBoxFreightPiece.maxFontSize = 4;
  checkBoxFreightPiece.textAlign = "center";
  checkBoxFreightPiece.appearanceState = "Off";
  doc.addField(checkBoxFreightPiece);
  doc.rect(535, 754, 8, 8);
  /* #endregion */

  doc.line(478, 766, 598, 766);
  doc.text("Time In:", 482, 771);
  doc.text("Time Out:", 535, 771);

  doc.setFontSize(7);
  doc.text("Signature", 18, 773);
  doc.text("Date", 190, 773);

  doc.text("Signature", 245, 773);
  doc.text("Date", 417, 773);

  doc.setFillColor("black");
  doc.rect(14, 35, 292, 18, "F");
  doc.rect(14, 118, 292, 18, "F");
  doc.rect(14, 200, 292, 18, "F");
  doc.rect(14, 310, 584, 18, "F");
  doc.rect(14, 515, 584, 18, "F");

  doc.setFontSize(14);
  doc.setTextColor("white");
  doc.setDrawColor("white");
  doc.setFont("helvetica", "bold");
  doc.text("Ship From:", 16, 48);
  doc.line(16, 50, 90, 50);
  doc.text("Ship To:", 16, 131);
  doc.line(16, 133, 72, 133);
  doc.text("Third Party Freight Charges Bill To:", 16, 214);
  doc.line(16, 216, 252, 216);
  doc.text("Customer Order Information:", 306, 323, { align: "center" });
  doc.line(210, 325, 402, 325);
  doc.text("Carrier Information:", 306, 528, { align: "center" });
  doc.line(241, 530, 371, 530);

  for (const [index, page] of splitPage().entries()) {
    doc.setTextColor("black");
    doc.setDrawColor("black");
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SUPPLEMENT TO THE BILL OF LADING", 306, 29, { align: "center" });
    doc.setFontSize(14);
    doc.text("Bill of Lading Number:", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.text("Date: " + format(new Date(), "MM/dd/yyyy"), 14, 29);
    doc.text("Page #" + (index + 2), 598, 29, { align: "right" });

    var textFieldExtraBOL = new AcroFormTextField();
    textFieldExtraBOL.height = 20;
    textFieldExtraBOL.width = 300;
    textFieldExtraBOL.x = 170;
    textFieldExtraBOL.y = 32;
    doc.addField(textFieldExtraBOL);

    const orderConfig = [
      {
        name: "purchaseOrderNumber",
        prompt: "Customer Order#",
        align: "center",
        padding: 0,
        width: 180,
      },
      {
        name: "numberOfCartons",
        prompt: "#Pkgs",
        align: "center",
        padding: 0,
        width: 80,
      },
      {
        name: "actualWeight",
        prompt: "Weight",
        align: "center",
        padding: 0,
        width: 80,
      },
      {
        name: "floorOrPallet",
        prompt: "Pallet/Slip",
        align: "center",
        padding: 0,
        width: 80,
      },
      {
        name: "purchaseOrderType",
        prompt: "Type",
        align: "center",
        padding: 0,
        width: 80,
      },
      {
        name: "departmentNumber",
        prompt: "Dept",
        align: "center",
        padding: 0,
        width: 80,
      },
      {
        name: "distributionCenterNumber",
        prompt: "DC",
        align: "center",
        padding: 0,
        width: 80,
      },
      {
        name: "additionalInfo",
        prompt: "Additional Info",
        align: "center",
        padding: 0,
        width: 118.7,
      },
    ] as any[];

    let pageData = page.map((item) => ({
      purchaseOrderNumber: item.purchaseOrderNumber,
      numberOfCartons: item.numberOfCartons === "" ? " " : item.numberOfCartons,
      actualWeight: item.actualWeight === "" ? " " : item.actualWeight,
      floorOrPallet: item.floorOrPallet === "P" ? "Yes" : "No",
      purchaseOrderType: item.purchaseOrderType,
      departmentNumber: item.departmentNumber,
      distributionCenterNumber: item.distributionCenterNumber,
      additionalInfo: " ",
    }));

    doc.table(14, 72, orderGroup(extraGroup(pageData)), orderConfig, { autoSize: false, fontSize: 10, headerBackgroundColor: "white" });

    doc.rect(14, 737, 255, 18);

    doc.line(149, 737, 149, 755);
    doc.line(209, 737, 209, 755);
    doc.line(269, 737, 269, 755);

    doc.setFillColor("#636466");
    doc.rect(269, 737, 329, 18, "F");
    doc.rect(269, 737, 329, 18);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PAGE SUBTOTAL", 81, 750, { align: "center" });
    doc.text(totalPackage(page).toString(), 180, 750, { align: "center" });
    doc.text(totalWeight(page).toString(), 238, 750, { align: "center" });

    doc.rect(14, 54, 584, 18, "F");
    doc.rect(14, 54, 584, 18);

    doc.setFontSize(14);
    doc.setTextColor("white");
    doc.setDrawColor("white");
    doc.setFont("helvetica", "bold");
    doc.text("Customer Order Information:", 306, 67, { align: "center" });
    doc.line(210, 69, 402, 69);
  }

  return doc.output();
};

export default walmartMasterBOL;
