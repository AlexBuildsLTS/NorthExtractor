/**
 * ============================================================================
 * 🤖 NORTH INTELLIGENCE OS: AI SYNTHESIS CHAT V17.6 (ELITE UNIFIED)
 * ============================================================================
 * FIXES:
 * - MOBILE OVERLAP: Resolved input anchor overlap via standard flex-footer.
 * - GEOMETRY SYNC: Enforced 32px hyper-rounded corners across all modules.
 * - ICON SYNTHESIS: 64px tinted glow-boxes for AI telemetry.
 * - NEURAL_QUERY: Optimized handshake for Gemini 1.5 Pro synthesis.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { Bot, Send, Cpu, Sparkles, Activity } from 'lucide-react-native';

// UI INTERNAL IMPORTS
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'operator' | 'titan';
  content: string;
  timestamp: Date;
}

export default function AiSynthesisChat() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const scrollRef = useRef<ScrollView>(null);

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'titan',
      content:
        'TITAN-2 NEURAL CORE ACTIVE. AWAITING INQUIRY ON EXTRACTION LEDGER.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState({ tokensProcessed: 0, queryCount: 0 });

  // --- NEURAL DISPATCH ---
  const handleDispatchQuery = async () => {
    if (!input.trim() || isTyping) return;

    const operatorMsg: Message = {
      id: Math.random().toString(),
      role: 'operator',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, operatorMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'neural-synthesis',
        {
          body: { query: operatorMsg.content, history: messages.slice(-5) },
        },
      );

      if (error) throw error;

      const titanMsg: Message = {
        id: Math.random().toString(),
        role: 'titan',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, titanMsg]);
      setStats((s) => ({
        tokensProcessed: s.tokensProcessed + data.tokens,
        queryCount: s.queryCount + 1,
      }));
    } catch (err: any) {
      Alert.alert(
        'Neural Fault',
        'Communication with Titan core was interrupted.',
      );
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="AI Synthesis" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollArea,
            { paddingHorizontal: isDesktop ? 64 : 20 },
          ]}
          showsVerticalScrollIndicator={false}
          ref={scrollRef}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {/* TELEMETRY HUD */}
          <View
            style={[
              styles.topSection,
              { flexDirection: isDesktop ? 'row' : 'column' },
            ]}
          >
            <GlassCard style={styles.modernStatCard}>
              <View
                style={[
                  styles.iconGlowBox,
                  { backgroundColor: 'rgba(167, 139, 250, 0.08)' },
                ]}
              >
                <Sparkles size={24} color="#A78BFA" />
              </View>
              <View>
                <Text style={styles.statNumber}>{stats.queryCount}</Text>
                <Text style={styles.statSubtitle}>SYNTHESIS QUERIES</Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.modernStatCard}>
              <View
                style={[
                  styles.iconGlowBox,
                  { backgroundColor: 'rgba(79, 209, 199, 0.08)' },
                ]}
              >
                <Cpu size={24} color="#4FD1C7" />
              </View>
              <View>
                <Text style={[styles.statNumber, { color: '#4FD1C7' }]}>
                  {stats.tokensProcessed}
                </Text>
                <Text style={styles.statSubtitle}>NEURAL TOKENS USED</Text>
              </View>
            </GlassCard>
          </View>

          {/* CHAT STREAM */}
          <View style={styles.chatContainer}>
            {messages.map((msg, index) => (
              <Animated.View
                key={msg.id}
                entering={FadeInDown.delay(index * 50)}
                style={[
                  styles.msgRow,
                  msg.role === 'operator'
                    ? styles.msgOperator
                    : styles.msgTitan,
                ]}
              >
                <GlassCard
                  style={[
                    styles.msgBubble,
                    msg.role === 'operator' && styles.bubbleOperator,
                  ]}
                >
                  {msg.role === 'titan' && (
                    <View style={styles.titanHeader}>
                      <Bot size={14} color="#4FD1C7" />
                      <Text style={styles.titanLabel}>TITAN_CORE</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.msgText,
                      msg.role === 'titan' && styles.textTitan,
                    ]}
                  >
                    {msg.content}
                  </Text>
                  <Text style={styles.msgTime}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </GlassCard>
              </Animated.View>
            ))}
            {isTyping && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#4FD1C7" />
                <Text style={styles.typingText}>SYNTHESIZING...</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* FIXED COMMAND INPUT (No Absolute Positioning) */}
        <View
          style={[
            styles.footerInput,
            { paddingHorizontal: isDesktop ? 64 : 20 },
          ]}
        >
          <GlassCard style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Query the ledger..."
              placeholderTextColor="#334155"
              multiline
            />
            <TouchableOpacity
              onPress={handleDispatchQuery}
              disabled={!input.trim() || isTyping}
              style={[styles.sendBtn, !input.trim() && styles.btnDisabled]}
            >
              <Send size={20} color="#020617" />
            </TouchableOpacity>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { paddingTop: 48, paddingBottom: 32 },
  topSection: { gap: 24, marginBottom: 40 },

  modernStatCard: {
    flex: 1,
    padding: 28,
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  iconGlowBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statSubtitle: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },

  chatContainer: { gap: 24, paddingBottom: 20 },
  msgRow: { flexDirection: 'row', width: '100%' },
  msgOperator: { justifyContent: 'flex-end' },
  msgTitan: { justifyContent: 'flex-start' },
  msgBubble: {
    padding: 20,
    borderRadius: 32,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  bubbleOperator: {
    backgroundColor: 'rgba(79, 209, 199, 0.05)',
    borderColor: 'rgba(79, 209, 199, 0.1)',
  },
  titanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  titanLabel: {
    color: '#4FD1C7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  msgText: { color: 'white', fontSize: 14, lineHeight: 22, fontWeight: '500' },
  textTitan: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  msgTime: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 10,
    marginBottom: 20,
  },
  typingText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  footerInput: { paddingBottom: 32, backgroundColor: 'transparent' },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 32,
    gap: 12,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    maxHeight: 100,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#4FD1C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.3 },
});
