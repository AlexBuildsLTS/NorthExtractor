/**
 * ============================================================================
 * 🖥️ NORTH INTELLIGENCE OS: SYSTEM TERMINAL V8.2
 * ============================================================================
 * Path: app/(tabs)/logs.tsx
 * FIXES:
 * - Resolved all missing React Native imports.
 * - Fixed JSX namespace collisions and Text component types.
 * - Standardized Reanimated 4 transitions.
 * ============================================================================
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { Stack } from 'expo-router';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  Wifi,
  Cpu
} from 'lucide-react-native';
import Animated, { FadeInLeft, LinearTransition } from 'react-native-reanimated';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

// --- TYPE DEFINITIONS ---
interface ScrapeLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  created_at: string;
  metadata?: any;
}

type LogFilter = 'all' | 'error' | 'success' | 'warn';

export default function LiveLogs() {
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [filter, setFilter] = useState<LogFilter>('all');
  const [isLive, setIsLive] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // --- REAL-TIME DATA STREAM ---
  const fetchRecentLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('scraping_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setLogs(data.reverse());
    if (error) console.error("[TERMINAL_INIT_ERROR]", error.message);
  }, []);

  useEffect(() => {
    fetchRecentLogs();

    const channel = supabase
      .channel('live-node-logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'scraping_logs' },
        (payload) => {
          if (isLive) {
            setLogs((prev) => {
              const newLogs = [...prev, payload.new as ScrapeLog];
              return newLogs.slice(-100); 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecentLogs, isLive]);

  const onContentSizeChange = () => {
    if (isLive && logs.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const renderLogItem = ({ item, index }: { item: ScrapeLog; index: number }) => {
    const themes = {
      info: { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.05)', icon: Clock },
      warn: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)', icon: Activity },
      error: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertCircle },
      success: { color: '#4FD1C7', bg: 'rgba(79, 209, 199, 0.1)', icon: ShieldCheck },
    };

    const style = themes[item.level] || themes.info;

    return (
      <Animated.View 
        entering={FadeInLeft.delay(index * 10)}
        layout={LinearTransition}
        style={[styles.logItem, { backgroundColor: style.bg }]}
      >
        <View style={styles.logIcon}>
          <style.icon size={10} color={style.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.logHeader}>
            <Text style={[styles.levelText, { color: style.color }]}>
              {item.level.toUpperCase()}
            </Text>
            <Text style={styles.timeText}>
              {new Date(item.created_at).toLocaleTimeString([], { hour12: false })}
            </Text>
          </View>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <MainHeader title="Live Terminal" />

      <View className="flex-1 px-6 pt-6">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row space-x-2">
            {(['all', 'success', 'error'] as LogFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full border ${filter === f ? 'bg-[#4FD1C7] border-[#4FD1C7]' : 'bg-white/5 border-white/10'}`}
              >
                <Text className={`text-[9px] font-black uppercase tracking-widest ${filter === f ? 'text-[#020617]' : 'text-slate-500'}`}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center space-x-3">
             <TouchableOpacity 
              onPress={() => setLogs([])}
              className="p-3 border bg-red-500/10 rounded-xl border-red-500/20"
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setIsLive(!isLive)}
              className={`px-4 py-2 flex-row items-center rounded-xl border ${isLive ? 'bg-[#4FD1C7]/10 border-[#4FD1C7]/20' : 'bg-white/5 border-white/10'}`}
            >
              <View className={`w-1.5 h-1.5 rounded-full mr-2 ${isLive ? 'bg-[#4FD1C7]' : 'bg-slate-500'}`} />
              <Text className={`text-[10px] font-black ${isLive ? 'text-[#4FD1C7]' : 'text-slate-500'}`}>
                {isLive ? 'LIVE' : 'PAUSED'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <GlassCard style={styles.consoleCard}>
          <View style={styles.consoleHeader}>
            <View className="flex-row items-center">
              <TerminalIcon size={12} color="#4FD1C7" />
              <Text style={styles.consoleTitle}>NODE_STREAM_V8.2</Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={filteredLogs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            onContentSizeChange={onContentSizeChange}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="items-center justify-center flex-1 py-40">
                <ActivityIndicator size="small" color="#4FD1C7" />
                <Text style={styles.emptyText}>INITIALIZING CORE BROADCAST...</Text>
              </View>
            }
          />
        </GlassCard>

        <View className="flex-row items-center justify-between px-2 py-6 opacity-30">
          <View className="flex-row items-center">
            <Cpu size={12} color="#475569" />
            <Text style={styles.footerMetric}>ENGINE: TITAN-2_HEURISTIC</Text>
          </View>
          <Text style={styles.footerMetric}>BUFFER: {logs.length}/100</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  consoleCard: { flex: 1, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.6)' },
  consoleHeader: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  consoleTitle: {
    color: '#4FD1C7',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.5,
    marginLeft: 8,
  },
  logItem: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
  logIcon: { marginRight: 12, marginTop: 4 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  levelText: { fontSize: 9, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  timeText: { fontSize: 9, color: '#334155', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  messageText: { color: '#CBD5E1', fontSize: 11, lineHeight: 18, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  emptyText: { color: '#1E293B', fontSize: 10, fontWeight: '900', marginTop: 16, letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  footerMetric: { color: '#475569', fontSize: 8, fontWeight: '900', letterSpacing: 1.5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginLeft: 6 }
});