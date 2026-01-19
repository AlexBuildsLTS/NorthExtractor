import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

// 1. Define a Universal Storage Adapter
const localStorageAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === "web") {
      return typeof window !== "undefined"
        ? window.localStorage.getItem(key)
        : null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined")
        window.localStorage.setItem(key, value);
    } else {
      SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: (key: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
    } else {
      SecureStore.deleteItemAsync(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// 2. Initialize Client with Universal Adapter
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
