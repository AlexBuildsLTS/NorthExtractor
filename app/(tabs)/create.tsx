/**
 * ============================================================================
 * 💠 NORTH INTELLIGENCE OS: NODE ARCHITECT (BENTO EDITION)
 * ============================================================================
 * PATH: app/(tabs)/create.tsx
 * STATUS: PRODUCTION READY
 * DESIGN: 1:1 Match with Index (Bento Grid / Deep Glass / Neon)
 * LOGIC: Syncs with public.scrapers & public.scraping_jobs
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
  Switch,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  SlideInRight,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Globe,
  Zap,
  Plus,
  Trash2,
  Cpu,
  ArrowRight,
  Sparkles,
  Layers,
  Database as DbIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// INTERNAL INFRASTRUCTURE
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { MainHeader } from '@/components/ui/MainHeader';
import { TablesInsert } from '@/supabase/database.types';

// --- TYPES ---
interface SchemaField {
  id: string;
  key: string;
  description: string;
}

// ----------------------------------------------------------------------------
// 🧩 SHARED COMPONENT: BENTO FORM CARD (Matches Index.tsx)
// ----------------------------------------------------------------------------
interface BentoCardProps {
  children: React.ReactNode;
  index?: number;
  glowColor?: string;
  title?: string;
  icon?: any;
}

const BentoCard = ({
  children,
  index = 0,
  glowColor = '#06b6d4',
  title,
  icon: Icon,
}: BentoCardProps) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.bentoContainer}
    >
      {/* Background Glow */}
      <View style={[styles.glow, { backgroundColor: glowColor }]} />

      {/* Glass Gradient */}
      <LinearGradient
        colors={['rgba(255,255,255,0.03)', 'transparent'] as const}
        style={styles.glassShine}
      />

      {/* Header */}
      {title && (
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: `${glowColor}20`,
                borderColor: `${glowColor}40`,
              },
            ]}
          >
            {Icon && <Icon size={16} color={glowColor} />}
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      )}

      {children}
    </Animated.View>
  );
};

