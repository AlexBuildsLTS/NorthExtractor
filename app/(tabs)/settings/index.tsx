/**
 * ============================================================================
 * ⚙️ NORTH INTELLIGENCE OS: SETTINGS HUB (FINAL)
 * ============================================================================
 * PATH: app/(tabs)/settings/index.tsx
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
  ActivityIndicator,
  Alert,
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

      <ScrollView contentContainerStyle={styles.scrollArea}>
        {/* OPERATOR HUD */}
        <GlassCard style={styles.opCard}>
          <View style={styles.avatarBox}>
            <User size={32} color="#4FD1C7" />
          </View>
          <View>
            <Text style={styles.opName}>{user?.fullName || 'OPERATOR'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role?.toUpperCase() || 'MEMBER'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* SETTINGS GROUP */}
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
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>Profile Information</Text>
                <Text style={styles.itemSub}>Biometric Metadata</Text>
              </View>
              <ChevronRight size={18} color="#1E293B" />
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
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>Security Vault</Text>
                <Text style={styles.itemSub}>Encryption Keys</Text>
              </View>
              <ChevronRight size={18} color="#1E293B" />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* WALLET / PREFERENCES */}
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
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>Display Currency</Text>
                <Text style={styles.itemSub}>{user?.currency || 'USD'}</Text>
              </View>
              <ChevronRight size={18} color="#1E293B" />
            </TouchableOpacity>
          </GlassCard>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>SIGN OUT</Text>
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
  opCard: {
    padding: 24,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 32,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#0A101F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4FD1C7',
  },
  opName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    backgroundColor: 'rgba(79, 209, 199, 0.1)',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#4FD1C7',
  },
  sectionGroup: { marginBottom: 32 },
  sectionTitle: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 16,
    marginLeft: 8,
  },
  sectionCard: { borderRadius: 24, overflow: 'hidden', padding: 0 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginLeft: 64,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { color: 'white', fontSize: 14, fontWeight: '800' },
  itemSub: { color: '#475569', fontSize: 11, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '900',
    marginLeft: 12,
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: { borderRadius: 32, padding: 32 },
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalItemText: { color: '#94a3b8', fontSize: 16, fontWeight: '700' },
});
