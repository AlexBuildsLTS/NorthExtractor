/**
 * ============================================================================
 * 🛰️ NORTH INTELLIGENCE OS: WEBHOOK UPLINK (REAL-TIME DB)
 * ============================================================================
 * PATH: app/(tabs)/settings/webhooks.tsx
 * STATUS: PRODUCTION READY
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Bell, ArrowLeft, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function WebhookSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // FETCH CONFIG
  useEffect(() => {
    if (!user) return;
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setUrl(data.target_url);
        setIsActive(data.is_active || false);
      }
    };
    fetchConfig();
  }, [user]);

  // SAVE CONFIG
  const handleSave = async () => {
    if (!url.startsWith('http'))
      return Alert.alert('Invalid Protocol', 'HTTPS required.');
    setLoading(true);
    try {
      const { error } = await supabase.from('webhook_endpoints').upsert(
        {
          user_id: user?.id!,
          target_url: url,
          is_active: isActive,
        },
        { onConflict: 'user_id' },
      ); // Assuming 1 webhook per user for simplicity, or adjust schema constraint

      if (error) throw error;
      Alert.alert('Uplink Established', 'Webhook configuration synced.');
    } catch (e: any) {
      Alert.alert('Sync Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="Webhook Dispatch" />

      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={16} color="white" />
          <Text style={styles.backText}>RETURN</Text>
        </TouchableOpacity>

        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.bentoCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Bell size={18} color="#0EA5E9" />
            </View>
            <Text style={[styles.cardTitle, { color: '#0EA5E9' }]}>
              EVENT LISTENER
            </Text>
          </View>

          <Text style={styles.label}>TARGET ENDPOINT</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://api.your-server.com/listen"
            placeholderTextColor="#334155"
            autoCapitalize="none"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>ACTIVE STATUS</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#1e293b', true: 'rgba(14, 165, 233, 0.3)' }}
              thumbColor={isActive ? '#0EA5E9' : '#64748b'}
            />
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Zap size={16} color="#020617" fill="#020617" />
                <Text style={styles.saveText}>SYNC CONFIGURATION</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  container: { padding: 24 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  backText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 2,
  },

  bentoCard: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  label: {
    color: '#0EA5E9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#020617',
    padding: 18,
    borderRadius: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  switchLabel: { color: '#64748B', fontWeight: '900', fontSize: 12 },

  saveBtn: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  saveText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },
});
