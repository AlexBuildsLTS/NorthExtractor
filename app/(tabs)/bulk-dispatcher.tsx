/**
 * ============================================================================
 * 🚄 NORTH INTELLIGENCE OS: GLOBAL BULK DISPATCHER V16.0
 * ============================================================================
 * ORCHESTRATION ARCHITECTURE:
 * - CONCURRENCY_LOCK: Processes URLs in sequential batches to prevent timeouts.
 * - REAL-TIME_MATRIX: Live success/fail telemetry across the entire batch.
 * - AUTO_SANITY: Strips whitespace and validates protocol prefixes instantly.
 * - LEDGER_SYNC: Every node ignition creates a unique entry in the job ledger.
 * ============================================================================
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import {
  Zap,
  Globe,
  Database,
  Play,
  Layers,
  Cpu,
  List,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Activity,
} from 'lucide-react-native';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

export default function BulkDispatcher() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // --- ORCHESTRATION STATE ---
  const [rawInput, setRawInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
  });

  // --- AUTOMATIC SANITIZATION ENGINE ---
  const sanitizedNodes = useMemo(() => {
    return rawInput
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.startsWith('http'));
  }, [rawInput]);

  // --- BATCH IGNITION SEQUENCE ---
  const activateBatchIgnition = async () => {
    if (sanitizedNodes.length === 0) {
      return Alert.alert(
        'Buffer Empty',
        'No valid HTTPS designations detected in ingestion buffer.',
      );
    }

    setIsProcessing(true);
    setCurrentProgress({
      total: sanitizedNodes.length,
      processed: 0,
      success: 0,
      failed: 0,
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Operator identity is unknown.');

      // SEQUENTIAL BATCH CONTROLLER
      // We process one by one with a delay to respect DOM rate-limits
      for (let i = 0; i < sanitizedNodes.length; i++) {
        const targetUrl = sanitizedNodes[i];

        try {
          // 1. Commit Node to Job Ledger
          const { data: job, error: jobErr } = await supabase
            .from('scraping_jobs')
            .insert({
              url: targetUrl,
              user_id: user.id,
              status: 'running',
              target_schema: { type: 'bulk_auto_detect' },
            })
            .select()
            .single();

          if (jobErr) throw jobErr;

          // 2. Handshake with Titan-2 Edge Core
          const { error: coreErr } = await supabase.functions.invoke(
            'scrape-engine',
            {
              body: {
                url: targetUrl,
                job_id: job.id,
                operator_id: user.id,
                config: { neural_parsing: true, bulk_mode: true },
              },
            },
          );

          if (coreErr) throw coreErr;

          setCurrentProgress((p) => ({
            ...p,
            processed: i + 1,
            success: p.success + 1,
          }));
        } catch (err) {
          console.error(`Node Ignition Failure [${targetUrl}]:`, err);
          setCurrentProgress((p) => ({
            ...p,
            processed: i + 1,
            failed: p.failed + 1,
          }));
        }

        // THROTTLING HANDSHAKE
        // Prevents IP blacklisting and CPU spikes
        await new Promise((res) => setTimeout(res, 1200));
      }

      Alert.alert(
        'Operation Complete',
        `Successfully processed ${currentProgress.success} nodes.`,
      );
    } catch (e: any) {
      Alert.alert('Batch Fault', e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearBuffer = () => {
    setRawInput('');
    setCurrentProgress({ total: 0, processed: 0, success: 0, failed: 0 });
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="Bulk Dispatcher" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollArea,
          { paddingHorizontal: isDesktop ? 40 : 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* INGESTION UNIT */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.ingestionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.labelRow}>
                <Layers size={18} color="#4FD1C7" />
                <Text style={styles.labelText}>BULK BUFFER</Text>
              </View>
              <TouchableOpacity onPress={clearBuffer}>
                <Trash2 size={16} color="#475569" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.textArea}
              multiline
              value={rawInput}
              onChangeText={setRawInput}
              placeholder="Paste target list (one URL per line)..."
              placeholderTextColor="#334155"
              editable={!isProcessing}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity
              onPress={activateBatchIgnition}
              disabled={isProcessing || sanitizedNodes.length === 0}
              style={[
                styles.ignitionBtn,
                (isProcessing || sanitizedNodes.length === 0) &&
                  styles.btnDisabled,
              ]}
            >
              <LinearGradient
                colors={['#4FD1C7', '#38B2AC']}
                style={styles.btnGradient}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#020617" />
                ) : (
                  <>
                    <Zap size={20} color="#020617" fill="#020617" />
                    <Text style={styles.btnText}>
                      IGNITE {sanitizedNodes.length} NODES
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* PROGRESS MATRIX */}
        {(isProcessing || currentProgress.processed > 0) && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <GlassCard style={styles.matrixCard}>
              <View style={styles.matrixHeader}>
                <Cpu size={16} color="#4FD1C7" />
                <Text style={styles.matrixLabel}>BATCH_TELEMETRY_MATRIX</Text>
                {isProcessing && (
                  <Activity
                    size={14}
                    color="#4FD1C7"
                    style={{ marginLeft: 'auto' }}
                  />
                )}
              </View>

              <View style={styles.matrixGrid}>
                <View style={styles.matrixItem}>
                  <Text style={styles.matrixValue}>
                    {currentProgress.processed}/{currentProgress.total}
                  </Text>
                  <Text style={styles.matrixKey}>SEQUENCED</Text>
                </View>
                <View style={styles.matrixItem}>
                  <Text style={[styles.matrixValue, { color: '#4FD1C7' }]}>
                    {currentProgress.success}
                  </Text>
                  <Text style={styles.matrixKey}>COMMITTED</Text>
                </View>
                <View style={styles.matrixItem}>
                  <Text style={[styles.matrixValue, { color: '#EF4444' }]}>
                    {currentProgress.failed}
                  </Text>
                  <Text style={styles.matrixKey}>FAULTED</Text>
                </View>
              </View>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(currentProgress.processed / currentProgress.total) * 100}%`,
                    },
                  ]}
                />
              </View>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { paddingTop: 32, paddingBottom: 150 },
  ingestionCard: { padding: 32, borderRadius: 32, marginBottom: 32 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  labelText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },
  textArea: {
    height: 350,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 24,
    borderRadius: 20,
    color: 'white',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    textAlignVertical: 'top',
  },
  ignitionBtn: {
    marginTop: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    gap: 12,
  },
  btnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 2,
  },
  btnDisabled: { opacity: 0.4 },
  matrixCard: { padding: 32, borderRadius: 32 },
  matrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  matrixLabel: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
  },
  matrixGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  matrixItem: { alignItems: 'center' },
  matrixValue: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  matrixKey: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },
  barContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#4FD1C7' },
});
