/**
 * ============================================================================
 * 🔍 NORTH INTELLIGENCE OS: DATA INSPECTOR V9.2 (FINAL FIX)
 * ============================================================================
 * Path: app/details/[id].tsx
 * STATUS: PRODUCTION READY
 * FIXES:
 * - Solved 'string | string[]' router parameter crash.
 * - Aligned State types 1:1 with Supabase 'database.types.ts'.
 * - Added 'MainHeader' for consistency if needed, or kept dedicated nav.
 * ============================================================================
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Share2,
  Database,
  ShieldCheck,
  Clock,
  Globe,
  Code,
  FileJson,
  AlertTriangle,
  Loader2,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader'; // Consistent Header
import { supabase } from '@/lib/supabase';
import { Database as DBTypes } from '@/supabase/database.types';

// --- STRICT TYPE DEFINITIONS FROM DB ---
type JobRow = DBTypes['public']['Tables']['scraping_jobs']['Row'];
type ExtractedRow = DBTypes['public']['Tables']['extracted_data']['Row'];

export default function DataInspector() {
  // 1. SAFE PARAMETER PARSING
  const params = useLocalSearchParams();
  const idRaw = params.id;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw; // Ensures 'id' is always a string

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // 2. STRICT DATABASE TYPING
  const [job, setJob] = useState<JobRow | null>(null);
  const [dataPayloads, setDataPayloads] = useState<ExtractedRow[]>([]);

  // --- DATA ORCHESTRATION ---
  const fetchNodeDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      // A. Fetch Job Metadata (Strictly Typed)
      const { data: jobData, error: jobError } = await supabase
        .from('scraping_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // B. Fetch Extracted Content
      const { data: extracted, error: extractedError } = await supabase
        .from('extracted_data')
        .select('*')
        .eq('job_id', id)
        .order('created_at', { ascending: false });

      if (extractedError) throw extractedError;
      setDataPayloads(extracted || []);

    } catch (err: any) {
      console.error('[INSPECTOR_FAULT]', err.message);
      Alert.alert('Structural Failure', 'Could not retrieve node data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNodeDetails();
  }, [fetchNodeDetails]);

  // --- ACTION HANDLERS ---
  const handleExport = async () => {
    if (dataPayloads.length === 0) {
      return Alert.alert('Export Failed', 'No data available to export.');
    }

    const rawJson = JSON.stringify(
      dataPayloads.map((d) => d.content_structured),
      null,
      2,
    );
    
    try {
      await Share.share({
        message: rawJson,
        title: `NORTH_EXPORT_${id?.slice(0, 8)}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // --- RENDER HELPERS ---
  const renderStatusBadge = (status: string | null) => {
    const s = status || 'UNKNOWN';
    let color = '#94A3B8'; // Slate
    let bg = 'rgba(148, 163, 184, 0.1)';
    let Icon = AlertTriangle;

    if (s === 'completed') {
      color = '#10B981'; // Emerald
      bg = 'rgba(16, 185, 129, 0.1)';
      Icon = ShieldCheck;
    } else if (s === 'failed') {
      color = '#EF4444'; // Red
      bg = 'rgba(239, 68, 68, 0.1)';
      Icon = AlertTriangle;
    } else if (s === 'running') {
      color = '#38BDF8'; // Sky
      bg = 'rgba(56, 189, 248, 0.1)';
      Icon = Loader2;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg, borderColor: color + '40' }]}>
        <Icon size={12} color={color} />
        <Text style={[styles.badgeText, { color }]}>{s.toUpperCase()}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color="#4FD1C7" size="large" />
        <Text style={styles.loadingText}>SYNCHRONIZING LEDGER...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* HEADER OVERRIDE */}
      <Stack.Screen options={{ headerShown: false }} />
      {/* We use MainHeader here for consistent Top Bar, even on details */}
      <MainHeader title="Data Inspector" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. NAVIGATION & IDENTITY */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.backText}>RETURN TO HUB</Text>
          </TouchableOpacity>

          <GlassCard style={styles.identityCard}>
            <View style={styles.urlRow}>
              <View style={styles.iconBox}>
                <Globe size={20} color="#4FD1C7" />
              </View>
              <Text style={styles.urlText} numberOfLines={1}>
                {job?.url?.replace(/(^\w+:|^)\/\//, '') || 'UNKNOWN_TARGET'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              {renderStatusBadge(job?.status || null)}
              
              <View style={styles.idBadge}>
                <Code size={12} color="rgba(255,255,255,0.4)" />
                <Text style={styles.idText}>
                  ID: {id?.slice(0, 8).toUpperCase()}
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* 2. TOOLBAR */}
        <View style={styles.toolbar}>
          <View style={styles.toolLeft}>
            <Database size={14} color="#64748B" />
            <Text style={styles.toolLabel}>CAPTURED NODES ({dataPayloads.length})</Text>
          </View>

          <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
            <Share2 size={14} color="#4FD1C7" />
            <Text style={styles.exportText}>EXPORT JSON</Text>
          </TouchableOpacity>
        </View>

        {/* 3. DATA PAYLOADS */}
        {dataPayloads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileJson size={48} color="#334155" />
            <Text style={styles.emptyTitle}>AWAITING DATA COMMIT</Text>
            <Text style={styles.emptySub}>No structured data has been harvested yet.</Text>
          </View>
        ) : (
          dataPayloads.map((payload, index) => (
            <Animated.View
              key={payload.id}
              entering={FadeInRight.delay(index * 100).springify()}
              style={{ marginBottom: 16 }}
            >
              <GlassCard style={styles.payloadCard}>
                <View style={styles.payloadHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Code size={12} color="#4FD1C7" />
                    <Text style={styles.commitLabel}>COMMIT_{payload.id.slice(0, 6)}</Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {payload.created_at ? new Date(payload.created_at).toLocaleTimeString() : '--:--'}
                  </Text>
                </View>

                <View style={styles.jsonContainer}>
                  {Object.entries((payload.content_structured as any) || {}).map(
                    ([key, value], i) => (
                      <View 
                        key={`${key}-${i}`} 
                        style={[
                          styles.jsonRow,
                          i === Object.keys(payload.content_structured as object).length - 1 && styles.lastRow
                        ]}
                      >
                        <Text style={styles.jsonKey}>{key}</Text>
                        <Text style={styles.jsonValue}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </GlassCard>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  centerContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#4FD1C7', marginTop: 16, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  
  // NAVIGATION
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, opacity: 0.8 },
  backText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginLeft: 8 },

  // IDENTITY CARD
  identityCard: { padding: 0, overflow: 'hidden', marginBottom: 32 },
  urlRow: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(79, 209, 199, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  urlText: { color: 'white', fontSize: 16, fontWeight: '800', flex: 1 },
  
  metaRow: { flexDirection: 'row', padding: 20, gap: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: '900', marginLeft: 6, letterSpacing: 0.5 },
  idBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  idText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', marginLeft: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  // TOOLBAR
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  toolLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolLabel: { color: '#64748B', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(79, 209, 199, 0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(79, 209, 199, 0.2)' },
  exportText: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', marginLeft: 6, letterSpacing: 0.5 },

  // PAYLOAD CARDS
  payloadCard: { padding: 0, overflow: 'hidden' },
  payloadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  commitLabel: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  timestamp: { color: '#64748B', fontSize: 10, fontWeight: '600' },
  jsonContainer: { padding: 20 },
  jsonRow: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16 },
  lastRow: { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 },
  jsonKey: { color: '#4FD1C7', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  jsonValue: { color: '#E2E8F0', fontSize: 13, lineHeight: 20, fontWeight: '500' },

  // EMPTY STATE
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, opacity: 0.5 },
  emptyTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '900', letterSpacing: 2, marginTop: 16 },
  emptySub: { color: '#64748B', fontSize: 11, marginTop: 4 },
});