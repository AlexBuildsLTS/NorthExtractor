/**
 * ============================================================================
 * 🔍 NORTH INTELLIGENCE OS: DATA INSPECTOR V9.0
 * ============================================================================
 * Path: app/details/[id].tsx
 * FEATURES:
 * - Real-time Data Synthesis: Fetches structured JSON from extracted_data.
 * - Double-Header Elimination: Explicit Stack.Screen override.
 * - Heuristic Detail View: Visualizes job status and node metadata.
 * - AAA UX: Interactive glassmorphism cards with spring physics.
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
  Download,
  Share2,
  Database,
  ShieldCheck,
  Clock,
  Globe,
  Code,
  FileJson,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

// --- TYPE DEFINITIONS ---
interface ExtractedPayload {
  id: string;
  job_id: string;
  content_structured: any;
  metadata: any;
  created_at: string;
}

interface JobDetails {
  id: string;
  url: string;
  status: string;
  target_schema: any;
}

export default function DataInspector() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobDetails | null>(null);
  const [dataPayloads, setDataPayloads] = useState<ExtractedPayload[]>([]);

  // --- DATA ORCHESTRATION ---
  const fetchNodeDetails = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Job Metadata
      const { data: jobData, error: jobError } = await supabase
        .from('scraping_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // 2. Fetch Extracted Content
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
    const rawJson = JSON.stringify(
      dataPayloads.map((d) => d.content_structured),
      null,
      2,
    );
    try {
      await Share.share({
        message: rawJson,
        title: `Export_Node_${id?.slice(0, 8)}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#020617] items-center justify-center">
        <ActivityIndicator color="#4FD1C7" size="large" />
        <Text className="text-[#4FD1C7] font-black mt-6 tracking-widest uppercase text-[10px]">
          Synchronizing Ledger...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* DISABLE SYSTEM HEADER */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* ENTERPRISE HEADER */}
      <MainHeader title="Data Inspector" />

      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* --- NODE IDENTITY CARD --- */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6 opacity-60"
          >
            <ArrowLeft size={16} color="white" />
            <Text className="text-white ml-2 font-bold uppercase text-[10px] tracking-widest">
              Return to Hub
            </Text>
          </TouchableOpacity>

          <GlassCard className="p-8 border-l-4 border-l-[#4FD1C7] mb-8">
            <View className="flex-row items-center mb-4">
              <Globe size={18} color="#4FD1C7" />
              <Text
                className="ml-3 text-lg font-black text-white"
                numberOfLines={1}
              >
                {job?.url.replace('https://', '')}
              </Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-row items-center px-3 py-1 border rounded-full bg-white/5 border-white/10">
                <ShieldCheck size={12} color="#4FD1C7" />
                <Text className="text-[#4FD1C7] text-[9px] font-black uppercase ml-2">
                  {job?.status}
                </Text>
              </View>
              <View className="flex-row items-center opacity-40">
                <Clock size={12} color="white" />
                <Text className="text-white text-[9px] font-bold ml-2 uppercase">
                  Node ID: {id?.toString().slice(0, 8)}
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* --- EXTRACTION TOOLBAR --- */}
        <View className="flex-row items-center justify-between px-2 mb-6">
          <View className="flex-row items-center">
            <Database size={14} color="#64748B" />
            <Text className="text-slate-500 font-black text-[10px] uppercase ml-3 tracking-[3px]">
              Captured Nodes ({dataPayloads.length})
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleExport}
            className="flex-row items-center bg-[#4FD1C7]/10 px-4 py-2 rounded-xl border border-[#4FD1C7]/20"
          >
            <Share2 size={14} color="#4FD1C7" />
            <Text className="text-[#4FD1C7] font-black text-[10px] uppercase ml-2">
              Export
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- PAYLOAD LIST --- */}
        {dataPayloads.length === 0 ? (
          <View className="items-center justify-center py-20 opacity-20">
            <FileJson size={48} color="#475569" />
            <Text className="text-white font-bold mt-4 uppercase text-[10px] tracking-widest">
              Awaiting First Commit
            </Text>
          </View>
        ) : (
          dataPayloads.map((payload, index) => (
            <Animated.View
              key={payload.id}
              entering={FadeInRight.delay(index * 100)}
              className="mb-6"
            >
              <GlassCard className="overflow-hidden border-white/5">
                <View className="flex-row items-center justify-between px-6 py-3 border-b bg-white/5 border-white/5">
                  <View className="flex-row items-center">
                    <Code size={12} color="#4FD1C7" />
                    <Text className="text-[#4FD1C7] font-mono text-[9px] font-black ml-2 uppercase">
                      JSON_COMMIT_{payload.id.slice(0, 6)}
                    </Text>
                  </View>
                  <Text className="text-slate-500 font-mono text-[9px]">
                    {new Date(payload.created_at).toLocaleTimeString()}
                  </Text>
                </View>

                <View className="p-6 bg-black/40">
                  {Object.entries(payload.content_structured || {}).map(
                    ([key, value]) => (
                      <View
                        key={key}
                        className="pb-4 mb-4 border-b border-white/5 last:border-0"
                      >
                        <Text className="text-[#4FD1C7] text-[8px] font-black uppercase tracking-widest mb-1">
                          {key}
                        </Text>
                        <Text className="text-sm font-bold leading-6 text-white">
                          {typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
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
});
