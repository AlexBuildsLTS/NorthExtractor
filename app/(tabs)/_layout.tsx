/**
 * ============================================================================
 * 🧭 NorthScrape ADAPTIVE NAVIGATION (V5 ENTERPRISE)
 * ============================================================================
 * - FIXED: Double headers removed via 'headerShown: false' at the Root level.
 * - FIXED: Bottom Navigation Bar completely removed on Desktop.
 * - ADDED: 'Logs' tab for real-time Firecrawl-style activity streaming.
 * - DESIGN: Flat, professional 5-icon bar (Mobile) / Fixed Sidebar (Desktop).
 * ============================================================================
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import { Tabs, Slot, useRouter, usePathname, Redirect } from 'expo-router';
import {
  LayoutDashboard,
  Bot,
  Terminal,
  PlusSquare,
  Zap,
  LogOut,
  Globe,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

const DESKTOP_WIDTH = 1024;

export default function AdaptiveLayout() {
  const { user, logout, isLoading } = useAuth();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();

  const isDesktop = width >= DESKTOP_WIDTH;

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  // ==========================================
  // VIEW A: DESKTOP SIDEBAR (NO BOTTOM BAR)
  // ==========================================
  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.sidebar}>
          <View>
            {/* BRANDING */}
            <View className="flex-row items-center px-2 mb-12">
              <View className="w-10 h-10 bg-[#4FD1C7] rounded-xl items-center justify-center shadow-lg shadow-[#4FD1C7]/30">
                <Zap size={22} color="#020617" fill="#020617" />
              </View>
              <Text className="ml-3 text-xl font-black tracking-tighter text-white uppercase">
                NorthScrape
              </Text>
            </View>

            {[
              {
                label: 'Intelligence Hub',
                icon: LayoutDashboard,
                path: '/(tabs)/',
              },
              { label: 'Cloud Crawler', icon: Globe, path: '/(tabs)/create' },
              { label: 'Live Activity', icon: Terminal, path: '/(tabs)/logs' },
              { label: 'AI Synthesis', icon: Bot, path: '/(tabs)/ai-chat' },
            ].map((item) => {
              const active = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.path}
                  onPress={() => router.push(item.path as any)}
                  className={`flex-row items-center p-4 rounded-2xl mb-2 ${active ? 'bg-white/5 border border-white/10' : ''}`}
                >
                  <item.icon size={20} color={active ? '#4FD1C7' : '#475569'} />
                  <Text
                    className={`ml-4 font-bold text-sm ${active ? 'text-white' : 'text-slate-500'}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={logout}
            className="flex-row items-center p-4 pt-8 border-t border-white/5"
          >
            <LogOut size={20} color="#EF4444" />
            <Text className="ml-4 font-bold text-red-500">
              Terminate Session
            </Text>
          </TouchableOpacity>
        </View>

        {/* MAIN CONTENT VIEWPORT */}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    );
  }

  // ==========================================
  // VIEW B: MOBILE TABS (FIXED ARCHITECTURE)
  // ==========================================
  return (
    <View style={styles.mobileRoot}>
      <Tabs
        screenOptions={{
          headerShown: false, // CRITICAL: REMOVES THE FIRST HEADER
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#0F172A',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.05)',
            height: Platform.OS === 'ios' ? 88 : 68,
          },
          tabBarActiveTintColor: '#4FD1C7',
          tabBarInactiveTintColor: '#475569',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <LayoutDashboard size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            tabBarIcon: ({ color }) => <Globe size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            tabBarIcon: ({ color }) => <Terminal size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="ai-chat"
          options={{
            tabBarIcon: ({ color }) => <Bot size={24} color={color} />,
          }}
        />

        {/* UTILITY - ACCESSED VIA HEADER ONLY */}
        <Tabs.Screen name="settings/profile" options={{ href: null }} />
        <Tabs.Screen name="settings/security" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopRoot: { flex: 1, flexDirection: 'row', backgroundColor: '#020617' },
  sidebar: {
    width: 280,
    backgroundColor: '#0A101F',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    padding: 32,
    justifyContent: 'space-between',
  },
  mobileRoot: { flex: 1, backgroundColor: '#020617' },
});
