/**
 * ============================================================================
 * 🧭 NORTH INTELLIGENCE OS: COMMAND NAVIGATION (FINAL FIX)
 * ============================================================================
 * FIXES:
 * - GHOST TAB REMOVED: Explicitly hides 'settings/wallet' from the tab bar.
 * - STRUCTURE: Keeps Bulk Dispatcher and all previous nodes intact.
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
import { Tabs, Slot, useRouter, usePathname } from 'expo-router';
import {
  LayoutDashboard,
  Bot,
  Terminal,
  Zap,
  LogOut,
  Globe,
  Cpu,
  Layers,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

const DESKTOP_WIDTH = 1024;

export default function AdaptiveLayout() {
  const { logout } = useAuth();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const router = useRouter();

  const isDesktop = width >= DESKTOP_WIDTH;

  const navigationNodes = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/(tabs)/' },
    { label: 'Cloud Crawler', icon: Globe, path: '/(tabs)/create' },
    { label: 'Direct Scraper', icon: Cpu, path: '/(tabs)/scraper' },
    { label: 'Bulk Dispatcher', icon: Layers, path: '/(tabs)/bulk-dispatcher' },
    { label: 'Logs', icon: Terminal, path: '/(tabs)/logs' },
    { label: 'AI', icon: Bot, path: '/(tabs)/ai-chat' },
  ];

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.sidebar}>
          <View>
            <View style={styles.brandBox}>
              <View style={styles.logoCircle}>
                <Zap size={22} color="#020617" fill="#020617" />
              </View>
              <Text style={styles.brandText}>NorthOS</Text>
            </View>

            {navigationNodes.map((item) => {
              const active = pathname === item.path;
              return (
                <TouchableOpacity
                  key={item.path}
                  onPress={() => router.push(item.path as any)}
                  style={[styles.sideItem, active && styles.sideItemActive]}
                >
                  <item.icon size={20} color={active ? '#4FD1C7' : '#475569'} />
                  <Text
                    style={[styles.sideLabel, active && styles.sideLabelActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={logout} style={styles.sideLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0A101F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: Platform.OS === 'ios' ? 90 : 70,
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
        name="scraper"
        options={{ tabBarIcon: ({ color }) => <Cpu size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="bulk-dispatcher"
        options={{
          tabBarIcon: ({ color }) => <Layers size={24} color={color} />,
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
        options={{ tabBarIcon: ({ color }) => <Bot size={24} color={color} /> }}
      />

      {/* --- HIDDEN SYSTEM ROUTES (NO GHOST TABS) --- */}
      <Tabs.Screen name="settings/index" options={{ href: null }} />
      <Tabs.Screen name="settings/profile" options={{ href: null }} />
      <Tabs.Screen name="settings/security" options={{ href: null }} />
      <Tabs.Screen name="settings/proxies" options={{ href: null }} />
      <Tabs.Screen name="settings/webhooks" options={{ href: null }} />
      <Tabs.Screen name="settings/wallet" options={{ href: null }} />
    </Tabs>
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
  brandBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#4FD1C7',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
  },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  sideItemActive: {
    backgroundColor: 'rgba(79, 209, 199, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 199, 0.1)',
  },
  sideLabel: {
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  sideLabelActive: { color: 'white' },
  sideLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logoutText: { marginLeft: 16, fontWeight: '900', color: '#EF4444' },
});