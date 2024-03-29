import { Request, Response } from "express";
import { Server } from "socket.io";

import { userAction } from "utilities/userAction";
import { getDearProductsAPI, getDearLocationsAPI, getDearInventoryAPI } from "api/DearSystems";

import sleep from "utilities/sleep";
import { DearLocations, DearInventory, DearProducts, DearSaleList } from "models/Dear";
import { DearLogs } from "models/Logs";

const updateDearLocations = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "updateDearLocations");

    const socketID = req.query.socketID.toString();
    const io = req.app.get("io") as Server;

    const locationList = await getDearLocationsAPI(io, socketID);

    let progress = 0;
    const progressMax = locationList.reduce((a, v) => a + v.Bins.length, locationList.length);
    io.to(socketID).emit("updateDearLocationsMax", progressMax);

    await DearLocations.deleteMany({});

    for (let i = 0; i < locationList.length; i++) {
      const location = new DearLocations({
        locationID: locationList[i].ID,
        site: locationList[i].Name,
        bin: "",
        location: locationList[i].Name,
      });
      location.save();

      progress = progress + 1;
      io.to(socketID).emit("updateDearLocations", progress);

      for (let k = 0; k < locationList[i].Bins.length; k++) {
        const bin = new DearLocations({
          locationID: locationList[i].Bins[k].ID,
          site: locationList[i].Name,
          bin: locationList[i].Bins[k].Name,
          location: `${locationList[i].Name}: ${locationList[i].Bins[k].Name}`,
        });
        bin.save();

        progress = progress + 1;
        io.to(socketID).emit("updateDearLocations", progress);

        await sleep(1);
      }
      await sleep(1);
    }

    await DearLogs.updateOne(
      { id: "updateDearLocations" },
      { id: "updateDearLocations", lastUpdated: new Date().toLocaleString("en-US"), updatedBy: req.body.user },
      { upsert: true }
    );

    res.status(200).send(locationList);
  } catch (err) {
    console.log(err);
    res.status(500).send("Update Failed.");
  }
};
const updateDearProducts = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "updateDearProducts");

    const socketID = req.query.socketID.toString();
    const io = req.app.get("io") as Server;

    const productList = await getDearProductsAPI(io, socketID);

    const productListSize = productList.length;
    io.to(socketID).emit("updateDearProductsMax", productListSize);

    await DearProducts.deleteMany({});

    for (let i = 0; i < productListSize; i++) {
      const priceTiersObject = {
        low: productList[i].PriceTiers["Low"],
        lowMid: productList[i].PriceTiers["L-M"],
        mid: productList[i].PriceTiers["Mid"],
        midHigh: productList[i].PriceTiers["M-H"],
        high: productList[i].PriceTiers["High"],
        flatRate: productList[i].PriceTiers["Flat Rate"],
      };
      const product = new DearProducts({
        id: productList[i].ID,
        sku: productList[i].SKU,
        name: productList[i].Name,
        category: productList[i].Category,
        brand: productList[i].Brand,
        type: productList[i].Type,
        costingMethod: productList[i].CostingMethod,
        dropShipMode: productList[i].DropShipMode,
        defaultLocation: productList[i].DefaultLocation,
        length: productList[i].Length,
        width: productList[i].Width,
        height: productList[i].Height,
        weight: productList[i].Weight,
        uom: productList[i].UOM,
        weightUnits: productList[i].WeightUnits,
        dimensionsUnits: productList[i].DimensionsUnits,
        barcode: productList[i].Barcode,
        minimumBeforeReorder: productList[i].MinimumBeforeReorder,
        reorderQuantity: productList[i].ReorderQuantity,
        priceTier1: productList[i].PriceTier1,
        priceTier2: productList[i].PriceTier2,
        priceTier3: productList[i].PriceTier3,
        priceTier4: productList[i].PriceTier4,
        priceTier5: productList[i].PriceTier5,
        priceTier6: productList[i].PriceTier6,
        priceTier7: productList[i].PriceTier7,
        priceTier8: productList[i].PriceTier8,
        priceTier9: productList[i].PriceTier9,
        priceTier10: productList[i].PriceTier10,
        priceTiers: priceTiersObject,
        averageCost: productList[i].AverageCost,
        shortDescription: productList[i].ShortDescription,
        internalNote: productList[i].InternalNote,
        description: productList[i].Description,
        additionalAttribute1: productList[i].AdditionalAttribute1,
        additionalAttribute2: productList[i].AdditionalAttribute2,
        additionalAttribute3: productList[i].AdditionalAttribute3,
        additionalAttribute4: productList[i].AdditionalAttribute4,
        additionalAttribute5: productList[i].AdditionalAttribute5,
        additionalAttribute6: productList[i].AdditionalAttribute6,
        additionalAttribute7: productList[i].AdditionalAttribute7,
        additionalAttribute8: productList[i].AdditionalAttribute8,
        additionalAttribute9: productList[i].AdditionalAttribute9,
        additionalAttribute10: productList[i].AdditionalAttribute10,
        attributeSet: productList[i].AttributeSet,
        discountRule: productList[i].DiscountRule,
        tags: productList[i].Tags,
        status: productList[i].Status,
        stockLocator: productList[i].StockLocator,
        cogsAccount: productList[i].COGSAccount,
        revenueAccount: productList[i].RevenueAccount,
        expenseAccount: productList[i].ExpenseAccount,
        inventoryAccount: productList[i].InventoryAccount,
        purchaseTaxRule: productList[i].PurchaseTaxRule,
        saleTaxRule: productList[i].SaleTaxRule,
        lastModifiedOn: productList[i].LastModifiedOn,
        sellable: productList[i].Sellable,
        pickZones: productList[i].PickZones,
        billOfMaterial: productList[i].BillOfMaterial,
        autoAssembly: productList[i].AutoAssembly,
        autoDisassembly: productList[i].AutoDisassembly,
        quantityToProduce: productList[i].QuantityToProduce,
        alwaysShowQuantity: productList[i].AlwaysShowQuantity,
        assemblyInstructionURL: productList[i].AssemblyInstructionURL,
        assemblyCostEstimationMethod: productList[i].AssemblyCostEstimationMethod,
        suppliers: productList[i].Suppliers,
        reorderLevels: productList[i].ReorderLevels,
        billOfMaterialsProducts: productList[i].BillOfMaterialsProducts,
        billOfMaterialsServices: productList[i].BillOfMaterialsServices,
        movements: productList[i].Movements,
        attachments: productList[i].Attachments,
        bomType: productList[i].BOMType,
        warrantyName: productList[i].WarrantyName,
        customPrices: productList[i].CustomPrices,
        cartonHeight: productList[i].CartonHeight,
        cartonWidth: productList[i].CartonWidth,
        cartonLength: productList[i].CartonLength,
        cartonQuantity: productList[i].CartonQuantity,
        cartonInnerQuantity: productList[i].CartonInnerQuantity,
      });

      product.save();

      io.to(socketID).emit("updateDearProducts", i + 1);
      await sleep(0);
    }

    await DearLogs.updateOne(
      { id: "updateDearProducts" },
      { id: "updateDearProducts", lastUpdated: new Date().toLocaleString("en-US"), updatedBy: req.body.user },
      { upsert: true }
    );

    res.status(200).send(productList);
  } catch (err) {
    console.log(err);
    res.status(500).send("Update Failed.");
  }
};
const updateDearInventory = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "updateDearInventory");

    const socketID = req.query.socketID.toString();
    const io = req.app.get("io") as Server;

    const inventory = await getDearInventoryAPI(io, socketID);
    io.to(socketID).emit("updateDearInventoryMax", inventory.length);

    await DearInventory.deleteMany({});

    for (let i = 0; i < inventory.length; i++) {
      let dearLocation;
      if (inventory[i].Bin) dearLocation = await DearLocations.findOne({ location: `${inventory[i].Location}: ${inventory[i].Bin}` });
      else dearLocation = await DearLocations.findOne({ location: inventory[i].Location });

      const stock = new DearInventory({
        sku: inventory[i].SKU,
        barcode: inventory[i].Barcode,
        name: inventory[i].Name,
        site: inventory[i].Location,
        bin: inventory[i].Bin,
        locationID: dearLocation.locationID,
        location: inventory[i].Bin ? `${inventory[i].Location}: ${inventory[i].Bin}` : inventory[i].Location,
        onHand: inventory[i].OnHand,
        allocated: inventory[i].Allocated,
        available: inventory[i].Available,
        onOrder: inventory[i].OnOrder,
        stockOnHand: inventory[i].StockOnHand,
      });

      stock.save();

      io.to(socketID).emit("updateDearInventory", i + 1);
      await sleep(1);
    }

    await DearLogs.updateOne(
      { id: "updateDearInventory" },
      { id: "updateDearInventory", lastUpdated: new Date().toLocaleString("en-US"), updatedBy: req.body.user },
      { upsert: true }
    );

    res.status(200).send(inventory);
  } catch (err) {
    console.log(err);
    res.status(500).send("Update Failed.");
  }
};

const getDearLocations = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getDearLocations");
    const locations = await DearLocations.find();
    res.status(200).send(locations);
  } catch (err) {
    res.status(500).send(err);
  }
};
const getDearProducts = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getDearProducts");
    const products = await DearProducts.find();
    res.status(200).send(products);
  } catch (err) {
    res.status(500).send(err);
  }
};
const getDearInventory = async (req: Request, res: Response) => {
  try {
    userAction(req.body.user, "getDearInventory");
    const inventory = await DearInventory.find();
    res.status(200).send(inventory);
  } catch (err) {
    res.status(500).send(err);
  }
};

const dearControllers = { updateDearProducts, updateDearLocations, updateDearInventory, getDearInventory, getDearLocations, getDearProducts };
export default dearControllers;
