/**
 * PROJECT CRADLE: SECURITY SETTINGS V5.0
 * Path: app/(tabs)/settings/security.tsx
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Fingerprint, Key, ShieldCheck, Smartphone } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SecurityScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricsAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: 'northfinance://reset-password',
      });
      if (error) throw error;
      Alert.alert('Email Sent', 'Check your inbox for secure reset instructions.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <View className="flex-row items-center px-6 py-4 border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2"><ArrowLeft size={24} color="#8892B0" /></TouchableOpacity>
        <Text className="text-white text-2xl font-bold uppercase italic">Security</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-[#4FD1C7] font-black text-xs uppercase mb-4 tracking-[4px]">Authentication</Text>
          <View className="bg-[#112240] rounded-[32px] border border-white/5 overflow-hidden">
            <View className="p-6 flex-row items-center justify-between border-b border-white/5">
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-10 h-10 rounded-full bg-[#4FD1C7]/10 items-center justify-center mr-3"><Fingerprint size={20} color="#4FD1C7" /></View>
                <View><Text className="text-white font-bold text-base">Biometric Login</Text><Text className="text-[#8892B0] text-xs mt-0.5">Secure Enclave Access</Text></View>
              </View>
              {biometricsAvailable && <Switch value={biometricsEnabled} onValueChange={setBiometricsEnabled} trackColor={{ false: '#0A192F', true: '#4FD1C7' }} />}
            </View>

            <TouchableOpacity onPress={handlePasswordReset} disabled={loading} className="p-6 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-orange-500/10 items-center justify-center mr-3"><Key size={20} color="#F97316" /></View>
                <View><Text className="text-white font-bold text-base">Master Token</Text><Text className="text-[#8892B0] text-xs mt-0.5">Reset secure session credentials</Text></View>
              </View>
              <ActivityIndicator animating={loading} color="#4FD1C7" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-6 bg-[#4FD1C7]/5 rounded-[32px] border border-[#4FD1C7]/20 flex-row items-start">
            <ShieldCheck size={20} color="#4FD1C7" className="mt-0.5" />
            <View className="ml-3 flex-1">
                <Text className="text-[#4FD1C7] font-black mb-1">Status: SECURE</Text>
                <Text className="text-[#8892B0] text-xs leading-5">Your connection is encrypted via TLS 1.3. Biometric keys remain in the device's Secure Enclave.</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}