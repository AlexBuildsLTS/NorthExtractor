/**
 * ============================================================================
 * 💠 NORTH INTELLIGENCE OS: COMMAND CENTER (DASHBOARD) V100.0
 * ============================================================================
 * PATH: app/(tabs)/index.tsx
 * ARCHITECTURE:
 * - REAL-TIME TELEMETRY: Live hooks into public.scraping_jobs and logs.
 * - TYPE-STRICT: Aligned with Database['public']['Tables'] and Enums.
 * - AAA+ UX: NativeWind + Reanimated 4 sequenced transitions.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  StyleSheet, useWindowDimensions, Platform, ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { 
  Cpu, Database, Activity, Zap, Layers, 
  ChevronRight, AlertCircle, CheckCircle2, Terminal
} from 'lucide-react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Tables } from '@/supabase/database.types';

type Job = Tables<'scraping_jobs'>;

export default function CommandCenter() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ nodes: 0, data: 0, faults: 0 });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  // --- CORE TELEMETRY HANDSHAKE ---
  const syncTelemetry = async () => {
    if (!user) return;
    try {
      // 1. Fetch Aggregated Metrics
      const [jobsRes, dataRes, faultsRes] = await Promise.all([
        supabase.from('scraping_jobs').select('*', { count: 'exact', head: true }),
        supabase.from('extracted_data').select('*', { count: 'exact', head: true }),
        supabase.from('scraping_logs').select('*', { count: 'exact', head: true }).eq('level', 'error')
      ]);

      setStats({
        nodes: jobsRes.count || 0,
        data: dataRes.count || 0,
        faults: faultsRes.count || 0
      });

      // 2. Fetch Recent Ledger Entries
      const { data: jobs } = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(isDesktop ? 10 : 5);

      setRecentJobs(jobs || []);
    } catch (e) {
      console.error('[TITAN-DB] Metrics Handshake Failed:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    syncTelemetry();

    // 3. Real-time Node Subscription
    const channel = supabase.channel('titan-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scraping_jobs' }, () => {
        syncTelemetry();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // --- UI RENDER COMPONENTS ---
  const MetricCard = ({ label, value, icon, color }: { label: string, value: number, icon: any, color: string }) => (
    <GlassCard style={[styles.statCard, { width: isDesktop ? '31%' : '100%' }]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>{icon}</View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    </GlassCard>
  );

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
      <MainHeader title="Command Center" />

      <ScrollView 
        contentContainerStyle={[styles.scrollArea, isDesktop && styles.desktopPadding]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); syncTelemetry(); }} tintColor="#4FD1C7" />
        }
      >
        {/* OPERATOR WELCOME */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.welcomeBox}>
          <Text style={styles.welcomeTag}>SYSTEM_ACTIVE</Text>
          <Text style={styles.operatorName}>OPERATOR: {user?.fullName || 'IDENTIFYING...'}</Text>
        </Animated.View>

        {/* METRICS HUD */}
        <View style={styles.metricsGrid}>
          <MetricCard label="ACTIVE_NODES" value={stats.nodes} icon={<Cpu size={20} color="#4FD1C7" />} color="#4FD1C7" />
          <MetricCard label="HARVESTED_DATA" value={stats.data} icon={<Database size={20} color="#A78BFA" />} color="#A78BFA" />
          <MetricCard label="SYSTEM_FAULTS" value={stats.faults} icon={<AlertCircle size={20} color="#F43F5E" />} color="#F43F5E" />
        </View>

        {/* ACTIONS & LEDGER */}
        <View style={[styles.mainLayout, { flexDirection: isDesktop ? 'row' : 'column' } as any]}>
          
          {/* RECENT ACTIVITY LEDGER */}
          <View style={[styles.ledgerSection, { flex: isDesktop ? 1.5 : 1 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RECENT TELEMETRY</Text>
              <TouchableOpacity onPress={() => router.push('/logs')}><Text style={styles.viewLink}>BROWSE ALL</Text></TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator color="#4FD1C7" style={{ marginTop: 50 }} />
            ) : recentJobs.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Terminal size={32} color="#1E293B" />
                <Text style={styles.emptyText}>NO NODES PROVISIONED</Text>
              </GlassCard>
            ) : (
              recentJobs.map((job, idx) => (
                <Animated.View key={job.id} entering={FadeInDown.delay(300 + idx * 50)} layout={Layout.springify()}>
                  <TouchableOpacity onPress={() => router.push(`/details/${job.id}`)}>
                    <GlassCard style={styles.jobItem}>
                      <View style={styles.jobCore}>
                        <Text style={styles.jobUrl} numberOfLines={1}>{job.url}</Text>
                        <Text style={styles.jobTime}>{new Date(job.created_at!).toLocaleTimeString()}</Text>
                      </View>
                      <View style={[styles.statusBadge, { 
                        backgroundColor: job.status === 'completed' ? '#065F4630' : job.status === 'failed' ? '#991B1B30' : '#1E293B' 
                      }]}>
                        <Text style={[styles.statusText, { 
                          color: job.status === 'completed' ? '#10B981' : job.status === 'failed' ? '#EF4444' : '#4FD1C7' 
                        }]}>{(job.status || 'PENDING').toUpperCase()}</Text>
                      </View>
                      <ChevronRight size={18} color="#334155" />
                    </GlassCard>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </View>

          {/* QUICK PROTOCOLS (Desktop Sidebar Style) */}
          {isDesktop && (
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>CORE_PROTOCOLS</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/scraper')}>
                <LinearGradient colors={['#4FD1C7', '#38B2AC']} style={styles.actionGradient}>
                  <Zap size={20} color="#020617" fill="#020617" />
                  <Text style={styles.actionText}>IGNITE NODE</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/bulk-dispatcher')}>
                <GlassCard style={styles.actionGlass}>
                  <Layers size={20} color="#4FD1C7" />
                  <Text style={styles.actionTextLight}>BULK CLUSTER</Text>
                </GlassCard>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { padding: 24, paddingBottom: 120 },
  desktopPadding: { paddingHorizontal: 64 },
  welcomeBox: { marginBottom: 40 },
  welcomeTag: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', letterSpacing: 4 },
  operatorName: { color: 'white', fontSize: 36, fontWeight: '800', marginTop: 8 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 48 },
  statCard: { padding: 24, borderRadius: 28, minHeight: 140, justifyContent: 'center' },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBox: { padding: 10, borderRadius: 14 },
  statLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  statValue: { color: 'white', fontSize: 32, fontWeight: '700' },
  mainLayout: { gap: 32 },
  ledgerSection: { gap: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 3, marginBottom: 10 },
  viewLink: { color: '#4FD1C7', fontSize: 11, fontWeight: '700' },
  jobItem: { padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  jobCore: { flex: 1, gap: 4 },
  jobUrl: { color: 'white', fontSize: 15, fontWeight: '700' },
  jobTime: { color: '#475569', fontSize: 10, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 15 },
  statusText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  quickActions: { width: 300, gap: 16 },
  actionBtn: { height: 70 },
  actionGradient: { flex: 1, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  actionGlass: { flex: 1, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
  actionText: { color: '#020617', fontWeight: '900', letterSpacing: 1 },
  actionTextLight: { color: 'white', fontWeight: '900', letterSpacing: 1 },
  emptyCard: { padding: 80, alignItems: 'center', gap: 20, borderRadius: 32 },
  emptyText: { color: '#1E293B', fontSize: 11, fontWeight: '900', letterSpacing: 2 }
});