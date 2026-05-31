const bytes32 = require("bytes32");

export const messageToBytes32 = (message: string): string => {
    const cleanedUuid = message.replace(/-/g, "");
    if (cleanedUuid.length !== 32) {
      throw new Error("Invalid UUID length");
    }
    const bytes32Uuid = bytes32({ input: cleanedUuid });
    return bytes32Uuid;
  };