/**
 * ============================================================================
 * 🛰️ NORTH INTELLIGENCE OS: BULK DISPATCHER HUD V120.0
 * ============================================================================
 * PATH: app/(tabs)/bulk-dispatcher.tsx
 * FEATURES:
 * - MASSIVE EXTRACTION: Provisions multiple data nodes in a single handshake.
 * - RPC INTEGRATION: Wires directly to public.dispatch_bulk_jobs.
 * - INDUSTRIAL UI: 48px radii and heavy-glass synthesis.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import {
  Layers,
  Zap,
  Database,
  Terminal,
  Globe,
  List,
} from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';

export default function BulkDispatcher() {
  const { user } = useAuth();

  // HUD STATE
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * CLUSTER IGNITION PROTOCOL
   * Parses text input and triggers the bulk dispatch RPC.
   */
  const handleBulkIgnition = async () => {
    if (!user) return Alert.alert('Security Fault', 'Operator unauthorized.');

    // 1. CLEANSE & VALIDATE NODES
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    if (urls.length === 0) {
      return Alert.alert(
        'Protocol Fault',
        'No valid target URLs detected in input buffer.',
      );
    }

    setIsProcessing(true);

    try {
      // 2. RPC HANDSHAKE: Call the bulk dispatch function in Supabase
      const { data, error } = await supabase.rpc('dispatch_bulk_jobs', {
        p_schema: { type: 'auto_semantic' }, // Default extraction logic
        p_urls: urls,
        p_user_id: user.id,
      });

      if (error) throw error;

      Alert.alert(
        'Cluster Deployed',
        `Successfully ignited ${data} nodes. Telemetry is now streaming to the Command Center.`,
      );
      setUrlInput('');
    } catch (e: any) {
      console.error('[TITAN-DISPATCH] Handshake Fault:', e.message);
      Alert.alert('Deployment Failure', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#010015']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="BULK DISPATCHER" />

      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* OPERATOR HEADER */}
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.header}
        >
          <Text style={styles.sysTag}>BATCH_IGNITION_ACTIVE</Text>
          <Text style={styles.title}>Cluster Logic</Text>
        </Animated.View>

        {/* URL BUFFER INPUT */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <GlassCard intensity={45} style={styles.inputCard}>
            <View style={styles.labelRow}>
              <List size={16} color="#4FD1C7" />
              <Text style={styles.labelText}>
                TARGET URL BUFFER (ONE PER LINE)
              </Text>
            </View>

            <TextInput
              style={styles.textArea}
              placeholder={`https://endpoint-alpha.com\nhttps://endpoint-beta.com`}
              placeholderTextColor="#334155"
              multiline
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              keyboardType="url"
              spellCheck={false}
            />

            <View style={styles.statFooter}>
              <Database size={12} color="#475569" />
              <Text style={styles.statText}>
                DETECTED_NODES:{' '}
                {
                  urlInput
                    .split('\n')
                    .filter((l) => l.trim().startsWith('http')).length
                }
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* EXECUTION NODE */}
        <TouchableOpacity
          style={[styles.igniteBtn, isProcessing && { opacity: 0.5 }]}
          onPress={handleBulkIgnition}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#020617" />
          ) : (
            <LinearGradient
              colors={['#4FD1C7', '#38B2AC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientInner}
            >
              <Zap size={20} color="#020617" fill="#020617" />
              <Text style={styles.igniteText}>IGNITE BATCH CLUSTER</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        <View style={styles.noticeBox}>
          <Terminal size={14} color="#1E293B" />
          <Text style={styles.noticeText}>
            Batch ignition consumes high compute resources. Distributed proxies
            will be rotated automatically.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { padding: 32, paddingBottom: 120 },
  header: { marginBottom: 48 },
  sysTag: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
  },
  title: { color: 'white', fontSize: 44, fontWeight: '900', marginTop: 12 },

  inputCard: {
    padding: 40,
    borderRadius: 48,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  labelText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  textArea: {
    minHeight: 280,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
    padding: 24,
    color: '#FFF',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },

  statFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    opacity: 0.6,
  },
  statText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  igniteBtn: { height: 84, borderRadius: 42, overflow: 'hidden' },
  gradientInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  igniteText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: 1,
  },

  noticeBox: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 16,
    paddingHorizontal: 20,
  },
  noticeText: {
    color: '#1E293B',
    fontSize: 11,
    lineHeight: 18,
    flex: 1,
    fontWeight: '700',
  },
});
