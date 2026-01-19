/**
 * ============================================================================
 * 🧭 NORTH INTELLIGENCE OS: DEPLOYMENT TERMINAL V8.0
 * ============================================================================
 * Features:
 * - Dynamic Schema Mapping: Aligned with SchemaBuilder.tsx types.
 * - Double-Header Elimination: Explicit Stack.Screen override.
 * - Titan-2 Heuristic Engine: Wired to Supabase Edge Functions.
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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { Icons } from '@/components/ui/Icons';
import { SchemaBuilder, SchemaField } from '@/components/scraper/SchemaBuilder';
import { supabase } from '@/lib/supabase';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

const THEME = {
  primary: '#4FD1C7',
  obsidian: '#020617',
  danger: '#EF4444',
  border: 'rgba(255, 255, 255, 0.08)',
};

export default function DeploymentTerminal() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const [schemaMap, setSchemaMap] = useState<Record<string, string>>({
    title: 'string',
    price: 'string',
  });

  const initialFields: SchemaField[] = useMemo(
    () => [
      {
        id: '1',
        key: 'title',
        type: 'string',
        description: 'Main content title',
      },
      {
        id: '2',
        key: 'price',
        type: 'string',
        description: 'Numerical price value',
      },
    ],
    [],
  );

  const isUrlValid = useMemo(() => {
    return url.startsWith('http://') || url.startsWith('https://');
  }, [url]);

  const canDeploy = useMemo(() => {
    return isUrlValid && Object.keys(schemaMap).length > 0 && !loading;
  }, [isUrlValid, schemaMap, loading]);

  const handleNodeDeployment = useCallback(async () => {
    if (!isUrlValid) {
      return Alert.alert(
        'Biometric Denied',
        'Target endpoint must use secure protocol.',
      );
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Operator identity not verified.');

      const { data: job, error: dbError } = await supabase
        .from('scraping_jobs')
        .insert({
          user_id: user.id,
          url: url.trim(),
          status: 'pending',
          target_schema: schemaMap,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      await supabase.from('scraping_logs').insert({
        job_id: job.id,
        user_id: user.id,
        level: 'info',
        message: `Node initialized for: ${url.trim()}`,
        metadata: { schema: schemaMap },
      });

      const { error: funcError } = await supabase.functions.invoke(
        'scrape-engine',
        {
          body: {
            url: url.trim(),
            target_schema: schemaMap,
            job_id: job.id,
            operator_id: user.id,
          },
        },
      );

      if (funcError) throw funcError;

      router.replace('/(tabs)');
    } catch (e: any) {
      console.error('[DEPLOYMENT_ERROR]', e.message);
      Alert.alert(
        'Structural Failure',
        e.message || 'The node failed to initialize.',
      );
    } finally {
      setLoading(false);
    }
  }, [url, schemaMap, isUrlValid, router]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <MainHeader title="Deploy Terminal" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="px-8 pt-6"
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text className="mb-2 text-5xl italic font-black tracking-tighter text-white uppercase">
              Deploy
            </Text>
            <View className="h-1 w-16 bg-[#4FD1C7] mb-8 rounded-full" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)}>
            <GlassCard className="p-8 mb-8 border-white/5">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <View className="bg-[#4FD1C7]/10 p-3 rounded-xl">
                    <Icons.Globe size={20} color={THEME.primary} />
                  </View>
                  <Text className="text-[#4FD1C7] font-black ml-3 text-[10px] tracking-[3px] uppercase">
                    Target Endpoint
                  </Text>
                </View>
                {isUrlValid && (
                  <Animated.View entering={ZoomIn}>
                    <Icons.Check size={18} color={THEME.primary} />
                  </Animated.View>
                )}
              </View>

              <TextInput
                className="p-6 text-lg italic font-bold text-white border bg-white/5 rounded-2xl border-white/10"
                placeholder="https://target-server.com"
                placeholderTextColor="#334155"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)}>
            <SchemaBuilder
              initialFields={initialFields}
              onSchemaChange={setSchemaMap}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={handleNodeDeployment}
                disabled={!canDeploy}
                activeOpacity={0.8}
                style={[styles.deployBtn, !canDeploy && styles.disabledBtn]}
              >
                {loading ? (
                  <ActivityIndicator color={THEME.obsidian} />
                ) : (
                  <View className="flex-row items-center">
                    <Text className="text-[#020617] font-black text-xl mr-4 uppercase tracking-widest italic">
                      Initialize Node
                    </Text>
                    <Icons.Zap
                      size={24}
                      color={THEME.obsidian}
                      fill={THEME.obsidian}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  actionContainer: { marginTop: 10, paddingHorizontal: 2 },
  deployBtn: {
    height: 80,
    borderRadius: 24,
    backgroundColor: '#4FD1C7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  disabledBtn: {
    backgroundColor: '#1E293B',
    opacity: 0.3,
  },
});
