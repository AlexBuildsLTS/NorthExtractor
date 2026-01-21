/**
 * ============================================================================
 * 🔐 NORTH INTELLIGENCE OS: SECURITY VAULT (BENTO EDITION)
 * ============================================================================
 * PATH: app/(tabs)/settings/security.tsx
 * STATUS: PRODUCTION READY
 * FEATURES:
 * - Real Password Rotation.
 * - Visual Strength Meter (Correctly Linked).
 * - Deep Glass UI.
 * ============================================================================
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  ActivityIndicator, 
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ShieldCheck, LogOut, Key, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MainHeader } from '@/components/ui/MainHeader';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SecurityVault() {
  const router = useRouter();
  const { logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      return Alert.alert("Security Fault", "Encryption key requires minimum entropy (6+ chars).");
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setNewPassword('');
      Alert.alert("Vault Locked", "Your primary encryption hash has been rotated.");
    } catch (e: any) {
      Alert.alert("Rotation Failure", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0A101F', '#020617']} style={StyleSheet.absoluteFill} />
      <MainHeader title="Security Core" />

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={16} color="white" />
          <Text style={styles.backText}>RETURN</Text>
        </TouchableOpacity>

        {/* 1. ENCRYPTION CARD */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.bentoCard}>
          <View style={styles.glow} />
          <LinearGradient colors={['rgba(255,255,255,0.03)', 'transparent'] as const} style={styles.glassShine} />

          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Key size={18} color="#4FD1C7" />
            </View>
            <Text style={styles.cardTitle}>ENCRYPTION ROTATION</Text>
          </View>
          
          <View style={styles.inputGroup}>
             <Text style={styles.label}>NEW SECURITY HASH</Text>
             <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#475569"
              />
              {/* FIXED: Passing the correct prop 'password' */}
              <PasswordStrengthIndicator password={newPassword} />
          </View>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={handlePasswordUpdate} 
            disabled={loading || !newPassword}
          >
            {loading ? <ActivityIndicator color="#020617" /> : (
              <>
                <RefreshCw size={16} color="#020617" />
                <Text style={styles.btnText}>ROTATE KEY</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* 2. DANGER ZONE */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.bentoCard, styles.dangerBorder]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, styles.dangerIcon]}>
              <ShieldCheck size={18} color="#EF4444" />
            </View>
            <Text style={[styles.cardTitle, { color: '#EF4444' }]}>SESSION TERMINATION</Text>
          </View>
          
          <Text style={styles.description}>
            Immediate revocation of current session token. Requires re-authentication.
          </Text>

          <TouchableOpacity style={styles.dangerBtn} onPress={logout}>
            <LogOut size={16} color="#EF4444" />
            <Text style={styles.dangerBtnText}>EXECUTE SIGN OUT</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { padding: 24, paddingBottom: 100 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, opacity: 0.7 },
  backText: { color: 'white', fontSize: 10, fontWeight: '900', marginLeft: 8, letterSpacing: 2 },

  bentoCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#4FD1C7', opacity: 0, zIndex: -1 },
  glassShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(79, 209, 199, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(79, 209, 199, 0.2)' },
  cardTitle: { color: 'white', fontSize: 14, fontWeight: '800', letterSpacing: 1 },

  inputGroup: { marginBottom: 24 },
  label: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  input: {
    backgroundColor: '#020617', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, color: 'white', fontSize: 16, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  actionBtn: {
    backgroundColor: '#4FD1C7', borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  btnText: { color: '#020617', fontWeight: '900', fontSize: 13, letterSpacing: 1 },

  dangerBorder: { borderColor: 'rgba(239, 68, 68, 0.2)' },
  dangerIcon: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' },
  description: { color: '#64748B', fontSize: 13, marginBottom: 24, lineHeight: 20 },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerBtnText: { color: '#EF4444', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
});