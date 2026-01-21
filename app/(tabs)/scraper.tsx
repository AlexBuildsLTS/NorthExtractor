/**
 * ============================================================================
 * 🛰️ NORTH INTELLIGENCE OS: SCRAPER TERMINAL (BENTO EDITION)
 * ============================================================================
 * PATH: app/(tabs)/scraper.tsx
 * STATUS: PRODUCTION READY
 * VISUALS: Matches Index.tsx (Glows, Gradients, Spring Physics)
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Layout,
} from 'react-native-reanimated';
import {
  Zap,
  Globe,
  Database,
  Terminal,
  CheckCircle2,
  Play,
  Cpu,
  Server,
  Code,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MainHeader } from '@/components/ui/MainHeader';
import { Tables } from '@/supabase/database.types';

type Scraper = Tables<'scrapers'>;

// ----------------------------------------------------------------------------
// 🧩 BENTO CARD COMPONENT (Shared Architecture)
// ----------------------------------------------------------------------------
const ScraperCard = ({
  item,
  index,
  onRun,
  isRunning,
}: {
  item: Scraper;
  index: number;
  onRun: () => void;
  isRunning: boolean;
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    glowOpacity.value = withTiming(0.6);
    if (Platform.OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    glowOpacity.value = withTiming(0);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
      style={styles.cardWrapper}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {}} // Card press logic if needed
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.cardInner}
      >
        {/* Glow */}
        <Animated.View style={[styles.glow, glowStyle]} />
        <LinearGradient
          colors={['rgba(255,255,255,0.03)', 'transparent'] as const}
          style={styles.glassShine}
        />

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <Globe size={18} color="#4FD1C7" />
            </View>
            <View>
              <Text style={styles.nodeName}>{item.name}</Text>
              <Text style={styles.nodeUrl} numberOfLines={1}>
                {item.target_url}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              item.status === 'active'
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                item.status === 'active'
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                item.status === 'active'
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Schema Preview */}
        <View style={styles.schemaBox}>
          <Code size={12} color="#64748B" />
          <Text style={styles.schemaText} numberOfLines={1}>
            SCHEMA:{' '}
            {Object.keys(item.extraction_schema as object)
              .join(', ')
              .toUpperCase()}
          </Text>
        </View>

        {/* Action Bar */}
        <TouchableOpacity
          onPress={onRun}
          disabled={isRunning}
          style={[styles.actionBtn, isRunning && styles.disabledBtn]}
        >
          {isRunning ? (
            <ActivityIndicator color="#020617" size="small" />
          ) : (
            <>
              <Zap size={14} color="#020617" fill="#020617" />
              <Text style={styles.actionBtnText}>IGNITE NODE</Text>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ----------------------------------------------------------------------------
// 🚀 SCRAPER TERMINAL SCREEN
// ----------------------------------------------------------------------------
export default function ScraperTerminal() {
  const { user } = useAuth();
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [ignitingId, setIgnitingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScrapers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('scrapers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScrapers(data || []);
    } catch (e: any) {
      console.error('[TITAN-SCRAPER] Data Fault:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScrapers();
    const channel = supabase
      .channel('realtime-scrapers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scrapers' },
        fetchScrapers,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchScrapers]);

  const runExtraction = async (scraper: Scraper) => {
    setIgnitingId(scraper.id);
    if (Platform.OS !== 'web')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      // 1. Create Job Entry First
      const { data: job, error: jobError } = await supabase
        .from('scraping_jobs')
        .insert({
          url: scraper.target_url,
          status: 'pending',
          target_schema: scraper.extraction_schema,
          user_id: user?.id!,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // 2. Trigger Edge Function
      const { error: fnError } = await supabase.functions.invoke(
        'scrape-engine',
        {
          body: {
            job_id: job.id,
            scraper_id: scraper.id,
            url: scraper.target_url,
            target_schema: scraper.extraction_schema,
            operator_id: user?.id,
          },
        },
      );

      if (fnError) throw fnError;

      Alert.alert('Ignition Successful', `Node ${scraper.name} is harvesting.`);
      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Ignition Failure', e.message);
      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIgnitingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      <MainHeader title="Command Deck" />

      {/* Ambient Glow */}
      <View style={styles.ambience} pointerEvents="none">
        <LinearGradient
          colors={['#06b6d4', 'transparent'] as const}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        {/* Header Stats */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.statsRow}>
          <View style={styles.statBox}>
            <Server size={20} color="#4FD1C7" />
            <Text style={styles.statLabel}>NODES AVAILABLE</Text>
            <Text style={styles.statValue}>{scrapers.length}</Text>
          </View>
          <View
            style={[
              styles.statBox,
              {
                borderColor: '#A855F7',
                backgroundColor: 'rgba(168, 85, 247, 0.05)',
              },
            ]}
          >
            <Cpu size={20} color="#A855F7" />
            <Text style={[styles.statLabel, { color: '#A855F7' }]}>
              AI ENGINE
            </Text>
            <Text style={styles.statValue}>ONLINE</Text>
          </View>
        </Animated.View>

        {loading ? (
          <ActivityIndicator color="#4FD1C7" style={{ marginTop: 100 }} />
        ) : scrapers.length === 0 ? (
          <View style={styles.emptyState}>
            <Terminal size={48} color="#334155" />
            <Text style={styles.emptyText}>NO NODES PROVISIONED</Text>
          </View>
        ) : (
          scrapers.map((item, idx) => (
            <ScraperCard
              key={item.id}
              item={item}
              index={idx}
              onRun={() => runExtraction(item)}
              isRunning={ignitingId === item.id}
            />
          ))
        )}
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
    height: 400,
    opacity: 0.15,
  },
  scrollArea: { padding: 24, paddingBottom: 120 },

  // STATS
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4FD1C7',
    backgroundColor: 'rgba(79, 209, 199, 0.05)',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statValue: { color: 'white', fontSize: 24, fontWeight: '800' },

  // BENTO CARD
  cardWrapper: { marginBottom: 20 },
  cardInner: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#06b6d4',
    opacity: 0,
    zIndex: -1,
  },
  glassShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },

  // CARD CONTENT
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', gap: 16, flex: 1 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 209, 199, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 199, 0.2)',
  },
  nodeName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  nodeUrl: { color: '#64748B', fontSize: 12, marginTop: 4, maxWidth: 180 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  inactiveBadge: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: '#10B981' },
  inactiveDot: { backgroundColor: '#64748B' },
  statusText: { fontSize: 10, fontWeight: '900' },
  activeText: { color: '#10B981' },
  inactiveText: { color: '#64748B' },

  schemaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  schemaText: {
    color: '#64748B',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4FD1C7',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  disabledBtn: { opacity: 0.5 },
  actionBtnText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
  },

  emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.5 },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: 2,
  },
});
