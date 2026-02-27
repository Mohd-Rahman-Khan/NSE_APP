import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { mmkvStorage } from "../utils/Storage";
import userReducer from './slice/UserSlice';

const persistConfig = {
  key: "root",
  storage: mmkvStorage,
};

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

// Configure the store
export const store = configureStore({
  reducer: {
    user: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Create a persistor
export const persistor = persistStore(store);
