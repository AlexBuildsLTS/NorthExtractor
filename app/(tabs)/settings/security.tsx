/**
 * ============================================================================
 * 🔐 NORTH INTELLIGENCE OS: SECURITY VAULT V12.0
 * ============================================================================
 * FEATURES:
 * - ENCRYPTION ROTATION: Updates password hash in Supabase Auth.
 * - SESSION PURGE: Terminates active session nodes via AuthContext.
 * - AAA GEOMETRY: 32px hyper-rounded modules with status-reactive tinting.
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ShieldCheck, Lock, LogOut, Key, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// UI INTERNAL IMPORTS
import { MainHeader } from '@/components/ui/MainHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SecurityVault() {
  const router = useRouter();
  const { logout } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 8) {
      return Alert.alert("Security Fault", "Encryption key requires 8+ characters.");
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
        <TouchableOpacity onPress={() => router.replace('/(tabs)/settings')} style={styles.backBtn}>
          <ArrowLeft size={16} color="#4FD1C7" />
          <Text style={styles.backText}>RETURN_TO_VAULT</Text>
        </TouchableOpacity>

        <GlassCard style={styles.card}>
          <View style={styles.headerRow}>
            <Key size={20} color="#4FD1C7" />
            <Text style={styles.title}>ROTATION_LOGIC</Text>
          </View>
          
          <Text style={styles.label}>NEW_ENCRYPTION_KEY</Text>
          <View style={styles.inputWrapper}>
             <Lock size={18} color="#475569" />
             <TextInput
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••••••"
                placeholderTextColor="#334155"
              />
          </View>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={handlePasswordUpdate} 
            disabled={loading}
          >
            <LinearGradient colors={['#4FD1C7', '#38B2AC']} style={styles.btnGradient}>
              {loading ? <ActivityIndicator color="#020617" /> : (
                <>
                  <RefreshCw size={18} color="#020617" />
                  <Text style={styles.btnText}>ROTATE_SECURITY_HASH</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard style={[styles.card, styles.dangerCard]}>
          <View style={styles.headerRow}>
            <ShieldCheck size={20} color="#EF4444" />
            <Text style={[styles.title, { color: '#EF4444' }]}>SENSITIVE_ACTIONS</Text>
          </View>
          
          <Text style={styles.description}>
            Force immediate termination of current session node and purge local biometric cache.
          </Text>

          <TouchableOpacity style={styles.dangerBtn} onPress={logout}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.dangerBtnText}>TERMINATE_SESSION</Text>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { padding: 32, paddingBottom: 100 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backText: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', marginLeft: 12, letterSpacing: 2 },
  card: { padding: 32, borderRadius: 32, marginBottom: 24 },
  dangerCard: { borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderRadius: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 16 },
  title: { color: '#4FD1C7', fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  label: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 16, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', paddingHorizontal: 20, paddingVertical: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 24 },
  input: { flex: 1, marginLeft: 16, color: 'white', fontSize: 18, fontWeight: '600' },
  actionBtn: { borderRadius: 20, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 12 },
  btnText: { color: '#020617', fontWeight: '900', fontSize: 13, letterSpacing: 1.5 },
  description: { color: '#64748B', fontSize: 13, lineHeight: 22, marginBottom: 32 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  dangerBtnText: { color: '#EF4444', fontWeight: '900', fontSize: 13, letterSpacing: 1.5, marginLeft: 12 }
});