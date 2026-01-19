/**
 * ============================================================================
 * 📡 NORTH INTELLIGENCE OS: SYSTEM TERMINAL V17.5 (ELITE UNIFIED)
 * ============================================================================
 * ARCHITECTURE:
 * - GLOBAL TELEMETRY: Streams every 'scraping_logs' entry in real-time.
 * - ICON SYNTHESIS: 64px glow-boxes for system health.
 * - FORENSIC UX: Menlo/Monospace terminal stack with level-based tinting.
 * - TYPE-SAFE: 100% TS compliant with isolated handshake channels.
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Terminal,
  ShieldAlert,
  Cpu,
  Trash2,
  Activity,
} from 'lucide-react-native';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/supabase/database.types';

type ScrapeLog = Tables<'scraping_logs'>;

export default function SystemTerminal() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // --- TERMINAL STATE ---
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, errors: 0 });

  // --- REAL-TIME AUDIT STREAM ---
  const fetchLogs = useCallback(async () => {
    const { data } = await supabase
      .from('scraping_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setLogs(data);
      setStats({
        total: data.length,
        errors: data.filter((l) => l.level === 'error').length,
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('global-activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scraping_logs' },
        (payload) => {
          const newLog = payload.new as ScrapeLog;
          setLogs((prev) => [newLog, ...prev].slice(0, 100));
          setStats((s) => ({
            total: s.total + 1,
            errors: newLog.level === 'error' ? s.errors + 1 : s.errors,
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="System Activity" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollArea,
          { paddingHorizontal: isDesktop ? 64 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TELEMETRY METRICS */}
        <View
          style={[
            styles.topSection,
            { flexDirection: isDesktop ? 'row' : 'column' },
          ]}
        >
          <GlassCard style={styles.modernStatCard}>
            <View
              style={[
                styles.iconGlowBox,
                { backgroundColor: 'rgba(79, 209, 199, 0.08)' },
              ]}
            >
              <Cpu size={24} color="#4FD1C7" />
            </View>
            <View>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statSubtitle}>TOTAL HEARTBEATS                      </Text>
            </View>
          </GlassCard>

          <GlassCard style={styles.modernStatCard}>
            <View
              style={[
                styles.iconGlowBox,
                { backgroundColor: 'rgba(239, 68, 68, 0.08)' },
              ]}
            >
              <ShieldAlert size={24} color="#EF4444" />
            </View>
            <View>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                {stats.errors}
              </Text>
              <Text style={styles.statSubtitle}>CRITICAL FAULTS                            </Text>
            </View>
          </GlassCard>
        </View>

        {/* MASTER LOG FEED */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.terminalContainer}>
            <View style={styles.terminalHeader}>
              <View style={styles.headerTitleRow}>
                <Terminal size={18} color="#4FD1C7" />
                <Text style={styles.terminalTitle}>STREAM OUTPUT</Text>
              </View>
            </View>

            <View style={styles.terminalBody}>
              {isLoading ? (
                <View style={styles.centerBox}>
                  <ActivityIndicator color="#4FD1C7" />
                </View>
              ) : (
                logs.map((log, index) => (
                  <View key={log.id || index} style={styles.logRow}>
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
                ))
              )}
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { paddingTop: 48, paddingBottom: 150 },
  topSection: { gap: 24, marginBottom: 40 },
  modernStatCard: {
    flex: 1,
    padding: 28,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  iconGlowBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: { color: 'white', fontSize: 32, fontWeight: '900' },
  statSubtitle: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  terminalContainer: { borderRadius: 32, overflow: 'hidden', minHeight: 600 },
  terminalHeader: {
    flexDirection: 'row',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  terminalTitle: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
  },
  terminalBody: { flex: 1, padding: 24 },
  logRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  logTime: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logMsg: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 150,
  },
});
