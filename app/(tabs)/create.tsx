/**
 * NORTH INTELLIGENCE OS: DEPLOYMENT TERMINAL V7.0
 * Path: app/(tabs)/create.tsx
 * FEATURES:
 * - Dynamic Schema Mapping Engine
 * - Heuristic Node Validation
 * - High-Fidelity Glassmorphism V2.0
 * - Edge Function Lifecycle Management
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
} from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { Icons } from '@/components/ui/Icons';
import { Entrance } from '@/components/ui/Layouts';
import { SchemaBuilder, SchemaField } from '@/components/scraper/SchemaBuilder';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming,
  FadeInDown,
  Layout,
  ZoomIn
} from 'react-native-reanimated';

// --- CONFIGURATION ---
const THEME = {
  primary: '#4FD1C7', // North Teal
  obsidian: '#020617',
  danger: '#EF4444',
  border: 'rgba(255, 255, 255, 0.08)',
};

export default function DeploymentTerminal() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [fields, setFields] = useState<SchemaField[]>([
    { id: '1', label: 'Item Name', key: 'title' },
    { id: '2', label: 'Unit Price', key: 'price' },
  ]);

  // --- VALIDATION LOGIC ---
  const isUrlValid = useMemo(() => {
    return url.startsWith('http://') || url.startsWith('https://');
  }, [url]);

  const canDeploy = useMemo(() => {
    return isUrlValid && fields.length > 0 && !loading;
  }, [isUrlValid, fields, loading]);

  // --- CORE EXECUTION ---
  const handleNodeDeployment = useCallback(async () => {
    if (!isUrlValid) {
      return Alert.alert("Biometric Denied", "Target endpoint must use secure protocol (HTTP/HTTPS).");
    }

    setLoading(true);
    
    try {
      // 1. Establish Session Identity
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Operator identity not verified.");

      // 2. Map Semantic Schema
      const targetSchema = fields.reduce(
        (acc, curr) => ({ ...acc, [curr.key]: "string" }),
        {}
      );

      // 3. Register Node in Core Ledger
      const { data: job, error: dbError } = await supabase
        .from('scraping_jobs')
        .insert({
          user_id: user.id,
          url: url.trim(),
          status: 'running',
          target_schema: targetSchema,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 4. Trigger Titan-2 Heuristic Engine (Edge Function)
      const { data: funcResult, error: funcError } = await supabase.functions.invoke('scrape-engine', {
        body: { 
          url: url.trim(), 
          target_schema: targetSchema, 
          job_id: job.id,
          operator_id: user.id 
        },
      });

      if (funcError) throw funcError;

      // 5. Success Momentum
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error("[DEPLOYMENT_ERROR]", e.message);
      Alert.alert("Structural Failure", e.message || "The node failed to initialize.");
    } finally {
      setLoading(false);
    }
  }, [url, fields, isUrlValid, router]);

  return (
    <View style={styles.root}>
      <MainHeader title="Deploy Terminal" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          className="px-8 pt-10" 
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          {/* --- STEP 1: IDENTITY --- */}
          <Entrance delay={100}>
            <Text className="text-white text-6xl font-black tracking-tighter italic mb-4 uppercase">
              Deploy
            </Text>
            <View className="h-1 w-20 bg-[#4FD1C7] mb-12 rounded-full" />
          </Entrance>

          <Entrance delay={300}>
            <GlassCard className="mb-10 p-10 border-white/10 shadow-2xl">
              <View className="flex-row items-center justify-between mb-8">
                <View className="flex-row items-center">
                  <View className="bg-[#4FD1C7]/10 p-4 rounded-[20px]">
                    <Icons.Globe size={24} color={THEME.primary} />
                  </View>
                  <Text className="text-[#4FD1C7] font-black ml-4 text-xs tracking-[4px] uppercase">
                    Node Endpoint
                  </Text>
                </View>
                {isUrlValid && (
                  <Animated.View entering={ZoomIn}>
                    <Icons.Check size={20} color={THEME.primary} />
                  </Animated.View>
                )}
              </View>

              <TextInput
                className="bg-white/5 p-8 rounded-[32px] text-white border border-white/10 text-xl font-bold italic h-24"
                placeholder="https://terminal.target.com"
                placeholderTextColor="#334155"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              {!isUrlValid && url.length > 0 && (
                <Text className="text-red-400 text-[10px] font-bold mt-4 uppercase tracking-widest ml-4">
                  Protocol mismatch detected
                </Text>
              )}
            </GlassCard>
          </Entrance>

          {/* --- STEP 2: SCHEMA --- */}
          <Entrance delay={500}>
            <View className="mb-10">
              <View className="flex-row items-center mb-6 ml-4">
                <Icons.Layers size={18} color="#475569" />
                <Text className="text-slate-500 font-black text-xs tracking-[3px] uppercase ml-3">
                  Semantic Mapping
                </Text>
              </View>
              <SchemaBuilder fields={fields} onFieldsChange={setFields} />
            </View>
          </Entrance>

          {/* --- STEP 3: EXECUTION --- */}
          <Entrance delay={700}>
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={handleNodeDeployment}
                disabled={!canDeploy}
                activeOpacity={0.8}
                style={[
                  styles.deployBtn,
                  !canDeploy && styles.disabledBtn
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={THEME.obsidian} />
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-[#020617] font-black text-2xl mr-6 uppercase tracking-widest italic">
                      Initialize Node
                    </Text>
                    <View className="bg-[#020617]/10 p-3 rounded-full">
                      <Icons.Send size={28} color={THEME.obsidian} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center justify-center mt-12 opacity-30">
                <Icons.Shield size={14} color="#475569" />
                <Text className="text-[#475569] text-[9px] font-black tracking-[3px] ml-3 uppercase">
                  Titan-2 Encrypted Link Established
                </Text>
              </View>
            </View>
          </Entrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#020617' 
  },
  actionContainer: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  deployBtn: {
    height: 100, // ELITE RADIUS
    borderRadius: 50,
    backgroundColor: '#4FD1C7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4FD1C7',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  disabledBtn: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    opacity: 0.4,
  },
});