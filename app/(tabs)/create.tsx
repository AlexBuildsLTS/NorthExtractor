/**
 * ============================================================================
 * 🌐 NORTH INTELLIGENCE OS: CLOUD CRAWLER ARCHITECT V100.0
 * ============================================================================
 * PATH: app/(tabs)/create.tsx
 * PURPOSE: Provision and deploy autonomous extraction nodes.
 * STANDARDS:
 * - High-Fidelity UI: Glassmorphism inputs with Reanimated 4 transitions.
 * - Deep Ledger Integration: Direct commit to public.scrapers table.
 * - Type-Safe: Integrated with Database['public']['Tables']['scrapers'].
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  Globe,
  Terminal,
  Zap,
  Plus,
  Database,
  Cpu,
  ArrowRight,
} from 'lucide-react-native';

// INTERNAL INFRASTRUCTURE
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { SchemaBuilder } from '@/components/scraper/SchemaBuilder';
import { TablesInsert } from '@/supabase/database.types';

export default function CloudCrawlerArchitect() {
  const router = useRouter();
  const { user } = useAuth();

  // CORE STATE
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [schema, setSchema] = useState<Record<string, string>>({});
  const [isDeploying, setIsDeploying] = useState(false);

  /**
   * NODE DEPLOYMENT PROTOCOL
   * Validates input and commits the new scraper node to the PostgreSQL ledger.
   */
  const handleDeployNode = async () => {
    if (!name || !url) {
      return Alert.alert(
        'Handshake Refused',
        'Please provide node designation and target URL.',
      );
    }

    if (!url.startsWith('http')) {
      return Alert.alert(
        'Protocol Fault',
        'HTTPS designation required for secure ignition.',
      );
    }

    if (!user) return Alert.alert('Security Fault', 'Operator unauthorized.');

    setIsDeploying(true);

    try {
      const payload: TablesInsert<'scrapers'> = {
        name: name.trim(),
        target_url: url.trim(),
        extraction_schema: schema,
        user_id: user.id,
        status: 'active',
        engine_type: 'gemini-1.5-pro',
      };

      const { error } = await supabase.from('scrapers').insert(payload);

      if (error) throw error;

      Alert.alert(
        'Deployment Successful',
        `Node ${name} is now synchronized with the grid.`,
      );
      router.push('/(tabs)/');
    } catch (e: any) {
      console.error('[TITAN-CRAWLER] Deployment Fault:', e.message);
      Alert.alert('Deployment Failure', e.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="Cloud Crawler" />

      <ScrollView
        contentContainerStyle={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {/* DESIGNATION DECK */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          layout={Layout.springify()}
        >
          <GlassCard style={styles.card}>
            <View style={styles.labelRow}>
              <Cpu size={16} color="#4FD1C7" />
              <Text style={styles.labelText}>NODE DESIGNATION</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. TITAN-MARKET-ALPHA"
              placeholderTextColor="#334155"
              autoCapitalize="characters"
            />

            <View style={[styles.labelRow, { marginTop: 20 }]}>
              <Globe size={16} color="#4FD1C7" />
              <Text style={styles.labelText}>TARGET ENDPOINT</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={url}
              onChangeText={setUrl}
              placeholder="https://target-node.ext"
              placeholderTextColor="#334155"
              autoCapitalize="none"
              keyboardType="url"
            />
          </GlassCard>
        </Animated.View>

        {/* BLUEPRINT DECK */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          layout={Layout.springify()}
        >
          <GlassCard style={styles.card}>
            <View style={styles.labelRow}>
              <Database size={16} color="#A78BFA" />
              <Text style={[styles.labelText, { color: '#A78BFA' }]}>
                EXTRACTION BLUEPRINT
              </Text>
            </View>
            <SchemaBuilder onSchemaChange={setSchema} />
          </GlassCard>
        </Animated.View>

        {/* DEPLOYMENT ACTION */}
        <TouchableOpacity
          onPress={handleDeployNode}
          disabled={isDeploying}
          style={[styles.deployBtn, isDeploying && { opacity: 0.5 }]}
        >
          {isDeploying ? (
            <ActivityIndicator color="#020617" />
          ) : (
            <>
              <Zap size={20} color="#020617" fill="#020617" />
              <Text style={styles.deployText}>DEPLOY NODE</Text>
              <ArrowRight size={20} color="#020617" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { padding: 24, paddingBottom: 120 },
  card: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  labelText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  textInput: {
    backgroundColor: '#020617',
    padding: 20,
    borderRadius: 16,
    color: 'white',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  deployBtn: {
    backgroundColor: '#4FD1C7',
    height: 75,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  deployText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
