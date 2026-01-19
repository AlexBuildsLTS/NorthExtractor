import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Zap,
  Database,
  LayoutDashboard,
  TrendingUp,
  Search,
  Plus,
  Activity,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  LinearTransition,
} from 'react-native-reanimated';

// UI Components
import { AAAWrapper } from '@/components/ui/AAAWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

/**
 * APEXSCRAPE INTELLIGENCE HUB
 * * Features:
 * 1. Real-time Persistence: Subscribes to 'scrapers' table for instant UI updates.
 * 2. AAA UX: Staggered glassmorphism entrances via Reanimated 4.
 * 3. Session Control: Restored MainHeader for Profile/Logout access.
 * 4. Data Integrity: Fetches counts from harvested_data via Supabase joins.
 */

export default function Dashboard() {
  const router = useRouter();
  const [scrapers, setScrapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- DATA ORCHESTRATION ---

  const fetchIntelligence = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('scrapers')
        .select(
          `
          *,
          harvested_data (id)
        `,
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScrapers(data || []);
    } catch (err) {
      console.error('[Hub Error]:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchIntelligence();

    // REAL-TIME SYNC: Listen for new scrapers or status changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scrapers' },
        () => fetchIntelligence(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchIntelligence]);

  // --- UI RENDERERS ---

  const renderStats = () => (
    <View className="flex-row gap-4 mb-8">
      <Animated.View entering={FadeInRight.delay(100)} className="flex-1">
        <GlassCard className="p-4 border-b border-blue-500/30">
          <TrendingUp size={18} color="#3B82F6" />
          <Text className="text-white text-2xl font-black mt-2">
            {scrapers.length}
          </Text>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Bots Active
          </Text>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInRight.delay(200)} className="flex-1">
        <GlassCard className="p-4 border-b border-emerald-500/30">
          <Activity size={18} color="#10B981" />
          <Text className="text-white text-2xl font-black mt-2">
            {scrapers.reduce(
              (acc, curr) => acc + (curr.harvested_data?.length || 0),
              0,
            )}
          </Text>
          <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            Points Harvested
          </Text>
        </GlassCard>
      </Animated.View>
    </View>
  );

  const renderScraperItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      layout={LinearTransition.springify()}
      className="mb-4"
    >
      <TouchableOpacity
        onPress={() => router.push(`/details/${item.id}`)}
        activeOpacity={0.7}
      >
        <GlassCard className="p-5 flex-row items-center">
          <View className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20">
            <Search size={20} color="#60A5FA" />
          </View>

          <View className="flex-1 ml-4">
            <Text className="text-white font-bold text-base mb-1">
              {item.name}
            </Text>
            <View className="flex-row items-center">
              <Database size={12} color="#475569" />
              <Text className="text-slate-500 text-xs ml-1" numberOfLines={1}>
                {item.target_url}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-full border border-white/10">
              <Zap size={10} color="#FBBF24" fill="#FBBF24" />
              <Text className="text-white text-[10px] font-bold ml-1">
                {item.harvested_data?.length || 0}
              </Text>
            </View>
            <Text className="text-slate-600 text-[10px] mt-2 font-medium">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <AAAWrapper>
      <Stack.Screen options={{ headerShown: false }} />

      {/* RESTORED: Session & Profile Access */}
      <MainHeader title="Intelligence Hub" />

      <FlatList
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        data={scrapers}
        ListHeaderComponent={renderStats}
        renderItem={renderScraperItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchIntelligence();
            }}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <Animated.View
              entering={FadeInDown}
              className="items-center justify-center mt-20"
            >
              <LayoutDashboard size={64} color="#1e293b" />
              <Text className="text-slate-500 mt-4 text-center px-10">
                Your data pipelines are empty. Deploy your first intelligence
                bot to start harvesting.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/create')}
                className="mt-6 bg-blue-600 px-8 py-4 rounded-2xl flex-row items-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-bold ml-2">Create Bot</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null
        }
      />
    </AAAWrapper>
  );
}
