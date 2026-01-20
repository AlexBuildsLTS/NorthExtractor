/**
 * ============================================================================
 * 🧭 NORTH INTELLIGENCE OS: CLOUD CRAWLER V12.0 (ULTIMATE RESPONSIVE)
 * ============================================================================
 * FEATURES:
 * - MOBILE ADAPTIVE: Flex-wrap logic to prevent input squishing on small screens.
 * - HYPER-GLASS: 32px hyper-rounded geometry with high-intensity blur.
 * - TITAN HANDSHAKE: Direct invocation of 'scrape-engine' Edge Function.
 * - SCHEMA BUILDER: Aligned with the local SchemaBuilder.tsx component.
 * ============================================================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Globe, Zap, CheckCircle2, Cpu, ShieldAlert } from 'lucide-react-native';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { SchemaBuilder, SchemaField } from '@/components/scraper/SchemaBuilder';
import { supabase } from '@/lib/supabase';

export default function CloudCrawler() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isDesktop = width >= 1024;

  const [schemaMap, setSchemaMap] = useState<Record<string, string>>({
    title: 'string',
    price: 'string'
  });

  const initialFields: SchemaField[] = useMemo(() => [
    { id: '1', key: 'title', type: 'string', description: 'Primary heading' },
    { id: '2', key: 'price', type: 'string', description: 'Currency values' },
  ], []);

  const isUrlValid = useMemo(() => url.startsWith('http://') || url.startsWith('https://'), [url]);

  const handleDeployment = useCallback(async () => {
    if (!isUrlValid) return Alert.alert("Validation Fault", "Secure endpoint (HTTPS) required.");
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized Operator.");

      // 1. Register Node in Ledger
      const { data: job, error: dbError } = await supabase
        .from('scraping_jobs')
        .insert({
          user_id: user.id,
          url: url.trim(),
          status: 'pending',
          target_schema: schemaMap,
        })
        .select().single();

      if (dbError) throw dbError;

      // 2. Titan-2 Engine Activation
      const { error: funcError } = await supabase.functions.invoke('scrape-engine', {
        body: { 
          url: url.trim(), 
          target_schema: schemaMap, 
          job_id: job.id,
          operator_id: user.id 
        },
      });

      if (funcError) throw funcError;

      router.replace('/(tabs)/');
    } catch (e: any) {
      console.error("[CRAWLER_FAULT]", e.message);
      Alert.alert("Engine Failure", e.message || "Target node unreachable.");
    } finally {
      setLoading(false);
    }
  }, [url, schemaMap, isUrlValid, router]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0A101F', '#020617']} style={StyleSheet.absoluteFill} />
      <MainHeader title="Cloud Crawler" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: isDesktop ? 40 : 20 } as ViewStyle]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.pageTitle}>DEPLOY</Text>
            <View style={styles.accentBar} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)}>
            <GlassCard style={styles.inputCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconRow}>
                  <Globe size={18} color="#4FD1C7" />
                  <Text style={styles.cardLabel}>TARGET ENDPOINT</Text>
                </View>
                {isUrlValid && <Animated.View entering={ZoomIn}><CheckCircle2 size={16} color="#4FD1C7" /></Animated.View>}
              </View>

              <TextInput
                style={styles.textInput}
                placeholder="https://target-ledger.com"
                placeholderTextColor="#334155"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
             <SchemaBuilder initialFields={initialFields} onSchemaChange={setSchemaMap} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <TouchableOpacity
              onPress={handleDeployment}
              disabled={!isUrlValid || loading}
              activeOpacity={0.8}
              style={[styles.deployBtn, (!isUrlValid || loading) && styles.deployBtnDisabled]}
            >
              {loading ? <ActivityIndicator color="#020617" /> : (
                <View style={styles.btnContent}>
                  <Text style={styles.btnText}>INITIALIZE TITAN NODE</Text>
                  <Zap size={20} color="#020617" fill="#020617" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { paddingTop: 40, paddingBottom: 150 },
  pageTitle: { color: 'white', fontSize: 48, fontWeight: '900', fontStyle: 'italic', letterSpacing: -2 },
  accentBar: { height: 4, width: 60, backgroundColor: '#4FD1C7', borderRadius: 2, marginBottom: 40, marginTop: 8 },
  inputCard: { padding: 32, borderRadius: 32, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardLabel: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  textInput: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 20, color: 'white', fontSize: 18, fontWeight: '700', borderContents: 1, borderColor: 'rgba(255,255,255,0.08)' } as any,
  deployBtn: { height: 84, borderRadius: 32, backgroundColor: '#4FD1C7', shadowColor: '#4FD1C7', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10, marginTop: 20, overflow: 'hidden', justifyContent: 'center' },
  deployBtnDisabled: { backgroundColor: '#1E293B', shadowOpacity: 0 },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  btnText: { color: '#020617', fontSize: 16, fontWeight: '900', letterSpacing: 2, fontStyle: 'italic' },
});