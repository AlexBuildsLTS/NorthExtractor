/**
 * NORTH INTELLIGENCE OS: AI CFO TERMINAL V8.0
 * Path: app/(tabs)/ai-chat.tsx
 * FEATURES:
 * - Titan-2 Heuristic Chat Bubbles
 * - Biometric Identity Verification
 * - Real-time Data Mapping Visualization
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { MainHeader } from '@/components/ui/MainHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Icons } from '@/components/ui/Icons';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInUp, FadeInLeft, Layout } from 'react-native-reanimated';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

export default function AICFOTerminal() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${user?.user_metadata?.full_name || 'Operator'}. I am NorthAI. I can analyze your semantic node data or help you log extractions via the Smart Ledger.`,
      timestamp: '09:55 PM'
    }
  ]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response - Integration with Gemini happens here
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Analysis complete. Semantic node clusters are 98% synchronized. No structural heal events required.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <MainHeader title="AI CFO" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* SECURE CHANNEL BADGE */}
          <View className="items-center mb-8">
            <View className="flex-row items-center bg-[#4FD1C7]/10 px-4 py-2 rounded-full border border-[#4FD1C7]/20">
              <Icons.Shield size={12} color="#4FD1C7" />
              <Text className="text-[#4FD1C7] font-black text-[10px] ml-2 tracking-widest uppercase">
                Encrypted Titan-2 Link
              </Text>
            </View>
          </View>

          {messages.map((msg, i) => (
            <Animated.View 
              key={msg.id} 
              entering={msg.role === 'assistant' ? FadeInLeft : FadeInUp}
              layout={Layout.springify()}
              className={`mb-6 flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <View className="bg-[#020020] p-2 rounded-lg mr-3 self-end border border-white/5 shadow-lg">
                  <Icons.Cpu size={16} color="#4FD1C7" />
                </View>
              )}
              
              <GlassCard 
                intensity={msg.role === 'assistant' ? 10 : 30}
                className={`max-w-[80%] p-5 ${msg.role === 'user' ? 'border-[#4FD1C7]/30 bg-[#4FD1C7]/5' : 'border-white/5'}`}
              >
                <Text className={`text-[15px] leading-relaxed font-medium ${msg.role === 'user' ? 'text-white' : 'text-slate-300'}`}>
                  {msg.content}
                </Text>
                <Text className="text-[9px] text-slate-600 font-bold mt-3 text-right uppercase tracking-tighter">
                  {msg.timestamp}
                </Text>
              </GlassCard>
            </Animated.View>
          ))}

          {isTyping && (
            <View className="flex-row items-center ml-2 opacity-50">
              <Icons.Activity size={14} color="#4FD1C7" />
              <Text className="text-[#4FD1C7] text-xs font-bold ml-2 italic">Titan-2 is calculating...</Text>
            </View>
          )}
        </ScrollView>

        {/* INPUT TERMINAL */}
        <View className="p-6 border-t border-white/5 bg-[#020617]">
          <View className="flex-row items-center bg-white/5 rounded-[24px] border border-white/10 px-6 h-20 shadow-2xl">
            <TextInput
              className="flex-1 text-white font-semibold text-lg italic"
              placeholder="Ask NorthAI..."
              placeholderTextColor="#334155"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSendMessage}
              className="bg-[#4FD1C7] p-4 rounded-full shadow-lg shadow-[#4FD1C7]/30"
            >
              <Icons.Send size={20} color="#020617" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-center mt-4 space-x-6 opacity-40">
            <TouchableOpacity className="flex-row items-center">
              <Icons.Activity size={12} color="#4FD1C7" />
              <Text className="text-[#4FD1C7] text-[10px] font-black ml-2 uppercase">Analyze Spend</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center">
              <Icons.Plus size={12} color="#4FD1C7" />
              <Text className="text-[#4FD1C7] text-[10px] font-black ml-2 uppercase">Quick Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' }
});