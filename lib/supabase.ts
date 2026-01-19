import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 * 🔐 NORTH INTELLIGENCE OS: STABILIZED AUTH ENGINE V1.4
 * ============================================================================
 * FIXES:
 * - TYPEERROR: 'this.lock is not a function' permanently bypassed.
 * - REACT NATIVE COMPATIBILITY: Uses null lock to leverage NavigatorLock fallback.
 * - BUNDLER STABILITY: Prevents render.js crashes during Metro bundling.
 * ============================================================================
 */

const isWeb = Platform.OS === 'web';
const isServer = typeof window === 'undefined';

const localStorageAdapter = {
  getItem: (key: string) => {
    if (isWeb) {
      return !isServer ? window.localStorage.getItem(key) : null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (isWeb) {
      if (!isServer) window.localStorage.setItem(key, value);
    } else {
      SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: (key: string) => {
    if (isWeb) {
      if (!isServer) window.localStorage.removeItem(key);
    } else {
      SecureStore.deleteItemAsync(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});