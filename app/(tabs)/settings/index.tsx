/**
 * ============================================================================
 * ⚙️ NORTH INTELLIGENCE OS: SETTINGS HUB (ULTIMATE UI)
 * ============================================================================
 * PATH: app/(tabs)/settings/index.tsx
 * FEATURES:
 * - Flagship "Identity Card" Header (Redesigned).
 * - Direct Access to Crypto Ledger.
 * - Deep Glassmorphism & Neon Accents.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  User,
  ShieldCheck,
  ChevronRight,
  LogOut,
  DollarSign,
  Wallet,
  X,
  Check,
  Zap,
  Globe,
  Bell,
} from 'lucide-react-native';

import { MainHeader } from '@/components/ui/MainHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC'] as const;

export default function SettingsIndex() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currencyModal, setCurrencyModal] = useState(false);

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
        {/* --- 1. FLAGSHIP IDENTITY CARD (REDESIGNED) --- */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.identityContainer}
        >
          <GlassCard style={styles.identityCard}>
            <LinearGradient
              colors={['rgba(79, 209, 199, 0.15)', 'transparent'] as const}
              style={styles.cardGradient}
            />

            <View style={styles.idHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarRing}>
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <User size={32} color="#4FD1C7" />
                  )}
                </View>
                <View style={styles.onlineBadge} />
              </View>

              <View style={styles.idInfo}>
                <Text style={styles.idLabel}>OPERATOR IDENTITY</Text>
                <Text style={styles.idName} numberOfLines={1}>
                  {user?.fullName || 'UNKNOWN_OPERATOR'}
                </Text>
                <View style={styles.roleContainer}>
                  <Zap size={10} color="#0EA5E9" fill="#0EA5E9" />
                  <Text style={styles.roleText}>
                    {user?.role?.toUpperCase() || 'MEMBER'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.idFooter}>
              <Text style={styles.idHash}>ID: {user?.id?.slice(0, 18)}...</Text>
              <Text style={styles.idStatus}>SYSTEM_ONLINE</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* --- 2. ACCOUNT SETTINGS --- */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>ACCOUNT_IDENTITY</Text>
          <GlassCard style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/settings/profile')}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(100, 255, 218, 0.1)' },
                ]}
              >
                <User size={20} color="#64FFDA" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Profile Information</Text>
                <Text style={styles.itemSub}>Biometric & Public Metadata</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/settings/security')}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(96, 165, 250, 0.1)' },
                ]}
              >
                <ShieldCheck size={20} color="#60A5FA" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Security Vault</Text>
                <Text style={styles.itemSub}>Encryption & Session Keys</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* --- 3. INFRASTRUCTURE --- */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>NODE_INFRASTRUCTURE</Text>
          <GlassCard style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/settings/proxies')}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(168, 85, 247, 0.1)' },
                ]}
              >
                <Globe size={20} color="#A855F7" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Proxy Grid</Text>
                <Text style={styles.itemSub}>Manage Rotating IP Pools</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/settings/webhooks')}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(236, 72, 153, 0.1)' },
                ]}
              >
                <Bell size={20} color="#EC4899" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Webhook Uplink</Text>
                <Text style={styles.itemSub}>Event Dispatch Configuration</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* --- 4. GLOBAL PREFERENCES --- */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionTitle}>GLOBAL_PREFERENCES</Text>
          <GlassCard style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setCurrencyModal(true)}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(79, 209, 199, 0.1)' },
                ]}
              >
                <DollarSign size={20} color="#4FD1C7" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Display Currency</Text>
                <Text style={styles.itemSub}>{user?.currency || 'USD'}</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* WALLET BUTTON */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/settings/wallet')}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
                ]}
              >
                <Wallet size={20} color="#F59E0B" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Crypto Ledger</Text>
                <Text style={styles.itemSub}>Wallet & Transactions</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
          </GlassCard>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CURRENCY MODAL */}
      <Modal visible={currencyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Base Unit</Text>
              <TouchableOpacity onPress={() => setCurrencyModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr}
                style={styles.modalItem}
                onPress={() => {
                  Alert.alert('Updated', `Currency set to ${curr}`);
                  setCurrencyModal(false);
                }}
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
  scrollArea: { padding: 24, paddingBottom: 100 },

  // IDENTITY CARD (NEW DESIGN)
  identityContainer: { marginBottom: 32 },
  identityCard: {
    padding: 0,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 199, 0.2)',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  idHeader: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  avatarContainer: { position: 'relative' },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#020617',
    borderWidth: 2,
    borderColor: '#4FD1C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#020617',
  },

  idInfo: { flex: 1, justifyContent: 'center' },
  idLabel: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  idName: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
  },
  roleText: {
    color: '#0EA5E9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  idFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  idHash: {
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
  },
  idStatus: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // SECTIONS
  sectionGroup: { marginBottom: 32 },
  sectionTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
    marginLeft: 8,
  },
  sectionCard: { padding: 0, borderRadius: 24, overflow: 'hidden' },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: { flex: 1 },
  itemLabel: { color: 'white', fontSize: 15, fontWeight: '700' },
  itemSub: { color: '#64748B', fontSize: 11, marginTop: 2 },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginLeft: 78,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    gap: 12,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { borderRadius: 32, padding: 24 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalItemText: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
});
