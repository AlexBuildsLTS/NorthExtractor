/**
 * ============================================================================
 * 🌐 NORTH INTELLIGENCE OS: PROXY GRID (REAL-TIME DB)
 * ============================================================================
 * PATH: app/(tabs)/settings/proxies.tsx
 * STATUS: PRODUCTION READY
 * FEATURES:
 * - CRUD Operations on public.proxy_nodes.
 * - Bento Grid List for proxies.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Globe,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Tables } from '@/supabase/database.types';

type ProxyNode = Tables<'proxy_nodes'>;

export default function ProxySettings() {
  const router = useRouter();
  const { user } = useAuth();
  const [proxies, setProxies] = useState<ProxyNode[]>([]);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [loading, setLoading] = useState(false);

  // FETCH PROXIES
  const fetchProxies = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('proxy_nodes')
      .select('*')
      .eq('user_id', user.id);
    if (!error && data) setProxies(data);
  };

  useEffect(() => {
    fetchProxies();
  }, [user]);

  // ADD PROXY
  const handleAddProxy = async () => {
    if (!host || !port)
      return Alert.alert('Missing Data', 'Host and Port required.');

    setLoading(true);
    try {
      const { error } = await supabase.from('proxy_nodes').insert({
        host,
        port: parseInt(port),
        user_id: user?.id!,
        protocol: 'http',
        status: 'active',
      });

      if (error) throw error;
      setHost('');
      setPort('');
      fetchProxies();
    } catch (e: any) {
      Alert.alert('Deployment Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  // REMOVE PROXY
  const handleDelete = async (id: string) => {
    await supabase.from('proxy_nodes').delete().eq('id', id);
    fetchProxies();
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="Proxy Nodes" />

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={16} color="white" />
          <Text style={styles.backText}>RETURN</Text>
        </TouchableOpacity>

        {/* INPUT CARD */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={styles.bentoCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Plus size={18} color="#A855F7" />
            </View>
            <Text style={[styles.cardTitle, { color: '#A855F7' }]}>
              PROVISION NEW NODE
            </Text>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <Text style={styles.label}>HOST IP</Text>
              <TextInput
                style={styles.input}
                value={host}
                onChangeText={setHost}
                placeholder="192.168.0.1"
                placeholderTextColor="#475569"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>PORT</Text>
              <TextInput
                style={styles.input}
                value={port}
                onChangeText={setPort}
                placeholder="8080"
                keyboardType="numeric"
                placeholderTextColor="#475569"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddProxy}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text style={styles.btnText}>DEPLOY NODE</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* PROXY LIST */}
        <Text style={styles.sectionTitle}>ACTIVE MESH ({proxies.length})</Text>
        {proxies.map((p, i) => (
          <Animated.View
            key={p.id}
            entering={FadeInDown.delay(200 + i * 50)}
            layout={Layout.springify()}
            style={styles.proxyItem}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <Globe size={18} color="#4FD1C7" />
              <View>
                <Text style={styles.proxyHost}>
                  {p.host}:{p.port}
                </Text>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#10B981',
                    }}
                  />
                  <Text style={styles.proxyStatus}>
                    {p.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(p.id)}
              style={styles.deleteBtn}
            >
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { padding: 24, paddingBottom: 100 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  backText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 2,
  },

  bentoCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 24,
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  label: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    color: 'white',
    fontFamily: 'monospace',
  },

  addBtn: {
    backgroundColor: '#A855F7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },

  sectionTitle: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
  },
  proxyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  proxyHost: { color: 'white', fontWeight: '700', fontFamily: 'monospace' },
  proxyStatus: { color: '#10B981', fontSize: 10, fontWeight: '900' },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
});
