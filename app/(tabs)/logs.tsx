/**
 * ============================================================================
 * 📊 APEXSCRAPE: SYSTEM TELEMETRY (LOGS) V100.0
 * ============================================================================
 * PATH: app/(tabs)/logs.tsx
 * ARCHITECTURE:
 * - Real-time Handshake: Subscribes to public.scraping_logs broadcasts.
 * - Trace Analysis: Detailed metadata inspection for failed nodes.
 * - Reactive Filtering: Switch between INFO, SUCCESS, and ERROR levels.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Terminal,
  Activity,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';
import { Tables } from '@/supabase/database.types';

type Log = Tables<'scraping_logs'>;

export default function LogsScreen() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'success'>('all');

  const fetchLogs = async () => {
    let query = supabase
      .from('scraping_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (filter === 'error') query = query.eq('level', 'error');
    if (filter === 'success') query = query.eq('level', 'success');

    const { data } = await query;
    setLogs(data || []);
  };

  useEffect(() => {
    fetchLogs();

    // Real-time listener for logs
    const channel = supabase
      .channel('logs-sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scraping_logs' },
        () => {
          fetchLogs();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const renderLevelIcon = (level: string | null) => {
    switch (level) {
      case 'error':
        return <AlertCircle size={14} color="#F43F5E" />;
      case 'success':
        return <CheckCircle2 size={14} color="#10B981" />;
      default:
        return <Info size={14} color="#4FD1C7" />;
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="System Telemetry" />

      {/* FILTER HUD */}
      <View style={styles.filterRow}>
        {(['all', 'success', 'error'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterBtn,
              filter === type && {
                backgroundColor: type === 'error' ? '#F43F5E30' : '#4FD1C730',
                borderColor: type === 'error' ? '#F43F5E' : '#4FD1C7',
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && {
                  color: type === 'error' ? '#F43F5E' : '#4FD1C7',
                },
              ]}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.clearLogsBtn} onPress={() => Alert.alert('Access Denied', 'This feature is restricted to admin operators.')}> 
        <Trash2 size={16} color="#EF4444" />
        <Text style={styles.clearLogsText}>CLEAR ALL LOGS</Text>
      </TouchableOpacity>
      {/* LOG GRID */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {logs.map((log) => (
          <GlassCard key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={styles.logTypeRow}>
                {renderLevelIcon(log.level)}
                <Text style={styles.logTime}>
                  [{new Date(log.created_at!).toLocaleTimeString()}]
                </Text>
              </View>
              <Text style={styles.nodeId} numberOfLines={1}>
                NODE: {log.job_id?.substring(0, 8) || 'SYSTEM'}
              </Text>
            </View>
            <Text style={styles.logMessage}>{log.message}</Text>
            {log.metadata && (
              <View style={styles.metaBox}>
                <Text style={styles.metaText}>
                  {JSON.stringify(log.metadata).substring(0, 100)}...
                </Text>
              </View>
            )}
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { padding: 20, paddingBottom: 100 },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logTime: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  nodeId: { color: '#334155', fontSize: 9, fontWeight: '700' },
  logMessage: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  metaBox: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#020617',
    borderRadius: 8,
  },
  metaText: {
    color: '#475569',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  clearLogsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  clearLogsText: { color: '#EF4444', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

});
