import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Globe, ArrowLeft, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MainHeader } from '@/components/ui/MainHeader';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ProxySettings() {
  const router = useRouter();
  const [proxy, setProxy] = useState({ host: '', port: '' });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0A101F', '#020617']} style={StyleSheet.absoluteFill} />
      <MainHeader title="Proxy Nodes" />

      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/settings')} style={styles.backBtn}>
          <ArrowLeft size={16} color="#4FD1C7" />
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>PROXY_HOST</Text>
          <TextInput 
            style={styles.input} 
            value={proxy.host} 
            onChangeText={(t) => setProxy({...proxy, host: t})}
            placeholder="proxy.example.com"
            placeholderTextColor="#334155"
          />
          
          <Text style={[styles.label, { marginTop: 24 }]}>PORT</Text>
          <TextInput 
            style={styles.input} 
            value={proxy.port} 
            onChangeText={(t) => setProxy({...proxy, port: t})}
            placeholder="8080"
            placeholderTextColor="#334155"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.saveBtn}>
            <LinearGradient colors={['#4FD1C7', '#38B2AC']} style={styles.saveGradient}>
              <Text style={styles.saveText}>DEPLOY_CONFIG</Text>
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  container: { padding: 32 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backText: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', marginLeft: 12 },
  card: { padding: 32, borderRadius: 32 },
  label: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 18, borderRadius: 16, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  saveBtn: { marginTop: 32, borderRadius: 20, overflow: 'hidden' },
  saveGradient: { paddingVertical: 20, alignItems: 'center' },
  saveText: { color: '#020617', fontWeight: '900', letterSpacing: 1 }
});