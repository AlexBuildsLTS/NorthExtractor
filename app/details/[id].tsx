// FILE: app/details/[id].tsx
// PURPOSE: AAA+ result visualization with self-healing logs.

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Icons } from '@/components/ui/Icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ScrapeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchScrapedData(); }, [id]);

  const fetchScrapedData = async () => {
    const { data: result, error } = await supabase
      .from('extracted_data')
      .select('*, scraping_jobs(url)')
      .eq('job_id', id)
      .single();

    if (!error) setData(result);
    setLoading(false);
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: JSON.stringify(data?.content_structured, null, 2),
      });
    } catch (error) { console.log(error); }
  };

  if (loading) return (
    <View className="flex-1 bg-slate-950 justify-center items-center">
      <ActivityIndicator size="large" color="#60a5fa" />
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-slate-950 px-6 pt-24">
      <Animated.View entering={FadeInUp.duration(600)}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-3xl font-black">Data Result</Text>
          <TouchableOpacity onPress={onShare} className="bg-blue-500/20 p-3 rounded-full">
            <Icons.Send size={20} color="#60a5fa" />
          </TouchableOpacity>
        </View>

        {/* Source URL Info */}
        <GlassCard className="mb-8 p-4 border-l-4 border-l-blue-500">
          <View className="flex-row items-center mb-1">
            <Icons.Globe size={14} color="#94a3b8" />
            <Text className="text-slate-500 ml-2 text-[10px] font-bold uppercase tracking-widest">Target Source</Text>
          </View>
          <Text className="text-white font-medium" numberOfLines={1}>{data?.scraping_jobs?.url}</Text>
        </GlassCard>

        {/* Self-Healing Badge */}
        {data?.metadata?.healed && (
          <View className="bg-green-500/10 flex-row items-center p-3 rounded-2xl mb-6 border border-green-500/20">
            <Icons.Check size={16} color="#4ade80" />
            <Text className="text-green-400 ml-2 text-xs font-bold uppercase">AI Structural Repair Active</Text>
          </View>
        )}

        {/* Data Fields */}
        <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4 ml-1">Extracted Payload</Text>
        {data?.content_structured && Object.entries(data.content_structured).map(([key, value]) => (
          <GlassCard key={key} className="mb-4 p-5">
            <Text className="text-blue-400 text-[10px] font-bold uppercase mb-1">{key.replace('_', ' ')}</Text>
            <Text className="text-white text-lg font-semibold">{String(value)}</Text>
          </GlassCard>
        ))}

        <View className="h-24" />
      </Animated.View>
    </ScrollView>
  );
}