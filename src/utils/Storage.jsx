import { MMKV } from "react-native-mmkv";
export const storage = new MMKV();
export const FCM_TOKEN_KEY = "fcmToken";
export const USER_DATA_KEY = "BeejPrabandhan_UserData";
export const USER_TOKEN_KEY = "BeejPrabandhan_Token";


//  Function to save User data
export const saveUserData = (userData) => {
  try {
    storage.set(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

//  Function to save User token
export const saveUserToken = (token) => {
  console.log(token,"line 16")
  try {
    storage.set(USER_TOKEN_KEY, JSON.stringify(token));
    console.log("User token saved successfully");
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

// Function to get user data
export const getUserData = () => {
  try {
    const data = storage.getString(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

// Function to get user data
export const getUserToken = () => {
  try {
    const data = storage.getString(USER_TOKEN_KEY);
    const parsedData = data ? JSON.parse(data) : null;
    console.log(parsedData,"line 41")
    return parsedData;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

// Function to remove user data (logout)
export const removeUserData = () => {
  try {
    storage.delete(USER_DATA_KEY);
    storage.delete(USER_TOKEN_KEY);
    storage.delete(FCM_TOKEN_KEY);
    console.log("User data removed successfully");
  } catch (error) {
    console.error("Error removing user data:", error);
  }
};

// Custom storage engine for redux-persist
export const mmkvStorage = {
  setItem: (key, value) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key) => {
    const value = storage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key) => {
    storage.delete(key);
    return Promise.resolve(true);
  },
};
