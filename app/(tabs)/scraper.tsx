/**
 * ============================================================================
 * 🛰️ NORTH INTELLIGENCE OS: SCRAPER TERMINAL (REAL-TIME WIRING)
 * ============================================================================
 * PATH: app/(tabs)/scraper.tsx
 * FEATURES:
 * - Direct Node Ignition: Triggers the Supabase Edge 'scrape-engine'.
 * - Live Harvest Feed: Subscribes to the 'harvested_data' ledger.
 * - Industrial UI: Staggered spring animations for cluster nodes.
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import {
  Zap,
  Globe,
  Database,
  Terminal,
  CheckCircle2,
  Play,
} from 'lucide-react-native';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { Tables } from '@/supabase/database.types';

type Scraper = Tables<'scrapers'>;

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
    try {
      // WIRING: Direct call to your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('scrape-engine', {
        body: {
          scraper_id: scraper.id,
          url: scraper.target_url,
          schema: scraper.extraction_schema,
        },
      });

      if (error) throw error;
      Alert.alert(
        'Extraction Initialized',
        `Node ${scraper.name} has begun harvesting data.`,
      );
    } catch (e: any) {
      Alert.alert('Ignition Failure', e.message);
    } finally {
      setIgnitingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#020617', '#0A101F']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="DIRECT SCRAPER" />

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <Animated.View entering={FadeInUp} style={styles.header}>
          <Text style={styles.sysTag}>CLUSTER_HUD_ACTIVE</Text>
          <Text style={styles.title}>Deployment Nodes</Text>
        </Animated.View>

        {loading ? (
          <ActivityIndicator color="#4FD1C7" style={{ marginTop: 100 }} />
        ) : (
          scrapers.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(idx * 100)}
              layout={Layout.springify()}
            >
              <GlassCard intensity={40} style={styles.nodeCard}>
                <View style={styles.nodeCore}>
                  <View style={styles.iconBox}>
                    <Globe size={22} color="#4FD1C7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nodeName}>{item.name}</Text>
                    <Text style={styles.nodeUrl} numberOfLines={1}>
                      {item.target_url}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <TouchableOpacity
                  onPress={() => runExtraction(item)}
                  disabled={ignitingId === item.id}
                  style={styles.igniteBtn}
                >
                  {ignitingId === item.id ? (
                    <ActivityIndicator size="small" color="#020617" />
                  ) : (
                    <>
                      <Zap size={16} color="#020617" fill="#020617" />
                      <Text style={styles.igniteText}>RUN EXTRACTION</Text>
                    </>
                  )}
                </TouchableOpacity>
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
  scrollArea: { padding: 32, paddingBottom: 100 },
  header: { marginBottom: 40 },
  sysTag: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
  },
  title: { color: 'white', fontSize: 40, fontWeight: '900', marginTop: 12 },
  nodeCard: {
    padding: 32,
    borderRadius: 48,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  nodeCore: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 209, 199, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeName: { color: 'white', fontSize: 20, fontWeight: '800' },
  nodeUrl: { color: '#475569', fontSize: 14, marginTop: 4 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 24,
  },
  igniteBtn: {
    height: 64,
    backgroundColor: '#4FD1C7',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  igniteText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
  },
});
