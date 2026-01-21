/**
 * ============================================================================
 * 💠 NORTH INTELLIGENCE OS: SYSTEM LOGS (BENTO REDESIGN V3.0)
 * ============================================================================
 * PATH: app/(tabs)/logs.tsx
 * STATUS: PRODUCTION READY (Fixed TS Errors & Design Parity)
 * ============================================================================
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList, // Optimized for long lists
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView, // <--- FIXED: Added missing import
  useWindowDimensions,
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
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Code,
  Activity,
  Filter,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { supabase } from '@/lib/supabase';
import { MainHeader } from '@/components/ui/MainHeader';
import { Database } from '@/supabase/database.types';

type LogItem = Database['public']['Tables']['scraping_logs']['Row'];

const FILTER_TABS = ['ALL', 'ERROR', 'WARN', 'INFO'];

// ----------------------------------------------------------------------------
// 🧩 COMPONENT: BENTO LOG CARD (MATCHING INDEX.TSX STYLE)
// ----------------------------------------------------------------------------
const BentoLogCard = ({ item, index }: { item: LogItem; index: number }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const isError = item.level === 'error';
  const isWarn = item.level === 'warn';
  
  // Dynamic Styling based on Level
  const glowColor = isError ? '#EF4444' : isWarn ? '#F59E0B' : '#10B981';
  const Icon = isError ? AlertTriangle : isWarn ? Activity : CheckCircle2;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    glowOpacity.value = withTiming(0.4);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    glowOpacity.value = withTiming(0);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardInner}
      >
        {/* Animated Glow Background */}
        <Animated.View style={[styles.glow, { backgroundColor: glowColor }, glowStyle]} />
        
        {/* Glass Shine */}
        <LinearGradient
          colors={['rgba(255,255,255,0.03)', 'transparent'] as const}
          style={styles.glassShine}
        />

        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { borderColor: glowColor + '40', backgroundColor: glowColor + '10' }]}>
              <Icon size={14} color={glowColor} />
            </View>
            <Text style={[styles.levelText, { color: glowColor }]}>
              {item.level?.toUpperCase() || 'INFO'}
            </Text>
          </View>
          <View style={styles.timeBadge}>
            <Clock size={10} color="#64748B" />
            <Text style={styles.timeText}>
              {new Date(item.created_at || '').toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Message Body */}
        <Text style={styles.messageText}>{item.message}</Text>

        {/* Footer Metadata */}
        <View style={styles.cardFooter}>
          <View style={styles.metaBadge}>
            <Code size={10} color="#475569" />
            <Text style={styles.metaText}>ID: {item.id.slice(0, 8)}</Text>
          </View>
          {item.scraper_id && (
            <View style={styles.metaBadge}>
              <Terminal size={10} color="#475569" />
              <Text style={styles.metaText}>NODE: {item.scraper_id.slice(0, 6)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ----------------------------------------------------------------------------
// 🚀 MAIN LOGS SCREEN
// ----------------------------------------------------------------------------
export default function SystemLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // FETCH DATA
  const fetchLogs = useCallback(async () => {
    try {
      let query = supabase
        .from('scraping_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeFilter !== 'ALL') {
        query = query.eq('level', activeFilter.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Logs Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  // LIVE SUBSCRIPTION
  useEffect(() => {
    fetchLogs();
    
    const sub = supabase.channel('logs-feed-v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scraping_logs' }, (payload) => {
        const newLog = payload.new as LogItem;
        if (activeFilter === 'ALL' || newLog.level === activeFilter.toLowerCase()) {
          setLogs(prev => [newLog, ...prev]);
          if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [activeFilter, fetchLogs]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      {/* GLOBAL HEADER */}
      <MainHeader title="Neural Logs" />

      {/* BACKGROUND AMBIENCE */}
      <View style={styles.ambientContainer} pointerEvents="none">
        <LinearGradient colors={['#4f46e5', 'transparent'] as const} style={{ flex: 1 }} />
      </View>

      <View style={styles.content}>
        {/* FILTER BAR (Bento Style) */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => { setActiveFilter(tab); if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
                  style={[
                    styles.filterTab,
                    isActive && { backgroundColor: '#4FD1C7', borderColor: '#4FD1C7' }
                  ]}
                >
                  <Text style={[styles.filterText, isActive ? { color: '#020617' } : { color: '#64748B' }]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LOGS LIST */}
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <BentoLogCard item={item} index={index} />}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); fetchLogs(); }} 
              tintColor="#4FD1C7" 
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Terminal size={48} color="#1E293B" />
                <Text style={styles.emptyText}>NO SIGNALS DETECTED</Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

// ----------------------------------------------------------------------------
// 🎨 STYLES (Strict Match to Index.tsx)
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  ambientContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 500, opacity: 0.2 },
  content: { flex: 1 },
  
  // FILTERS
  filterContainer: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  filterTab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  filterText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // BENTO CARD STYLES
  cardWrapper: {
    marginBottom: 16,
  },
  cardInner: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0, zIndex: -1,
  },
  glassShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 80,
  },

  // CARD CONTENT
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { padding: 6, borderRadius: 8, borderWidth: 1 },
  levelText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.7 },
  timeText: { color: '#64748B', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '600' },
  
  messageText: { color: '#E2E8F0', fontSize: 13, lineHeight: 20, fontWeight: '500' },
  
  cardFooter: { flexDirection: 'row', gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaText: { color: '#64748B', fontSize: 9, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: '700' },

  // EMPTY STATE
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100, opacity: 0.5 },
  emptyText: { color: '#475569', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginTop: 16 },
});