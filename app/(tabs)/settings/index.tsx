/**
 * ============================================================================
 * ⚙️ NORTH INTELLIGENCE OS: SETTINGS HUB V13.0 (AAA+ ELITE)
 * ============================================================================
 * FEATURES:
 * - DYNAMIC SECTIONS: Grouped by Account, Infrastructure, and Administration.
 * - ROLE-BASED ACCESS: Admin-only modules synchronized with Supabase ledger.
 * - PREFERENCE ENGINE: Integrated Currency selection modal.
 * - GEOMETRY: 32px hyper-rounded glass modules with section-level depth.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  ShieldCheck,
  Globe,
  Bell,
  ChevronRight,
  LogOut,
  DollarSign,
  Palette,
  X,
  Check,
  Cpu,
} from 'lucide-react-native';

// UI INTERNAL IMPORTS
import { MainHeader } from '@/components/ui/MainHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SEK', 'JPY'] as const;
type Currency = (typeof CURRENCIES)[number];

// Define types for better maintainability
interface MenuItem {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  sub: string;
  link: string;
  color: string;
}

interface Section {
  title: string;
  items: MenuItem[];
}

// Move sections to constants for better maintainability
const BASE_SECTIONS: Section[] = [
  {
    title: 'ACCOUNT_IDENTITY',
    items: [
      {
        icon: User,
        label: 'Profile Information',
        sub: 'Biometric Metadata',
        link: '/(tabs)/settings/profile',
        color: '#64FFDA',
      },
      {
        icon: ShieldCheck,
        label: 'Security Vault',
        sub: 'Encryption Keys',
        link: '/(tabs)/settings/security',
        color: '#60A5FA',
      },
    ],
  },
  {
    title: 'NODE_INFRASTRUCTURE',
    items: [
      {
        icon: Globe,
        label: 'Proxy Nodes',
        sub: 'IP Rotation Control',
        link: '/(tabs)/settings/proxies',
        color: '#F472B6',
      },
      {
        icon: Bell,
        label: 'Webhook Dispatch',
        sub: 'Data Stream Hub',
        link: '/(tabs)/settings/webhooks',
        color: '#A78BFA',
      },
    ],
  },
];

const ADMIN_SECTION: Section = {
  title: 'SYSTEM_ADMINISTRATION',
  items: [
    {
      icon: Cpu,
      label: 'Admin Control Center',
      sub: 'System-wide Telemetry',
      link: '/(tabs)/admin',
      color: '#F59E0B',
    },
  ],
};

export default function SettingsIndex() {
  const router = useRouter();
  const { user, logout, refreshProfile } = useAuth();
  const [currencyModal, setCurrencyModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Use useMemo for performance optimization
  const sections = useMemo(() => {
    const sections = [...BASE_SECTIONS];
    // ADMIN PRIVILEGE MODULE
    if (user?.role?.toLowerCase() === 'admin') {
      sections.splice(1, 0, ADMIN_SECTION);
    }
    return sections;
  }, [user?.role]);

  const handleCurrencyChange = async (newCurrency: Currency) => {
    setSaving(true);
    try {
      // Simulation of your settingsService logic adapted for NorthOS
      // In a real app, this would be an API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure for demo
          if (Math.random() > 0.9) reject(new Error('Failed to update currency'));
          resolve(null);
        }, 1000);
      });
      setCurrencyModal(false);
      setSaving(false);
      // Refresh profile if currency affects it
      await refreshProfile();
      Alert.alert('Success', `Ledger currency adjusted to ${newCurrency}`);
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to update currency. Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="System Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* OPERATOR HUD */}
        <GlassCard style={styles.opCard}>
          <View style={styles.avatarBox}>
            <User size={32} color="#4FD1C7"/>
          </View>
          <View>
            <Text style={styles.opName}>
              {user?.full_name || 'GHOST_OPERATOR'}
            </Text>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    user?.role?.toLowerCase() === 'admin'
                      ? 'rgba(245,158,11,0.15)'
                      : 'rgba(79,209,199,0.1)',
                },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  {
                    color:
                      user?.role?.toLowerCase() === 'admin'
                        ? '#F59E0B'
                        : '#4FD1C7',
                  },
                ]}
              >
                {user?.role?.toUpperCase() || 'OPERATOR'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* DYNAMIC SECTIONS */}
        {sections.map((section, sIdx) => (
          <View key={section.title} style={styles.sectionGroup}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <GlassCard style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => router.push(item.link as any)}
                  style={[
                    styles.menuItem,
                    iIdx !== section.items.length - 1 && styles.menuBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <item.icon size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemSub}>{item.sub}</Text>
                  </View>
                  <ChevronRight size={18} color="#1E293B" />
                </TouchableOpacity>
              ))}
            </GlassCard>
          </View>
        ))}

        {/* PREFERENCES MODULE */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>GLOBAL_PREFERENCES</Text>
          <GlassCard style={styles.sectionCard}>
            <TouchableOpacity
              onPress={() => setCurrencyModal(true)}
              style={[styles.menuItem, styles.menuBorder]}
            >
              <View style={styles.iconBoxPref}>
                <DollarSign size={20} color="#4FD1C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>Base Currency</Text>
                <Text style={styles.itemSub}>{user?.currency || 'USD'}</Text>
              </View>
              {saving ? (
                <ActivityIndicator size="small" color="#4FD1C7" />
              ) : (
                <ChevronRight size={18} color="#1E293B" />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View
                style={[
                  styles.iconBoxPref,
                  { backgroundColor: 'rgba(167, 139, 250, 0.1)' },
                ]}
              >
                <Palette size={20} color="#A78BFA" />
              </View>
              <Text style={styles.itemLabel}>Appearance</Text>
              <View style={styles.darkTag}>
                <Text style={styles.darkTagText}>DARK</Text>
              </View>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* LOGOUT COMMAND */}
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>SIGN OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CURRENCY SELECTION MODAL */}
      <Modal visible={currencyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr}
                onPress={() => handleCurrencyChange(curr)}
                style={styles.modalItem}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    curr === user?.currency && { color: '#4FD1C7' },
                  ]}
                >
                  {curr}
                </Text>
                {curr === user?.currency && <Check size={20} color="#4FD1C7" />}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollArea: { padding: 32, paddingBottom: 150 },
  opCard: {
    padding: 32,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 40,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#0A101F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4FD1C7',
  },
  opName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  roleText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  sectionGroup: { marginBottom: 32 },
  sectionTitle: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 16,
    marginLeft: 8,
  },
  sectionCard: { borderRadius: 32, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxPref: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 209, 199, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { color: 'white', fontSize: 15, fontWeight: '900' },
  itemSub: { color: '#475569', fontSize: 11, fontWeight: '700', marginTop: 2 },
  darkTag: {
    backgroundColor: '#020617',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  darkTagText: { color: '#475569', fontSize: 10, fontWeight: '900' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 28,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '900',
    marginLeft: 16,
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: { borderRadius: 40, padding: 32 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalItemText: { color: '#475569', fontSize: 18, fontWeight: '800' },
});
