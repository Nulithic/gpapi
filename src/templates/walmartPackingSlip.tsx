import React from "react";
import { Page, Text, View, Document, StyleSheet, Image, renderToStream } from "@react-pdf/renderer";
import { WalmartOrder } from "types/WalmartUS/walmartTypes";

const styles = StyleSheet.create({
  page: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    backgroundColor: "white",
    paddingHorizontal: "34px",
    paddingVertical: "30px",
  },
  section: {},
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: "50px",
    paddingBottom: "5px",
  },

  topContainer: {
    border: "1 solid black",
    marginBottom: "15px",
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
    fontSize: "14px",
    paddingBottom: "5px",
  },
  shipFromAddress: {
    fontSize: "18px",
  },

  shipTo: {
    width: "60%",
    padding: "5px",
  },
  shipToTtile: {
    fontSize: "14px",
    paddingBottom: "5px",
  },
  shipToAddress: {
    fontFamily: "Helvetica-Bold",
    fontSize: "16px",
  },

  infoContainer: {
    flexDirection: "row",
    width: "100%",
  },

  infoColumn: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    height: "70px",
    width: "50%",
    padding: "5px",
  },

  infoTitle: {
    fontSize: "16px",
  },
  infoText: {
    fontFamily: "Helvetica-Bold",
    fontSize: "16px",
  },

  bottomContainer: {
    border: "1 solid black",
  },
  itemContainer: {
    flexDirection: "row",
    width: "100%",
  },
  itemHeaderRow: { width: "33%", alignItems: "center", borderRight: "1 solid black", padding: "5px" },
  itemHeaderRow2: { width: "33%", alignItems: "center", padding: "5px" },
  itemHeadertext: { fontFamily: "Helvetica-Bold", fontSize: "16px" },

  itemRowContainer: {
    flexDirection: "row",
    width: "100%",
    borderTop: "1 solid black",
  },
  itemRow: { width: "33%", alignItems: "center", borderRight: "1 solid black", padding: "3px" },
  itemRow2: { width: "33%", alignItems: "center", padding: "3px" },
  itemRowText: { fontSize: "12px" },
});

const WalmartPackingSlip = ({ data }: { data: WalmartOrder[] }) => {
  return (
    <Document>
      {data.map((item) => (
        <Page key={item.purchaseOrderNumber} size="LETTER" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>Packing Slip</Text>
          </View>
          <View style={styles.topContainer}>
            <View style={styles.addressContainer}>
              <View style={styles.shipFrom}>
                <Text style={styles.shipFromTtile}>Supplier:</Text>
                <Text style={styles.shipFromAddress}>Green Project Inc.</Text>
                <Text style={styles.shipFromAddress}>815 Echelon Ct.</Text>
                <Text style={styles.shipFromAddress}>City of Industry, CA 91744</Text>
              </View>
              <View style={styles.shipTo}>
                <Text style={styles.shipToTtile}>Ship To:</Text>
                <Text style={styles.shipToAddress}>{item.buyingParty}</Text>
                <Text style={styles.shipToAddress}>{item.buyingPartyStreet}</Text>
                <Text style={styles.shipToAddress}>{`${item.buyingPartyCity}, ${item.buyingPartyStateOrProvince} ${item.buyingPartyPostalCode}`}</Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoTitle}>
                  PO#: <Text style={styles.infoText}>{item.purchaseOrderNumber}</Text>
                </Text>
                <Text style={styles.infoTitle}>
                  PO Type: <Text style={styles.infoText}>{item.purchaseOrderType}</Text>
                </Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoTitle}>
                  Dept#: <Text style={styles.infoText}>{item.departmentNumber}</Text>
                </Text>
                <Text style={styles.infoTitle}>
                  Total Cases: <Text style={styles.infoText}>{item.numberOfCartons}</Text>
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.bottomContainer}>
            <View style={styles.itemContainer}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemHeadertext}>Walmart Item Number</Text>
              </View>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemHeadertext}>Vendor Item Number</Text>
              </View>
              <View style={styles.itemHeaderRow2}>
                <Text style={styles.itemHeadertext}>Case Count</Text>
              </View>
            </View>

            {item.baselineItemDataPO1Loop.map((line) => (
              <View key={line.baselineItemDataPO1.assignedIdentification01} style={styles.itemRowContainer}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemRowText}>{line.baselineItemDataPO1.productServiceId07}</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemRowText}>{line.baselineItemDataPO1.productServiceId11}</Text>
                </View>
                <View style={styles.itemRow2}>
                  <Text style={styles.itemRowText}>{line.baselineItemDataPO1.numberOfCases}</Text>
                </View>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default async (data: WalmartOrder[]) => {
  return await renderToStream(<WalmartPackingSlip {...{ data }} />);
};
