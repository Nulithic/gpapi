import WalmartUSLabelCodes from "models/Customers/WalmartUSLabelCodes";

const walmartSSCC = async () => {
  const lastRecord = await WalmartUSLabelCodes.findOne().sort("-serialNumber");
  const newSerialCode = lastRecord ? lastRecord.serialNumber + 1 : 0;
  const serialNumber = newSerialCode.toString().padStart(7, "0");

  const ssccData = "0" + "081995202" + serialNumber;

  let sum = 0;
  for (let i = 0; i < ssccData.length; i++) {
    const digit = parseInt(ssccData[i]);
    const weight = i % 2 == 0 ? 3 : 1;
    sum += digit * weight;
  }
  const checkDigit = (10 - (sum % 10)) % 10;

  const sscc = "00" + ssccData + checkDigit;

  return { ssscc: sscc, serialNumber: serialNumber };
};

export default walmartSSCC;
