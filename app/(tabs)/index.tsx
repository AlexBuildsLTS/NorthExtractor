/**
 * ============================================================================
 * 💠 NORTH INTELLIGENCE OS: MISSION CONTROL (REAL TELEMETRY V5.0)
 * ============================================================================
 * PATH: app/(tabs)/index.tsx
 * STATUS: PRODUCTION READY (NO MOCKS)
 *
 * DATA SOURCE:
 * - Wallet Value: Calculated dynamically (Data Rows * $0.05/row).
 * - Active Nodes: Real count from 'scrapers' table.
 * - Throughput: Real count from 'scraping_jobs' (last 24h).
 * - Logs: Real 'scraping_logs' from Supabase.
 * ============================================================================
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Cpu,
  Activity,
  Wallet,
  Database,
  Terminal,
  Bitcoin,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// INTERNAL INFRASTRUCTURE
import { supabase } from '@/lib/supabase';
import { NORTH_THEME } from '@/constants/theme';
import { MainHeader } from '@/components/ui/MainHeader';
import { Database as DBTypes } from '@/supabase/database.types';
import { useAuth } from '@/context/AuthContext';

type Log = DBTypes['public']['Tables']['scraping_logs']['Row'];

// ----------------------------------------------------------------------------
// 🧩 BENTO CARD (ARCHITECTURALLY STABLE)
// ----------------------------------------------------------------------------
interface BentoCardProps {
  children: React.ReactNode;
  className?: string; // Used for NativeWind classes
  style?: any; // Used for Flex/Width logic
  onPress?: () => void;
  index?: number;
  glowColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
}

const BentoCard = ({
  children,
  className = '',
  style,
  onPress,
  index = 0,
  glowColor = '#06b6d4',
  gradientColors,
}: BentoCardProps) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    glowOpacity.value = withTiming(0.6);
    if (Platform.OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    glowOpacity.value = withTiming(0);
  };

  return (
    // OUTER VIEW: Handles Grid Positioning & Entry Animation
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[{ marginBottom: 16 }, style]}
      className={className}
    >
      {/* INNER VIEW: Handles Hover/Press Transform (Prevents Layout Thrashing) */}
      <Animated.View
        style={[
          animatedStyle,
          {
            flex: 1,
            borderRadius: 32,
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{ flex: 1, padding: 24 }}
        >
          {/* Glow Background */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: glowColor,
                opacity: 0,
                zIndex: -1,
              },
              glowStyle,
            ]}
          />
          {gradientColors && (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                opacity: 0.15,
              }}
            />
          )}
          {/* Glass Shine */}
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'transparent'] as const}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 80,
            }}
          />
          {children}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const StatWidget = ({ icon: Icon, label, value, subtext, color }: any) => (
  <View style={{ height: '100%', justifyContent: 'space-between' }}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          padding: 10,
          borderRadius: 16,
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <Icon size={22} color={color} />
      </View>
    </View>
    <View>
      <Text
        style={{
          fontSize: 30,
          fontWeight: '800',
          color: 'white',
          letterSpacing: -0.5,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
      {subtext && (
        <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
          {subtext}
        </Text>
      )}
    </View>
  </View>
);

// ----------------------------------------------------------------------------
// 🚀 MAIN DASHBOARD
// ----------------------------------------------------------------------------
export default function DashboardIndex() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuth(); // USES CONTEXT (Prevents "Signal Aborted" crash)

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [refreshing, setRefreshing] = useState(false);
  const [activeScrapers, setActiveScrapers] = useState(0);
  const [totalDataPoints, setTotalDataPoints] = useState(0);
  const [jobsToday, setJobsToday] = useState(0);
  const [recentLogs, setRecentLogs] = useState<Log[]>([]);

  // Real Calculation State
  const [dataValueUsd, setDataValueUsd] = useState(0);

  const fetchTelemetry = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Fetch Active Scrapers (Real DB Count)
      const { count: scraperCount } = await supabase
        .from('scrapers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // 2. Fetch Total Extracted Data (Real DB Count)
      const { count: dataCount } = await supabase
        .from('extracted_data')
        .select('*', { count: 'exact', head: true });

      // 3. Jobs in last 24h (Real DB Count)
      const today = new Date();
      today.setHours(today.getHours() - 24);
      const { count: jobCount } = await supabase
        .from('scraping_jobs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // 4. Recent Logs (Real DB Rows)
      const { data: logsData } = await supabase
        .from('scraping_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      setActiveScrapers(scraperCount || 0);
      setTotalDataPoints(dataCount || 0);
      setJobsToday(jobCount || 0);
      setRecentLogs(logsData || []);

      // 5. CALCULATE VALUE (Real Logic: 1 row = $0.05 value)
      // This is not a "fake" balance, it's a value derivation of your data.
      const realValue = (dataCount || 0) * 0.05;
      setDataValueUsd(realValue);
    } catch (e) {
      console.error('Telemetry Error:', e);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTelemetry();

    // Real-time listener for job updates
    const sub = supabase
      .channel('dashboard-feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scraping_jobs' },
        () => {
          fetchTelemetry();
          if (Platform.OS !== 'web')
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [user, fetchTelemetry]);

  // Dynamic Layout Widths
  const largeCardStyle = { width: isDesktop ? '66%' : '100%' };
  const smallCardStyle = {
    width: isDesktop ? '32%' : isTablet ? '48%' : '100%',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020617' }}>
      <StatusBar barStyle="light-content" />

      <MainHeader title="Mission Control" />

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 500,
          opacity: 0.2,
        }}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#4f46e5', 'transparent'] as const}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 120,
          paddingHorizontal: isTablet ? 32 : 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTelemetry();
            }}
            tintColor={NORTH_THEME.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
          }}
        >
          {/* 1. DATA VALUE CARD (Real derivation) */}
          <BentoCard
            style={largeCardStyle}
            index={1}
            glowColor="#6366f1"
            gradientColors={['#312e81', '#1e1b4b'] as const}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    <Wallet size={20} color="#c7d2fe" />
                  </View>
                  <Text style={{ color: '#c7d2fe', fontWeight: '600' }}>
                    DATA VALUE
                  </Text>
                </View>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: '900',
                    color: 'white',
                    letterSpacing: -1,
                  }}
                >
                  ${dataValueUsd.toFixed(2)}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <Database size={14} color="#94a3b8" />
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                    Based on {totalDataPoints} extracted rows
                  </Text>
                </View>
              </View>
            </View>
          </BentoCard>

          {/* 2. DEPLOY ACTION */}
          <BentoCard
            style={smallCardStyle}
            index={2}
            glowColor="#0ea5e9"
            onPress={() => router.push('/(tabs)/create')}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'rgba(14, 165, 233, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(14, 165, 233, 0.3)',
                }}
              >
                <Plus size={32} color="#38bdf8" />
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{ color: 'white', fontSize: 20, fontWeight: '700' }}
                >
                  Deploy Node
                </Text>
                <Text style={{ color: '#94a3b8', marginTop: 4 }}>
                  Initialize scraper
                </Text>
              </View>
            </View>
          </BentoCard>

          {/* 3. ACTIVE ENGINES */}
          <BentoCard
            style={smallCardStyle}
            index={3}
            glowColor="#10b981"
            onPress={() => router.push('/(tabs)/scraper')}
          >
            <StatWidget
              icon={Cpu}
              color="#10b981"
              label="Active Engines"
              value={activeScrapers.toString()}
              subtext="Nodes Running"
            />
          </BentoCard>

          {/* 4. TOTAL DATA */}
          <BentoCard style={smallCardStyle} index={4} glowColor="#f59e0b">
            <StatWidget
              icon={Database}
              color="#f59e0b"
              label="Harvested Data"
              value={
                totalDataPoints > 1000
                  ? `${(totalDataPoints / 1000).toFixed(1)}k`
                  : totalDataPoints.toString()
              }
              subtext="Total Rows"
            />
          </BentoCard>

          {/* 5. 24H JOBS */}
          <BentoCard style={smallCardStyle} index={5} glowColor="#ec4899">
            <StatWidget
              icon={Activity}
              color="#ec4899"
              label="24h Throughput"
              value={jobsToday.toString()}
              subtext="Jobs Processed"
            />
          </BentoCard>

          {/* 6. REAL LOGS */}
          <BentoCard
            style={{ width: '100%' }}
            index={6}
            onPress={() => router.push('/(tabs)/logs')}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Terminal size={18} color="#94a3b8" />
              <Text
                style={{
                  color: '#94a3b8',
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginLeft: 8,
                }}
              >
                System Logs
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {recentLogs.length === 0 ? (
                <Text
                  style={{
                    color: '#475569',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    paddingVertical: 20,
                  }}
                >
                  System Idle. No activity recorded.
                </Text>
              ) : (
                recentLogs.map((log) => (
                  <View
                    key={log.id}
                    style={{
                      flexDirection: 'row',
                      gap: 12,
                      paddingBottom: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Text
                      style={{
                        color: '#475569',
                        fontSize: 11,
                        fontFamily:
                          Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                        marginTop: 2,
                      }}
                    >
                      {new Date(log.created_at || '').toLocaleTimeString([], {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color:
                            log.level === 'error'
                              ? '#f87171'
                              : log.level === 'warn'
                                ? '#fbbf24'
                                : '#34d399',
                          textTransform: 'uppercase',
                        }}
                      >
                        {log.level || 'INFO'}
                      </Text>
                      <Text
                        style={{ color: '#cbd5e1', fontSize: 12, marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {log.message}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </BentoCard>
        </View>
      </ScrollView>
    </View>
  );
}
