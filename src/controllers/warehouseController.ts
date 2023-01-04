import { Request, Response } from "express";
import path from "path";

import { WarehouseModel } from "models";

//Inventory Count
const getInventoryCountTemplate = (req: Request, res: Response) => {
  const directoryPath = path.dirname(require.main.filename) + "/src/resources/templates/";
  res.download(directoryPath + "InventoryCountTemplate.xlsx", "InventoryCountTemplate.xlsx", (err) => {
    if (err) res.status(500);
  });
};
const getInventoryCountList = async (req: Request, res: Response) => {
  try {
    const inventoryCount = await WarehouseModel.InventoryCount.find();
    res.status(200).send(inventoryCount);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
const getCurrentCount = async (req: Request, res: Response) => {
  try {
    const count = await WarehouseModel.ItemCount.findById(req.query.id);
    res.status(200).send(count);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
const addInventoryCount = async (req: Request, res: Response) => {
  try {
    const count = req.body.inventoryCount;
    var currentTime = new Date();
    var date = currentTime.toLocaleDateString();
    var time = currentTime.toLocaleTimeString();

    const newCount = new WarehouseModel.InventoryCount({
      name: count.name,
      info: count.info,
      date: `${date} ${time}`,
    });

    newCount.save();

    const inventoryCount = await WarehouseModel.InventoryCount.find();
    res.status(200).send(inventoryCount);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
const addItemCount = async (req: Request, res: Response) => {
  try {
    const item = req.body.itemCount;
    var currentTime = new Date();
    var date = currentTime.toLocaleDateString();
    var time = currentTime.toLocaleTimeString();

    const newItemCount = new WarehouseModel.ItemCount({
      parent: item.parent,
      bin: item.bin,
      upc: item.upc,
      sku: item.sku,
      caseSize: item.caseSize,
      caseQty: item.caseQty,
      loose: item.loose,
      totalQty: item.caseQty * item.caseSize + item.loose,
      po: item.po,
      comment: item.comment,
      date: `${date} ${time}`,
    });

    newItemCount.save();
    const itemCount = await WarehouseModel.ItemCount.findById({ parent: item.parent });
    res.status(200).send(itemCount);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
const deleteInventoryCount = (req: Request, res: Response) => {
  const inventoryCountID = req.body.inventoryCountID;

  WarehouseModel.InventoryCount.findByIdAndRemove(inventoryCountID, { new: true, useFindAndModify: false }, function (err) {
    if (err) return res.status(500).send({ message: err });
    WarehouseModel.InventoryCount.find({}, function (err: any, inventoryCount: any) {
      if (err) return res.status(500).send({ message: err });
      res.status(200).send({ message: "Inventory count was deleted.", inventoryCount: inventoryCount });
    });
  });
};
const deleteItemCount = (req: Request, res: Response) => {
  const itemCountID = req.body.itemCountID;

  WarehouseModel.InventoryCount.findById(itemCountID.inventoryCountID, function (err: any, item: any) {
    if (err) return res.status(500).send({ message: err });
    for (let i = 0; i < item.counts.length; i++) {
      if (itemCountID.itemID == item.counts[i]._id) {
        WarehouseModel.InventoryCount.findByIdAndUpdate(
          { _id: itemCountID.inventoryCountID },
          { $pull: { counts: { _id: itemCountID.itemID } } },
          { new: true, useFindAndModify: false },
          function (err) {
            if (err) return res.status(500).send({ message: err });
            WarehouseModel.InventoryCount.find({}, function (err: any, inventoryCount: any) {
              if (err) return res.status(500).send({ message: err });
              WarehouseModel.InventoryCount.findById(itemCountID.inventoryCountID, function (err: any, item: any) {
                if (err) return res.status(500).send({ message: err });
                res.status(200).send({ message: "Item was deleted.", inventoryCount: inventoryCount, itemCount: item });
              });
            });
          }
        );
        break;
      }
    }
  });
};

const WarehouseControllers = {
  getInventoryCountList,
  getCurrentCount,
  addInventoryCount,
  addItemCount,
};
export default WarehouseControllers;