// ----------------------------------------------------------------------------
// 🚀 MAIN SCREEN
// ----------------------------------------------------------------------------
export default function CreateNodeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // STATE
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [runImmediately, setRunImmediately] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [fields, setFields] = useState<SchemaField[]>([
    {
      id: '1',
      key: 'product_name',
      description: 'The main title of the product',
    },
    { id: '2', key: 'price', description: 'Current price value' },
  ]);

  // ACTIONS
  const handleAddField = () => {
    setFields((p) => [
      ...p,
      { id: Date.now().toString(), key: '', description: '' },
    ]);
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  };

  const handleRemoveField = (id: string) => {
    setFields((p) => p.filter((f) => f.id !== id));
    if (Platform.OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFieldChange = (
    id: string,
    prop: keyof SchemaField,
    value: string,
  ) => {
    setFields((p) => p.map((f) => (f.id === id ? { ...f, [prop]: value } : f)));
  };

  const handleDeploy = async () => {
    if (!name.trim() || !url.trim())
      return Alert.alert('Missing Data', 'Designation and URL required.');
    if (!url.startsWith('http'))
      return Alert.alert('Protocol Error', 'HTTPS required.');
    if (!user) return;

    setIsDeploying(true);
    try {
      // 1. Build Schema
      const schemaJson: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.key) schemaJson[f.key] = f.description;
      });

      // 2. Insert Scraper (Definition)
      const { error: scraperError } = await supabase.from('scrapers').insert({
        name: name.trim(),
        target_url: url.trim(),
        extraction_schema: schemaJson,
        user_id: user.id,
        status: 'active',
        engine_type: 'gemini-1.5-pro',
      });

      if (scraperError) throw scraperError;

      // 3. (Optional) Run Job Immediately
      if (runImmediately) {
        await supabase.from('scraping_jobs').insert({
          url: url.trim(),
          status: 'pending',
          target_schema: schemaJson,
          user_id: user.id,
        });
      }

      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Node initialized and active.');
      router.push('/(tabs)/');
    } catch (e: any) {
      Alert.alert('Deployment Failed', e.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <MainHeader title="Architect" />

      {/* BACKGROUND AMBIENCE (Same as Index) */}
      <View style={styles.ambience} pointerEvents="none">
        <LinearGradient
          colors={['#4f46e5', 'transparent'] as const}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. IDENTITY CARD */}
        <BentoCard
          index={1}
          title="TARGET PARAMETERS"
          icon={Cpu}
          glowColor="#06b6d4"
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NODE DESIGNATION</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. MARKET-ALPHA-01"
              placeholderTextColor="#475569"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TARGET ENDPOINT</Text>
            <TextInput
              style={[styles.input, { color: '#60A5FA' }]}
              value={url}
              onChangeText={setUrl}
              placeholder="https://target.com/data"
              placeholderTextColor="#475569"
              autoCapitalize="none"
            />
          </View>
        </BentoCard>

        {/* 2. SCHEMA BUILDER */}
        <BentoCard
          index={2}
          title="NEURAL SCHEMA"
          icon={Sparkles}
          glowColor="#a855f7"
        >
          <Text style={styles.helper}>Define AI extraction points.</Text>

          <View style={{ gap: 12 }}>
            {fields.map((field, i) => (
              <Animated.View
                key={field.id}
                entering={SlideInRight.delay(i * 50)}
                layout={Layout.springify()}
                style={styles.fieldRow}
              >
                <View style={{ flex: 1, gap: 8 }}>
                  <TextInput
                    style={styles.schemaInputKey}
                    value={field.key}
                    onChangeText={(v) => handleFieldChange(field.id, 'key', v)}
                    placeholder="Key (e.g. price)"
                    placeholderTextColor="#475569"
                  />
                  <TextInput
                    style={styles.schemaInputDesc}
                    value={field.description}
                    onChangeText={(v) =>
                      handleFieldChange(field.id, 'description', v)
                    }
                    placeholder="Context for AI..."
                    placeholderTextColor="#475569"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveField(field.id)}
                  style={styles.deleteBtn}
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <TouchableOpacity onPress={handleAddField} style={styles.addBtn}>
            <Plus size={16} color="#A855F7" />
            <Text style={styles.addText}>ADD DATA POINT</Text>
          </TouchableOpacity>
        </BentoCard>

        {/* 3. CONFIGURATION */}
        <BentoCard
          index={3}
          title="DEPLOYMENT CONFIG"
          icon={Zap}
          glowColor="#F59E0B"
        >
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>IMMEDIATE IGNITION</Text>
              <Text style={styles.switchSub}>
                Dispatch crawler upon creation
              </Text>
            </View>
            <Switch
              value={runImmediately}
              onValueChange={setRunImmediately}
              trackColor={{ false: '#1e293b', true: 'rgba(245, 158, 11, 0.3)' }}
              thumbColor={runImmediately ? '#F59E0B' : '#64748b'}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={handleDeploy}
            disabled={isDeploying}
            style={[styles.deployBtn, isDeploying && { opacity: 0.5 }]}
          >
            {isDeploying ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Text style={styles.deployText}>INITIALIZE NODE</Text>
                <ArrowRight size={20} color="#020617" />
              </>
            )}
          </TouchableOpacity>
        </BentoCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ----------------------------------------------------------------------------
// 🎨 STYLES (Strictly Matched to Index.tsx)
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  ambience: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    opacity: 0.2,
  },
  scrollContent: { padding: 24, paddingBottom: 100 },

  // BENTO CARD STYLES
  bentoContainer: {
    marginBottom: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    overflow: 'hidden',
    padding: 24,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    zIndex: -1, // Subtle static glow or animated if needed
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // FORM ELEMENTS
  inputGroup: { marginBottom: 16 },
  label: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    color: 'white',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  helper: { color: '#94a3b8', fontSize: 12, marginBottom: 16 },

  // SCHEMA BUILDER
  fieldRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  schemaInputKey: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 12,
    padding: 12,
    color: '#D8B4FE',
    fontWeight: '700',
    fontSize: 12,
  },
  schemaInputDesc: {
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#94a3b8',
    fontSize: 12,
  },
  deleteBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  addBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  },
  addText: {
    color: '#D8B4FE',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },

  // SWITCH & DEPLOY
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  switchSub: { color: '#64748b', fontSize: 11, marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },

  deployBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  deployText: {
    color: '#020617',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
