/**
 * ============================================================================
 * 🧭 NORTH INTELLIGENCE OS: INTELLIGENCE HUB V17.5 (ELITE UNIFIED)
 * ============================================================================
 * ARCHITECTURE:
 * - SLEEK GEOMETRY: 32px hyper-rounded modules with 64px icon glow-boxes.
 * - ICON SYNTHESIS: High-fidelity tinted containers [image_246082.png].
 * - REAL-TIME_TELEMETRY: Live node counts and NEURAL_FLOW_SPECTRUM.
 * - GLOBAL_SEARCH: Scans synthesized JSON payloads for keywords.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  RefreshControl,
  Platform,
  ViewStyle,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import {
  Search,
  Cpu,
  Activity,
  Zap,
  ArrowRight,
  Globe,
  Database,
  RefreshCcw,
} from 'lucide-react-native';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

export default function IntelligenceHub() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // --- HUB STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [extractions, setExtractions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- DATA ACQUISITION & REAL-TIME PULSE ---
  const fetchGlobalIntel = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('extracted_data')
        .select(
          'id, created_at, content_structured, scraping_jobs(url, status)',
        )
        .order('created_at', { ascending: false });

      if (data) setExtractions(data);
    } catch (err) {
      console.error('[HUB_SYNC_FAULT]', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalIntel();
    const channel = supabase
      .channel('global-hub-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'extracted_data' },
        () => fetchGlobalIntel(),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'scraping_jobs' },
        () => fetchGlobalIntel(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGlobalIntel]);

  // --- ANALYTICS ---
  const stats = useMemo(
    () => ({
      total: extractions.length,
      active: extractions.filter((e) => e.scraping_jobs?.status === 'running')
        .length,
    }),
    [extractions],
  );

  const spectrumData = useMemo(() => {
    const segments = isDesktop ? 20 : 12;
    return Array.from({ length: segments }, (_, i) => {
      const count = extractions.filter((e) => {
        const diff =
          (Date.now() - new Date(e.created_at).getTime()) / (1000 * 60 * 60);
        return diff >= i && diff < i + 1;
      }).length;
      return {
        height: count === 0 ? 10 : Math.min(100, 20 + count * 15),
        isActive: i === 0,
      };
    }).reverse();
  }, [extractions, isDesktop]);

  const filteredExtractions = useMemo(() => {
    if (!searchQuery.trim()) return extractions;
    const query = searchQuery.toLowerCase();
    return extractions.filter((item) => {
      const payload = JSON.stringify(item.content_structured).toLowerCase();
      const url = item.scraping_jobs?.url?.toLowerCase() || '';
      return payload.includes(query) || url.includes(query);
    });
  }, [searchQuery, extractions]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="Intelligence Hub" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollArea,
          { paddingHorizontal: isDesktop ? 64 : 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchGlobalIntel}
            tintColor="#4FD1C7"
          />
        }
      >
        {/* SECTION 1: MODERN TELEMETRY HUD [image_246082.png] */}
        <View
          style={[
            styles.topSection,
            { flexDirection: isDesktop ? 'row' : 'column' },
          ]}
        >
          <View style={styles.statsColumn}>
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
                <Text style={styles.statSubtitle}>TOTAL</Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.modernStatCard}>
              <View
                style={[
                  styles.iconGlowBox,
                  { backgroundColor: 'rgba(59, 130, 246, 0.08)' },
                ]}
              >
                <Activity size={24} color="#3B82F6" />
              </View>
              <View>
                <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
                  {stats.active}
                </Text>
                <Text style={styles.statSubtitle}>ACTIVE SEQUENCE</Text>
              </View>
            </GlassCard>
          </View>

          <GlassCard style={styles.wideSpectrumCard}>
            <View style={styles.spectrumHeader}>
              <Text style={styles.spectrumTitle}>NEURAL FLOW   </Text>
              <View style={styles.liveTag}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <View style={styles.spectrumBody}>
              {spectrumData.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.spectrumBar,
                    {
                      height: `${d.height}%`,
                      backgroundColor: d.isActive
                        ? '#4FD1C7'
                        : 'rgba(255,255,255,0.05)',
                    },
                  ]}
                />
              ))}
            </View>
          </GlassCard>
        </View>

        {/* SECTION 2: SEARCH UNIT */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.modernSearch}>
            <Search size={20} color="#475569" />
            <TextInput
              style={styles.modernInput}
              placeholder="SEARCH"
              placeholderTextColor="#334155"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {isLoading && <ActivityIndicator size="small" color="#4FD1C7" />}
          </GlassCard>
        </Animated.View>

        {/* SECTION 3: INTELLIGENCE GRID */}
        <View style={styles.resultsGrid}>
          {filteredExtractions.length === 0 && !isLoading && (
            <View style={styles.emptyContainer}>
              <Database size={48} color="#1E293B" />
              <Text style={styles.emptyText}>NO_NODES_MATCH_QUERY</Text>
            </View>
          )}

          {filteredExtractions.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 40)}
              layout={LinearTransition}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(tabs)/scraper?jobId=${item.id}` as any)
                }
              >
                <GlassCard style={styles.resultItemCard}>
                  <View style={styles.resultHeader}>
                    <View style={styles.urlBox}>
                      <Globe size={12} color="#4FD1C7" />
                      <Text style={styles.urlLabel} numberOfLines={1}>
                        {item.scraping_jobs?.url.replace('https://', '')}
                      </Text>
                    </View>
                    <Text style={styles.timeStamp}>
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <Text style={styles.previewData} numberOfLines={3}>
                    {JSON.stringify(item.content_structured).replace(
                      /[{}"]/g,
                      ' ',
                    )}
                  </Text>
                  <View style={styles.cardActionRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>SYNTHESIZED</Text>
                    </View>
                    <ArrowRight size={16} color="#1E293B" />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { paddingTop: 48, paddingBottom: 150 },
  topSection: { gap: 24, marginBottom: 40 },
  statsColumn: { flex: 1, gap: 20 },
  modernStatCard: {
    padding: 28,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconGlowBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statSubtitle: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },
  wideSpectrumCard: {
    flex: 2,
    padding: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  spectrumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  spectrumTitle: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(79, 209, 199, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  livePulse: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4FD1C7',
  },
  liveText: { color: '#4FD1C7', fontSize: 9, fontWeight: '900' },
  spectrumBody: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  spectrumBar: { width: 7, borderRadius: 3.5 },
  modernSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 40,
    height: 75,
  },
  modernInput: {
    flex: 1,
    paddingLeft: 16,
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  resultsGrid: { gap: 20 },
  resultItemCard: { padding: 28, borderRadius: 32 },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(79, 209, 199, 0.05)',
    padding: 8,
    borderRadius: 10,
    maxWidth: '75%',
  },
  urlLabel: { color: '#4FD1C7', fontSize: 11, fontWeight: '800' },
  timeStamp: { color: '#334155', fontSize: 11, fontWeight: '700' },
  previewData: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  badgeText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyContainer: { alignItems: 'center', marginTop: 100, gap: 24 },
  emptyText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
