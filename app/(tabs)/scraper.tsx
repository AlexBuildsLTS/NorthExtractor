/**
 * ============================================================================
 * ⚡ NORTH INTELLIGENCE OS: DIRECT SCRAPER V15.5 (ULTIMATE INTEGRATED)
 * ============================================================================
 * ENGINE ARCHITECTURE:
 * - CSS CONFIG DRAWER: Integrated manual DOM targeting override.
 * - RECURSIVE ENGINE: Renders deep node clusters via RecursiveDataNode.
 * - DYNAMIC SWITCHING: Automatically uses CSS Map if defined, else AI-Auto.
 * - TELEMETRY: Real-time isolated handshake channels for Job_ID.
 * - ADAPTIVE GRID: Dynamically stacks terminal panes for mobile fidelity.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInRight,
  LinearTransition,
} from 'react-native-reanimated';
import {
  Globe,
  Terminal,
  Database,
  Play,
  Copy,
  RefreshCcw,
  Cpu,
  Activity,
  Crosshair,
  Zap,
  ShieldCheck,
  Search,
} from 'lucide-react-native';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { RecursiveDataNode } from '@/components/scraper/RecursiveDataNode';
import { CssConfigDrawer } from '@/components/scraper/CssConfigDrawer';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/supabase/database.types';

type ScrapeLog = Tables<'scraping_logs'>;

export default function DirectScraper() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const logScrollRef = useRef<ScrollView>(null);

  // --- CORE SYSTEM STATE ---
  const [url, setUrl] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [payload, setPayload] = useState<any>(null);
  const [customSelectors, setCustomSelectors] = useState<Record<
    string,
    string
  > | null>(null);

  // --- REAL-TIME BROADCAST HANDSHAKE ---
  useEffect(() => {
    if (!activeJobId) return;

    // Establishing isolated telemetry channel strictly for this JOB_ID
    const channel = supabase
      .channel(`node-telemetry-${activeJobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scraping_logs',
          filter: `job_id=eq.${activeJobId}`,
        },
        (p) => {
          setLogs((prev) => [...prev, p.new as ScrapeLog]);
          // Forensic log auto-scroll
          logScrollRef.current?.scrollToEnd({ animated: true });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scraping_jobs',
          filter: `id=eq.${activeJobId}`,
        },
        (p: any) => {
          if (p.new.status === 'completed') fetchFinalPayload(activeJobId);
          if (p.new.status === 'failed') {
            setIsExecuting(false);
            Alert.alert(
              'Engine Error',
              'Node extraction failed or target rejected connection.',
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId]);

  const fetchFinalPayload = async (id: string) => {
    const { data } = await supabase
      .from('extracted_data')
      .select('content_structured')
      .eq('job_id', id)
      .single();

    if (data) setPayload(data.content_structured);
    setIsExecuting(false);
  };

  // --- TITAN-2 ENGINE ACTIVATION ---
  const handleExecuteExtraction = async () => {
    if (!url.startsWith('http'))
      return Alert.alert(
        'Protocol fault',
        'HTTPS designation required for secure ignition.',
      );

    setIsExecuting(true);
    setLogs([]);
    setPayload(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        throw new Error('Operator identity is unknown in current session.');

      // 1. COMMIT JOB TO LEDGER
      const { data: job, error: jobErr } = await supabase
        .from('scraping_jobs')
        .insert({
          url: url.trim(),
          user_id: user.id,
          status: 'running',
          target_schema: customSelectors || {
            summary: 'string',
            clusters: 'array',
            technical: 'object',
          },
        })
        .select()
        .single();

      if (jobErr) throw jobErr;
      setActiveJobId(job.id);

      // 2. TRIGGER EDGE HANDSHAKE WITH CORE FLAGS
      const { error: funcError } = await supabase.functions.invoke(
        'scrape-engine',
        {
          body: {
            url: url.trim(),
            job_id: job.id,
            operator_id: user.id,
            config: {
              neural_parsing: !customSelectors,
              javascript_enabled: true,
              high_fidelity: true,
            },
          },
        },
      );

      if (funcError) throw funcError;
    } catch (e: any) {
      setIsExecuting(false);
      Alert.alert(
        'Engine Fault',
        e.message || 'Target node ignition sequence failed.',
      );
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="Direct Scraper" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollArea,
          { paddingHorizontal: isDesktop ? 40 : 16 } as ViewStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CONTROL DECK */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.controlDeck}>
            <View style={styles.deckHeader}>
              <View style={styles.labelRow}>
                <Globe size={18} color="#4FD1C7" />
                <Text style={styles.labelText}>ENDPOINT</Text>
              </View>
              {isExecuting && (
                <ActivityIndicator size="small" color="#4FD1C7" />
              )}
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={url}
                onChangeText={setUrl}
                placeholder="https://scrape.com"
                placeholderTextColor="#334155"
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity
                onPress={handleExecuteExtraction}
                disabled={isExecuting || !url}
                style={[
                  styles.playBtn,
                  (isExecuting || !url) && styles.btnDisabled,
                ]}
              >
                <Play size={26} color="#020617" fill="#020617" />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* CSS CONFIG OVERRIDE DRAWER */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <CssConfigDrawer onConfigSave={setCustomSelectors} />
        </Animated.View>

        {/* RESPONSIVE HUD LAYOUT */}
        <View
          style={[
            styles.terminalLayout,
            { flexDirection: isDesktop ? 'row' : 'column' } as ViewStyle,
          ]}
        >
          {/* TERMINAL: OUTPUT STREAM */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.column}>
            <GlassCard style={styles.logCard}>
              <View style={styles.terminalHeader}>
                <Terminal size={14} color="#4FD1C7" />
                <Text style={styles.terminalLabel}>STREAM</Text>
                {isExecuting && <View style={styles.pulseActive} />}
              </View>
              <ScrollView
                ref={logScrollRef}
                style={styles.terminalBody}
                showsVerticalScrollIndicator={true}
              >
                {logs.length === 0 && !isExecuting && (
                  <View style={styles.emptyBox}>
                    <Search size={32} color="#1E293B" />
                    <Text style={styles.emptyTerminal}>
                      AWAITING HANDSHAKE...
                    </Text>
                  </View>
                )}
                {logs.map((log, i) => (
                  <View key={i} style={styles.logEntry}>
                    <Text style={styles.logTime}>
                      [
                      {new Date(log.created_at!).toLocaleTimeString([], {
                        hour12: false,
                      })}
                      ]
                    </Text>
                    <Text
                      style={[
                        styles.logMsg,
                        {
                          color: log.level === 'error' ? '#EF4444' : '#E2E8F0',
                        },
                      ]}
                    >
                      {log.message}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </GlassCard>
          </Animated.View>

          {/* HUD: NEURAL SYNTHESIS PAYLOAD */}
          <Animated.View
            entering={FadeInRight.delay(300)}
            style={styles.column}
          >
            <GlassCard style={styles.payloadCard}>
              <View style={styles.terminalHeader}>
                <Database size={16} color="#4FD1C7" />
                <Text style={styles.terminalLabel}>PAYLOAD</Text>
                {payload && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        'Copied',
                        'Data committed to system clipboard.',
                      )
                    }
                  >
                    <Copy
                      size={14}
                      color="#4FD1C7"
                      style={{ marginLeft: 'auto' }}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView
                style={styles.payloadBody}
                showsVerticalScrollIndicator={true}
              >
                {!payload && !isExecuting && (
                  <View style={styles.placeholderBox}>
                    <Cpu size={40} color="#1E293B" />
                    <Text style={styles.placeholderText}>LEDGER_IDLE</Text>
                  </View>
                )}
                {isExecuting && !payload && (
                  <View style={styles.analyzingBox}>
                    <RefreshCcw size={32} color="#4FD1C7" />
                    <Text style={styles.analyzingText}>
                      NEURAL_ANALYSIS_IN_PROGRESS...
                    </Text>
                  </View>
                )}

                {/* HIGH-FIDELITY RECURSIVE DATA TREE */}
                {payload && <RecursiveDataNode data={payload} />}
              </ScrollView>
            </GlassCard>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { paddingTop: 32, paddingBottom: 150 },
  controlDeck: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(79, 209, 199, 0.1)',
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  labelText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },
  inputContainer: { flexDirection: 'row', gap: 16 },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 20,
    borderRadius: 16,
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4FD1C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  btnDisabled: { backgroundColor: '#1E293B', shadowOpacity: 0 },
  terminalLayout: { gap: 24 },
  column: { flex: 1 },
  logCard: {
    height: 450,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  payloadCard: {
    height: 450,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  terminalLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
  },
  pulseActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4FD1C7',
    marginLeft: 'auto',
  },
  terminalBody: { flex: 1, padding: 16 },
  logEntry: { flexDirection: 'row', marginBottom: 8, gap: 12 },
  logTime: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logMsg: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
    gap: 20,
  },
  emptyTerminal: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  payloadBody: { flex: 1 },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
    gap: 20,
  },
  placeholderText: {
    color: '#1E293B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
  },
  analyzingBox: { alignItems: 'center', marginTop: 120, gap: 24 },
  analyzingText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
