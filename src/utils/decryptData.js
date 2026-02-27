import CryptoJS from "crypto-js";

const CRYPTO_KEY =
  "ewerrwxr9bvcocvfIfIvEM3erLl34ldvczxcsp4txlki1as4gq22h%fa8fxfk";
const LGC = 4;

const getPmh = () => {
  let tem = CRYPTO_KEY;
  let res = "";
  for (let i = 0; i <= tem.length; i++) {
    if (i % LGC === 0) {
      res += tem[i];
    }
  }
  return res;
};

const secretKeyStr = getPmh();
const secretKey = CryptoJS.enc.Utf8.parse(secretKeyStr);

export const decryptAES = (val) => {
  if (!val) return null;

  // Replace symbols back to original base64 encoding
  val = val.replaceAll(".", "/").replaceAll(" ", "+");

  try {
    const decrypted = CryptoJS.AES.decrypt(val, secretKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8) || null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export const deepDecryptObject = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  const decrypted = Array.isArray(obj) ? [] : {};

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "string") {
      decrypted[key] = isLikelyEncrypted(value) ? decryptAES(value) ?? null : value;
    } else if (value && typeof value === "object") {
      decrypted[key] = deepDecryptObject(value);
    } else {
      decrypted[key] = value;
    }
  });

  return decrypted;
};


const isLikelyEncrypted = (value) => {
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
  return (
    base64Regex.test(value) &&
    value.length >= 16 &&
    !value.includes(" ") &&
    !value.startsWith("{") &&
    !value.startsWith("[") &&
    !value.includes("@")
  );
};

export const encryptAES = (val, skipSymbolReplacement = false) => {
  if (val == null) return null;

  try {
    let encrypted = CryptoJS.AES.encrypt(val.toString(), secretKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    if (!skipSymbolReplacement) {
      encrypted = encrypted.replaceAll("/", ".").replaceAll("+", " ");
    }

    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return val; // fallback to original value
  }
};

export const deepEncryptObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const encrypted = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];

    if (typeof value === "string" || typeof value === "number") {
      encrypted[key] = encryptAES(value.toString());
    } else if (typeof value === "object" && value !== null) {
      encrypted[key] = deepEncryptObject(value); // recursive
    } else {
      encrypted[key] = value;
    }
  }

  return encrypted;
};

export const encryptFullPayload = (obj) => {
  if (!obj || typeof obj !== "object") return null;

  try {
    const jsonString = JSON.stringify(obj);
    const encrypted = encryptAES(jsonString, true); // true = skip symbol replacement for server compatibility
    return { data: encrypted };
  } catch (error) {
    console.error("Full payload encryption failed:", error);
    return null;
  }
};

export const encryptWholeObject = (obj) => {
  if (!obj || typeof obj !== "object") return null;

  try {
    const jsonString = JSON.stringify(obj);
    return encryptAES(jsonString, true); // true to keep original characters (slashes, pluses, etc.)
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};
