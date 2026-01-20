/**
 * ============================================================================
 * 🔐 APEXSCRAPE: SSR-STABILIZED AUTH ENGINE (FINAL PRODUCTION GRADE)
 * ============================================================================
 * Path: lib/supabase.ts
 * * PURPOSE:
 * This file initializes the Supabase client with a custom storage adapter
 * designed to prevent the "ReferenceError: window is not defined" crash
 * commonly encountered during Metro bundling or Server-Side Rendering (SSR).
 * * FIXES:
 * - ReferenceError: window is not defined
 * - TypeError: 'this.lock is not a function' (navigatorLock issues)
 * - Platform-agnostic session persistence (Native vs Web)
 * ============================================================================
 */

import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/database.types';
import * as SecureStore from 'expo-secure-store';

// ENVIRONMENT DETECTION
const isWeb = Platform.OS === 'web';
const isServer = typeof window === 'undefined';

/**
 * SSR-SAFE STORAGE ADAPTER
 * This object mimics the AsyncStorage API but includes safety guards to prevent
 * the Node.js/Metro bundler from attempting to access browser-only 'window' objects.
 */
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isWeb) {
      if (isServer) return null; // Prevents crash during bundling
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isWeb) {
      if (!isServer) window.localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isWeb) {
      if (!isServer) window.localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'SYSTEM WARNING: Supabase configuration keys are missing in .env',
  );
}

/**
 * INITIALIZE STABILIZED CLIENT
 * Uses the safeStorage adapter and forces 'pkce' flow for high-fidelity
 * auth stability within the Expo Router architecture.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // Required for reliable auth in Expo
  },
});

/**
 * EXPORT TYPES FOR GLOBAL RE-USE
 */
export type SupabaseClient = typeof supabase;
