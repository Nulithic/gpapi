import React from "react";
import { Page, Text, View, Document, StyleSheet, Image, renderToFile, renderToStream } from "@react-pdf/renderer";
import JsBarcode from "jsbarcode";
import { Canvas } from "canvas";

import { WalmartLabel } from "types/WalmartUS/walmartTypes";

const styles = StyleSheet.create({
  page: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    backgroundColor: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
  },

  topContainer: {
    border: "1 solid black",
  },

  addressContainer: {
    flexDirection: "row",
    width: "100%",
    borderBottom: "1 solid black",
  },

  shipFrom: {
    width: "40%",
    borderRight: "1 solid black",
    padding: "5px",
  },
  shipFromTtile: {
    fontSize: "7px",
    paddingBottom: "7px",
  },
  shipFromAddress: {
    fontSize: "8px",
    paddingBottom: "3px",
  },

  shipTo: {
    width: "60%",
    padding: "5px",
  },
  shipToTtile: {
    fontSize: "8px",
    paddingBottom: "7px",
  },
  shipToAddress: {
    fontFamily: "Helvetica-Bold",
    fontSize: "9px",
    paddingBottom: "3px",
  },

  infoContainer: {
    flexDirection: "column",
    width: "100%",
    height: "50%",
    borderBottom: "1px solid black",
  },

  infoColumn: {
    flexDirection: "column",
    height: "100%",
    padding: "5px",
    paddingRight: 40,
  },

  infoTitle: {
    fontSize: "14px",
  },
  infoText: {
    fontFamily: "Helvetica-Bold",
    fontSize: "14px",
  },
});

const WalmartCaseLabel = ({ data }: { data: WalmartLabel[] }) => (
  <Document>
    {data.map((item) => {
      const canvas = new Canvas(50, 50);
      JsBarcode(canvas, item.sscc, { height: 350, width: 6, fontSize: 70, font: "Helvetica", ean128: true });
      const barcode = canvas.toDataURL();
      return (
        <Page key={item.purchaseOrderNumber} size={[288, 432]} orientation="portrait" style={styles.page}>
          <View style={styles.topContainer}>
            <View style={styles.addressContainer}>
              <View style={styles.shipFrom}>
                <Text style={styles.shipFromTtile}>Ship From:</Text>
                <Text style={styles.shipFromAddress}>Green Project Inc.</Text>
                <Text style={styles.shipFromAddress}>815 Echelon Ct.</Text>
                <Text style={styles.shipFromAddress}>City of Industry, CA 91744</Text>
              </View>
              <View style={styles.shipTo}>
                <Text style={styles.shipToTtile}>Ship To:</Text>
                <Text style={styles.shipToAddress}>{item.buyingParty}</Text>
                <Text style={styles.shipToAddress}>{item.buyingPartyStreet}</Text>
                <Text style={styles.shipToAddress}>{item.buyingPartyAddress}</Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={{ flexDirection: "row", paddingTop: 10 }}>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle}>DC#</Text>
                  <Text style={styles.infoText}>{item.distributionCenterNumber}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle}>TYPE</Text>
                  <Text style={styles.infoText}>{item.purchaseOrderType}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle}>DEPT</Text>
                  <Text style={styles.infoText}>{item.departmentNumber}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle}>ORDER#</Text>
                  <Text style={styles.infoText}>{item.purchaseOrderNumber}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "column", justifyContent: "space-evenly", paddingTop: 10 }}>
                <View style={{ flexDirection: "row", paddingLeft: 5, paddingBottom: 20 }}>
                  <Text style={styles.infoTitle}>WMIT:</Text>
                  <Text style={styles.infoText}>{item.wmit}</Text>
                </View>
                <View style={{ flexDirection: "row", paddingLeft: 5 }}>
                  <Text style={styles.infoTitle}>VSN#:</Text>
                  <Text style={styles.infoText}>{item.vsn}</Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "column", alignItems: "center", height: "50%", paddingTop: 10 }}>
              <Image style={{ width: 240 }} src={barcode} />
            </View>
          </View>
        </Page>
      );
    })}
  </Document>
);

export default async (data: WalmartLabel[]) => {
  return await renderToStream(<WalmartCaseLabel {...{ data }} />);
};
