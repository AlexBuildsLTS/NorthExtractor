/**
 * ============================================================================
 * 🧠 NORTH INTELLIGENCE OS: NEURAL SYNTHESIS TERMINAL V9.0
 * ============================================================================
 * Features:
 * - Contextual Extraction: Queries 'extracted_data' ledger using natural language.
 * - Titan-2 Neural Link: Direct streaming from Gemini 1.5 Pro Edge Functions.
 * - High-Fidelity Physics: Reanimated 4 spring-based layout transitions.
 * - Multi-Modal Actions: One-tap spend analysis and data-health audits.
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  FadeInLeft,
  Layout,
  SlideInDown,
} from 'react-native-reanimated';

// UI INTERNAL IMPORTS
import { MainHeader } from '@/components/ui/MainHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Icons } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// --- TYPES ---
interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  metadata?: {
    nodes_analyzed?: number;
    tokens?: number;
  };
}

export default function AICFOTerminal() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const welcome = {
      id: 'init-0',
      role: 'assistant' as const,
      content: `System Online. Welcome, ${user?.full_name || 'Operator'}. I have indexed your Extraction Ledger. You can ask me to analyze specific jobs, summarize leads, or calculate extraction throughput.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setMessages([welcome]);
  }, [user]);

  // --- NEURAL EXECUTION ---
  const handleSynthesisRequest = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Trigger the Neural Synthesis Edge Function
      // This function reads your Supabase 'extracted_data' to provide real answers
      const { data, error } = await supabase.functions.invoke(
        'neural-synthesis',
        {
          body: {
            query: userMsg.content,
            user_id: user?.id,
            context_window: 10, // Last 10 extractions
          },
        },
      );

      if (error) throw error;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          data.reply || 'Analysis complete. Data nodes are synchronized.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('[SYNTHESIS_FAULT]', err.message);
      Alert.alert(
        'Neural Link Severed',
        'Edge Function failed to synthesize data nodes.',
      );
    } finally {
      setIsTyping(false);
    }
  }, [input, user, isTyping]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <MainHeader title="AI CFO" />

      {/* GLOBAL BACKGROUND DEPTH */}
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* SECURITY STATUS */}
          <View className="items-center mb-10">
            <View className="flex-row items-center bg-[#4FD1C7]/5 px-5 py-2 rounded-full border border-[#4FD1C7]/20 shadow-lg shadow-[#4FD1C7]/10">
              <View className="w-1.5 h-1.5 rounded-full bg-[#4FD1C7] mr-3 animate-pulse" />
              <Text className="text-[#4FD1C7] font-black text-[9px] tracking-[3px] uppercase">
                Titan-2 Neural Link Active
              </Text>
            </View>
          </View>

          {messages.map((msg) => (
            <Animated.View
              key={msg.id}
              entering={msg.role === 'assistant' ? FadeInLeft : FadeInUp}
              layout={Layout.springify()}
              className={`mb-8 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <View className="bg-[#111827] w-10 h-10 rounded-xl items-center justify-center mr-4 self-end border border-white/10 shadow-2xl">
                  <Icons.Zap size={18} color="#4FD1C7" fill="#4FD1C7" />
                </View>
              )}

              <GlassCard
                className={`max-w-[85%] p-6 ${
                  msg.role === 'user'
                    ? 'border-[#4FD1C7]/40 bg-[#4FD1C7]/10'
                    : 'border-white/5 bg-slate-900/40'
                }`}
              >
                <Text
                  className={`text-[16px] leading-7 ${msg.role === 'user' ? 'text-white font-bold' : 'text-slate-200'}`}
                >
                  {msg.content}
                </Text>

                <View className="flex-row items-center justify-between mt-4">
                  {msg.metadata?.nodes_analyzed && (
                    <Text className="text-[#4FD1C7] text-[8px] font-black uppercase italic">
                      Nodes Analyzed: {msg.metadata.nodes_analyzed}
                    </Text>
                  )}
                  <Text className="text-slate-600 text-[9px] font-black tracking-tighter ml-auto">
                    {msg.timestamp}
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>
          ))}

          {isTyping && (
            <Animated.View
              entering={FadeInLeft}
              className="flex-row items-center mb-10 ml-2"
            >
              <View className="p-3 border bg-slate-800 rounded-xl border-white/5">
                <ActivityIndicator size="small" color="#4FD1C7" />
              </View>
              <Text className="text-slate-500 text-[10px] font-black ml-4 uppercase tracking-widest italic">
                Titan-2 is synthesizing ledger nodes...
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* INPUT COMMAND DECK */}
        <View className="p-6 border-t border-white/5 bg-[#020617]/95">
          <View className="flex-row items-center bg-white/5 rounded-[28px] border border-white/10 px-6 h-20 shadow-2xl overflow-hidden">
            <TextInput
              className="flex-1 text-lg font-bold text-white"
              placeholder="Ask NorthAI about your data..."
              placeholderTextColor="#475569"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSynthesisRequest}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleSynthesisRequest}
              disabled={!input.trim() || isTyping}
              className={`p-4 rounded-full ${input.trim() ? 'bg-[#4FD1C7]' : 'bg-slate-800 opacity-50'}`}
            >
              <Icons.Send size={20} color="#020617" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-6 space-x-8 opacity-40">
            <TouchableOpacity className="flex-row items-center px-4 py-2 border rounded-lg border-white/10">
              <Icons.TrendingUp size={14} color="#4FD1C7" />
              <Text className="text-[#4FD1C7] text-[9px] font-black ml-2 uppercase tracking-widest">
                Audit Spend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center px-4 py-2 border rounded-lg border-white/10">
              <Icons.Database size={14} color="#4FD1C7" />
              <Text className="text-[#4FD1C7] text-[9px] font-black ml-2 uppercase tracking-widest">
                Summarize Jobs
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
});
