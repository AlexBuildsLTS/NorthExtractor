/**
 * ============================================================================
 * 🧠 APEXSCRAPE: NEURAL INTERFACE (TITAN-V60 UI)
 * ============================================================================
 * PATH: app/(tabs)/ai-chat.tsx
 * DESIGN: Matches Index/Create (Deep Glass, Neon Accents, Spring Physics).
 * FEATURES:
 * - Real-time Edge Function Link ('neural-synthesis').
 * - Layout Animations for fluid chat flow.
 * - Haptic Feedback on interaction.
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp,
  Layout,
  FadeInDown,
} from 'react-native-reanimated';
import {
  Send,
  Cpu,
  User,
  Sparkles,
  AlertTriangle,
  Terminal,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';

// --- TYPES ---
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isError?: boolean;
}

// ----------------------------------------------------------------------------
// 🧩 COMPONENT: NEURAL MESSAGE CARD
// ----------------------------------------------------------------------------
const MessageCard = ({ item, index }: { item: Message; index: number }) => {
  const isUser = item.role === 'user';
  const isSystem = item.role === 'system';

  // Dynamic Styling based on Role
  const alignSelf = isUser ? 'flex-end' : 'flex-start';
  const glowColor = isUser ? '#A78BFA' : item.isError ? '#EF4444' : '#4FD1C7';
  const bgColors = isUser
    ? ['rgba(167, 139, 250, 0.1)', 'rgba(167, 139, 250, 0.05)']
    : ['rgba(15, 23, 42, 0.8)', 'rgba(15, 23, 42, 0.6)'];

  const borderColor = isUser
    ? 'rgba(167, 139, 250, 0.2)'
    : 'rgba(79, 209, 199, 0.1)';

  return (
    <Animated.View
      entering={FadeInUp.delay(50).springify()}
      layout={Layout.springify()}
      style={[styles.msgWrapper, { alignSelf }]}
    >
      <LinearGradient
        colors={bgColors as any}
        style={[styles.msgGradient, { borderColor }]}
      >
        {/* Header Metadata */}
        <View style={styles.msgHeader}>
          <View
            style={[
              styles.roleBadge,
              { borderColor: glowColor, backgroundColor: `${glowColor}10` },
            ]}
          >
            {isUser ? (
              <User size={10} color={glowColor} />
            ) : (
              <Cpu size={10} color={glowColor} />
            )}
            <Text style={[styles.roleText, { color: glowColor }]}>
              {isUser ? 'OPERATOR' : 'TITAN AI'}
            </Text>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Content */}
        <Text style={styles.msgContent}>{item.content}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ----------------------------------------------------------------------------
// 🚀 MAIN SCREEN
// ----------------------------------------------------------------------------
export default function AIChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        200,
      );
    }
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    if (Platform.OS !== 'web') Haptics.selectionAsync();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'neural-synthesis',
        {
          body: { query: userMsg.content },
        },
      );

      if (error) throw new Error(error.message || 'Neural Link Failed');

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.response || 'Analysis complete. No data returned.',
        timestamp: new Date().toISOString(),
      };

      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `SYSTEM FAULT: ${err.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />

      <MainHeader title="Neural Synthesis" />

      {/* Ambient Background */}
      <View style={styles.ambience} pointerEvents="none">
        <LinearGradient
          colors={['#a855f7', 'transparent'] as const}
          style={{ flex: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item, index }) => (
            <MessageCard item={item} index={index} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.emptyState}
            >
              <View style={styles.emptyIconBox}>
                <Sparkles size={32} color="#A78BFA" />
              </View>
              <Text style={styles.emptyTitle}>TITAN NEURAL LINK</Text>
              <Text style={styles.emptySub}>
                Connected to Gemini 1.5 Pro. Ready to analyze extraction
                ledgers.
              </Text>
            </Animated.View>
          }
          ListFooterComponent={
            isTyping ? (
              <Animated.View entering={FadeInUp} style={styles.typingBox}>
                <ActivityIndicator color="#4FD1C7" size="small" />
                <Text style={styles.typingText}>PROCESSING LEDGER...</Text>
              </Animated.View>
            ) : (
              <View style={{ height: 20 }} />
            )
          }
        />

        {/* INPUT DOCK */}
        <View style={styles.inputContainer}>
          <View style={styles.glassInput}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Query extracted data..."
              placeholderTextColor="#64748B"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!input.trim() || isTyping}
              style={[styles.sendBtn, !input.trim() && { opacity: 0.3 }]}
            >
              <Send size={18} color="#020617" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ----------------------------------------------------------------------------
// 🎨 STYLES (MATCHING INDEX/CREATE)
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  ambience: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    opacity: 0.1,
  },

  listContent: { padding: 24, paddingBottom: 20 },

  // MESSAGES
  msgWrapper: {
    maxWidth: '85%',
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  msgGradient: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  timestamp: {
    color: '#64748B',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  msgContent: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },

  // EMPTY STATE
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
    opacity: 0.8,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    marginBottom: 24,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 8,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },

  // TYPING
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 24,
    marginBottom: 24,
  },
  typingText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // INPUT DOCK
  inputContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
  },
  glassInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 6,
    shadowColor: '#4FD1C7',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: '#4FD1C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
