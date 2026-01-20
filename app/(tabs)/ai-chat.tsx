/**
 * ============================================================================
 * 🧠 NORTH OS: NEURAL SYNTHESIS TERMINAL (V20.0 PRODUCTION)
 * ============================================================================
 * ARCHITECTURE:
 * - EDGE_LINK: Direct high-speed pipe to 'neural-synthesis' Supabase function.
 * - UI_ENGINE: 'Glassmorphism 3.0' with 32px hyper-radius geometry.
 * - ADAPTIVE: Zero-layout-shift responsiveness (Mobile/Desktop).
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import {
  Cpu,
  Send,
  Zap,
  Terminal,
  Activity,
  Bot,
  BrainCircuit,
  Sparkles,
  Command,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

// --- INTERNAL IMPORTS ---
import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { supabase } from '@/lib/supabase';
import { NORTH_THEME } from '@/constants/theme';

// --- TYPES ---
interface Message {
  id: string;
  role: 'operator' | 'titan';
  content: string;
  timestamp: Date;
  tokens?: number;
}

// --- CONSTANTS ---
const THEME = {
  titan: '#4FD1C7', // Cyan
  operator: '#E2E8F0', // Slate
  accent: '#A78BFA', // Purple
  bg: '#020617',
};

// --- ANIMATED COMPONENTS ---
const PulseIndicator = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 600 })),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.typingRow, animatedStyle]}>
      <Activity size={14} color={THEME.titan} />
      <Text style={styles.typingText}>NEURAL SYNTHESIS IN PROGRESS...</Text>
    </Animated.View>
  );
};

export default function NeuralSynthesisTerminal() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const scrollRef = useRef<ScrollView>(null);

  // --- STATE ---
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ 
    queries: 0, 
    latency: '0ms', 
    efficiency: '100%' 
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-0',
      role: 'titan',
      content: 'TITAN-2 NEURAL CORE ONLINE.\nREADY TO ANALYZE EXTRACTED LEDGER DATA.',
      timestamp: new Date(),
    },
  ]);

  // --- ENGINE ---
  const handleSynthesize = async () => {
    if (!input.trim() || isProcessing) return;

    const queryText = input.trim();
    setInput(''); // Immediate clear
    setIsProcessing(true);
    const startTime = Date.now();

    // 1. Optimistic Operator Message
    const operatorMsg: Message = {
      id: Date.now().toString(),
      role: 'operator',
      content: queryText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, operatorMsg]);

    // Scroll to bottom
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // 2. Invoke Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('neural-synthesis', {
        body: { 
          query: queryText, 
          history: messages.slice(-4) // Send last 4 messages for context
        },
      });

      if (error) throw error;

      // 3. Process Response
      const executionTime = Date.now() - startTime;
      const responseText = data?.response || "NO_DATA_RECEIVED";
      
      const titanMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'titan',
        content: responseText,
        timestamp: new Date(),
        tokens: data?.tokens || 0,
      };

      setMessages((prev) => [...prev, titanMsg]);
      setStats(prev => ({
        queries: prev.queries + 1,
        latency: `${executionTime}ms`,
        efficiency: '98.4%' // Placeholder metric
      }));

    } catch (err: any) {
      console.error('Neural Synthesis Error:', err);
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'titan',
        content: `[SYSTEM_FAILURE]: ${err.message || 'Connection to Neural Core severed.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      {/* BACKGROUND */}
      <LinearGradient
        colors={['#020617', '#0F172A', '#020617']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <MainHeader title="Neural Synthesis" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingHorizontal: isDesktop ? 48 : 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* TELEMETRY HUD */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={[styles.hudGrid, isDesktop ? styles.hudDesktop : styles.hudMobile]}>
              
              {/* METRIC 1 */}
              <GlassCard intensity={40} style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 209, 199, 0.1)' }]}>
                  <BrainCircuit size={20} color={THEME.titan} />
                </View>
                <View>
                  <Text style={styles.statValue}>{stats.queries}</Text>
                  <Text style={styles.statLabel}>SYNTHESES</Text>
                </View>
              </GlassCard>

              {/* METRIC 2 */}
              <GlassCard intensity={40} style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}>
                  <Zap size={20} color={THEME.accent} />
                </View>
                <View>
                  <Text style={[styles.statValue, { color: THEME.accent }]}>{stats.latency}</Text>
                  <Text style={styles.statLabel}>LATENCY</Text>
                </View>
              </GlassCard>

              {/* METRIC 3 */}
              <GlassCard intensity={40} style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                  <Terminal size={20} color="white" />
                </View>
                <View>
                  <Text style={styles.statValue}>v17.6</Text>
                  <Text style={styles.statLabel}>CORE VERSION</Text>
                </View>
              </GlassCard>

            </View>
          </Animated.View>

          {/* MESSAGE STREAM */}
          <View style={styles.chatStream}>
            {messages.map((msg, idx) => (
              <Animated.View 
                key={msg.id} 
                entering={FadeInUp.delay(idx * 50).springify()}
                style={[
                  styles.msgRow, 
                  msg.role === 'operator' ? styles.rowOperator : styles.rowTitan
                ]}
              >
                <GlassCard 
                  intensity={msg.role === 'operator' ? 20 : 60}
                  style={[
                    styles.msgBubble,
                    msg.role === 'operator' ? styles.bubbleOperator : styles.bubbleTitan
                  ]}
                >
                  {msg.role === 'titan' && (
                    <View style={styles.titanHeader}>
                      <Bot size={12} color={THEME.titan} />
                      <Text style={styles.titanLabel}>TITAN-2 CORE</Text>
                    </View>
                  )}
                  
                  <Text style={[
                    styles.msgContent,
                    msg.role === 'titan' && styles.titanFont
                  ]}>
                    {msg.content}
                  </Text>

                  <Text style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </GlassCard>
              </Animated.View>
            ))}
            
            {isProcessing && <PulseIndicator />}
          </View>
        </ScrollView>

        {/* COMMAND INPUT */}
        <View style={[styles.inputWrapper, { paddingHorizontal: isDesktop ? 48 : 20 }]}>
          <GlassCard intensity={80} style={styles.inputCard}>
            <View style={styles.inputInner}>
              <Command size={20} color="#64748B" style={{ marginTop: 12 }} />
              <TextInput
                style={styles.textInput}
                placeholder="Initialize extraction query..."
                placeholderTextColor="#64748B"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={handleSynthesize}
                disabled={!input.trim() || isProcessing}
                style={[
                  styles.sendButton,
                  (!input.trim() || isProcessing) && styles.sendButtonDisabled
                ]}
              >
                {isProcessing ? (
                  <ActivityIndicator color={THEME.bg} size="small" />
                ) : (
                  <Send size={18} color={THEME.bg} />
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  scrollContainer: { paddingVertical: 24, paddingBottom: 120 },
  
  // HUD
  hudGrid: { gap: 16, marginBottom: 40 },
  hudDesktop: { flexDirection: 'row' },
  hudMobile: { flexDirection: 'column' },
  
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24, // High radius as requested
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: THEME.titan,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },

  // CHAT STREAM
  chatStream: { gap: 20 },
  msgRow: { width: '100%', flexDirection: 'row' },
  rowOperator: { justifyContent: 'flex-end' },
  rowTitan: { justifyContent: 'flex-start' },
  
  msgBubble: {
    maxWidth: '85%',
    padding: 20,
    borderRadius: 32, // Requested 32px
    borderWidth: 1,
  },
  bubbleOperator: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderBottomRightRadius: 4,
  },
  bubbleTitan: {
    backgroundColor: 'rgba(79, 209, 199, 0.05)',
    borderColor: 'rgba(79, 209, 199, 0.15)',
    borderBottomLeftRadius: 4,
  },
  
  titanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  titanLabel: {
    color: THEME.titan,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  msgContent: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 24,
  },
  titanFont: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  timestamp: {
    color: '#475569',
    fontSize: 10,
    marginTop: 8,
    alignSelf: 'flex-end',
  },

  // TYPING
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    marginTop: 8,
  },
  typingText: {
    color: THEME.titan,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // INPUT
  inputWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  inputCard: {
    borderRadius: 40, // Hyper round
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    minHeight: 48,
    maxHeight: 120,
    paddingTop: 14,
    paddingBottom: 14,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.titan,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
});