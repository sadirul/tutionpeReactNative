import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slice/authSlice"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persistReducer, persistStore } from "redux-persist"
import { combineReducers } from "redux"

// persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage, // ✅ ঠিক আছে, RN এ AsyncStorage ব্যবহার হচ্ছে
  whitelist: ["auth"],   // চাইলে এখানে state গুলো specify করতে পারো
}

// combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // persist এর জন্য দরকার
    }),
})

export const persistor = persistStore(store)
