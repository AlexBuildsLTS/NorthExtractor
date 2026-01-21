/**
 * ============================================================================
 * 🛰️ NORTH INTELLIGENCE OS: BULK DISPATCHER (BENTO EDITION)
 * ============================================================================
 * PATH: app/(tabs)/bulk-dispatcher.tsx
 * STATUS: PRODUCTION READY
 * VISUALS: Matches Index/Scraper (Bento Grid / Deep Glass / Neon)
 * LOGIC: Syncs with public.dispatch_bulk_jobs RPC
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
  StatusBar,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Layers,
  Zap,
  Database,
  Terminal,
  Globe,
  List,
  CheckCircle2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MainHeader } from '@/components/ui/MainHeader';

// ----------------------------------------------------------------------------
// 🧩 BENTO CARD WRAPPER
// ----------------------------------------------------------------------------
const BentoWrapper = ({ children, index = 0, glowColor = '#06b6d4' }: any) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={styles.bentoCard}
    >
      <View style={[styles.glow, { backgroundColor: glowColor }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.03)', 'transparent'] as const}
        style={styles.glassShine}
      />
      {children}
    </Animated.View>
  );
};

export default function BulkDispatcher() {
  const { user } = useAuth();

  // STATE
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * CLUSTER IGNITION PROTOCOL
   */
  const handleBulkIgnition = async () => {
    if (!user) return Alert.alert('Security Fault', 'Operator unauthorized.');

    // 1. PARSE & VALIDATE
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http'));

    if (urls.length === 0) {
      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return Alert.alert('Protocol Fault', 'No valid HTTPS targets in buffer.');
    }

    setIsProcessing(true);
    if (Platform.OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // 2. RPC HANDSHAKE
      const { data, error } = await supabase.rpc('dispatch_bulk_jobs', {
        p_schema: { type: 'auto_semantic' }, // Default schema strategy
        p_urls: urls,
        p_user_id: user.id,
      });

      if (error) throw error;

      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Cluster Deployed',
        `Successfully ignited ${data} nodes. Telemetry streaming to Command Center.`,
      );
      setUrlInput('');
    } catch (e: any) {
      console.error('[TITAN-DISPATCH] Fault:', e.message);
      Alert.alert('Deployment Failure', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const nodeCount = urlInput
    .split('\n')
    .filter((l) => l.trim().startsWith('http')).length;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      <MainHeader title="Bulk Dispatcher" />

      {/* Ambient Glow */}
      <View style={styles.ambience} pointerEvents="none">
        <LinearGradient
          colors={['#a855f7', 'transparent'] as const}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. INPUT BUFFER CARD */}
        <BentoWrapper index={1} glowColor="#a855f7">
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderColor: 'rgba(168, 85, 247, 0.2)',
                },
              ]}
            >
              <List size={18} color="#A855F7" />
            </View>
            <Text style={styles.cardTitle}>TARGET BUFFER</Text>
          </View>

          <TextInput
            style={styles.textArea}
            placeholder={`https://endpoint-alpha.com\nhttps://endpoint-beta.com`}
            placeholderTextColor="#475569"
            multiline
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
            keyboardType="url"
            spellCheck={false}
          />

          <View style={styles.statFooter}>
            <View style={styles.statBadge}>
              <Database size={12} color="#4FD1C7" />
              <Text style={styles.statText}>NODES: {nodeCount}</Text>
            </View>
            {nodeCount > 0 && (
              <View
                style={[
                  styles.statBadge,
                  { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
                ]}
              >
                <CheckCircle2 size={12} color="#10B981" />
                <Text style={[styles.statText, { color: '#10B981' }]}>
                  VALID
                </Text>
              </View>
            )}
          </View>
        </BentoWrapper>

        {/* 2. EXECUTION CARD */}
        <BentoWrapper index={2} glowColor="#0ea5e9">
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  borderColor: 'rgba(14, 165, 233, 0.2)',
                },
              ]}
            >
              <Layers size={18} color="#0EA5E9" />
            </View>
            <Text style={styles.cardTitle}>DEPLOYMENT PROTOCOL</Text>
          </View>

          <Text style={styles.helperText}>
            Batch processing consumes high compute resources. Distributed
            proxies will rotate automatically for each target.
          </Text>

          <TouchableOpacity
            style={[
              styles.igniteBtn,
              (isProcessing || nodeCount === 0) && styles.disabledBtn,
            ]}
            onPress={handleBulkIgnition}
            disabled={isProcessing || nodeCount === 0}
          >
            {isProcessing ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Zap size={18} color="#020617" fill="#020617" />
                <Text style={styles.igniteText}>
                  IGNITE {nodeCount > 0 ? nodeCount : 'BATCH'} CLUSTER
                </Text>
              </>
            )}
          </TouchableOpacity>
        </BentoWrapper>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  ambience: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    opacity: 0.15,
  },
  scrollArea: { padding: 24, paddingBottom: 120 },

  // BENTO STYLES
  bentoCard: {
    marginBottom: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 24,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: -1,
  },
  glassShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },

  // HEADER
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // INPUT
  textArea: {
    minHeight: 200,
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderRadius: 16,
    padding: 20,
    color: '#E2E8F0',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    lineHeight: 22,
  },

  // FOOTER STATS
  statFooter: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(79, 209, 199, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // HELPER TEXT
  helperText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 24,
  },

  // BUTTON
  igniteBtn: {
    backgroundColor: '#4FD1C7',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  disabledBtn: { opacity: 0.5, backgroundColor: '#334155', shadowOpacity: 0 },
  igniteText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
});
