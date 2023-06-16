import WalmartUSControlGroup from "models/Customers/WalmartUSControlGroup";

const walmartCG = async () => {
  try {
    const control = await WalmartUSControlGroup.findOne();
    const newSerialCode = control ? control.serialNumber + 1 : 1;
    const controlGroup = newSerialCode.toString().padStart(8, "0");

    await WalmartUSControlGroup.findOneAndUpdate({}, { serialNumber: newSerialCode, controlGroup: controlGroup }, { upsert: true });

    return { serialNumber: newSerialCode, controlGroup: controlGroup };
  } catch (err) {
    console.log(err);
  }
};

export default walmartCG;
