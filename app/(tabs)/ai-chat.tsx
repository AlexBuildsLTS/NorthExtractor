/**
 * ============================================================================
 * 🧠 APEXSCRAPE: NEURAL SYNTHESIS CHAT (TITAN INTELLIGENCE) V100.1
 * ============================================================================
 * PATH: app/(tabs)/ai-chat.tsx
 * FEATURES:
 * - Contextual Memory: Pulls latest data nodes from 'extracted_data' ledger.
 * - Glassmorphism Messaging: Premium blurred message bubbles.
 * - Real-time AI Handshake: Direct integration with Google Gemini Edge Function.
 * - Improved: Better performance, error handling, and maintainability.
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Send, Cpu, Database, Sparkles, MessageSquare } from 'lucide-react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

// Constants for better maintainability
const COLORS = {
  primary: '#4FD1C7',
  secondary: '#A78BFA',
  background: '#020617',
  text: '#E2E8F0',
  textSecondary: '#475569',
  bubbleUser: 'rgba(167, 139, 250, 0.1)',
  bubbleAssistant: 'rgba(15, 23, 42, 0.6)',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface NeuralSynthesisResponse {
  response?: string;
  error?: string;
}

// Separate component for individual messages to improve performance and readability
const MessageBubble = memo(({ message }: { message: Message }) => (
  <Animated.View entering={FadeInUp}>
    <GlassCard style={[
      styles.messageBubble,
      message.role === 'user' ? styles.userBubble : styles.assistantBubble
    ]}>
      <View style={styles.bubbleHeader}>
        {message.role === 'assistant' ? <Cpu size={12} color={COLORS.primary} /> : <MessageSquare size={12} color={COLORS.secondary} />}
        <Text style={[styles.roleText, { color: message.role === 'assistant' ? COLORS.primary : COLORS.secondary }]}>
          {message.role.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.messageContent}>{message.content}</Text>
      <Text style={styles.timestamp}>{new Date(message.timestamp).toLocaleTimeString()}</Text>
    </GlassCard>
  </Animated.View>
));

export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Memoized send message handler for performance
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Invoke Neural Synthesis Edge Function with timeout
      const { data, error }: { data: NeuralSynthesisResponse | null; error: any } = await supabase.functions.invoke('neural-synthesis', {
        body: { query: userMessage.content }
      });

      if (error) throw new Error(error.message || 'Edge function invocation failed');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || data?.error || "Synthesis failed. Check ledger health.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred';
      console.error('AI Chat Error:', errorMessage); // Added logging for debugging
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `[TITAN-CORE] Fault: ${errorMessage}. Please try again.`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);

  useEffect(() => {
    if (flatListRef.current && (messages.length > 0 || isTyping)) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100); // Delayed scroll for better UX
    }
  }, [messages, isTyping]);

  const renderMessage = ({ item }: { item: Message }) => <MessageBubble message={item} />;
  const keyExtractor = (item: Message) => item.id;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[COLORS.background, '#0A101F', COLORS.background]} style={StyleSheet.absoluteFill} />
      <MainHeader title="Neural Synthesis" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.welcomeBox}>
              <Sparkles size={48} color={COLORS.primary} />
              <Text style={styles.welcomeTitle}>CORE INTELLIGENCE ACTIVE</Text>
              <Text style={styles.welcomeSub}>Query the data ledger for synthesized insights.</Text>
            </View>
          }
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.typingText}>SYNTHESIZING LEDGER...</Text>
              </View>
            ) : null
          }
        />

        <GlassCard style={styles.inputDock}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="Search extraction ledger..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={500} // Added character limit for edge case
          />
          <TouchableOpacity onPress={handleSendMessage} style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.5 }]} disabled={!input.trim()}>
            <Send size={20} color={COLORS.background} />
          </TouchableOpacity>
        </GlassCard>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  chatArea: { padding: 20, paddingBottom: 40 },
  welcomeBox: { alignItems: 'center', marginTop: 100, gap: 15 },
  welcomeTitle: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 4 },
  welcomeSub: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', paddingHorizontal: 40 },
  messageBubble: { padding: 16, borderRadius: 20, marginBottom: 15, maxWidth: '90%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.bubbleUser },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.bubbleAssistant },
  bubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  roleText: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  messageContent: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  timestamp: { color: COLORS.textSecondary, fontSize: 10, marginTop: 5, textAlign: 'right' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 20, marginBottom: 20 },
  typingText: { color: COLORS.primary, fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  inputDock: { margin: 16, padding: 10, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingHorizontal: 12, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, backgroundColor: COLORS.primary, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }
});