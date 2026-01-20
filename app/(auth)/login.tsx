/**
 * ============================================================================
 * 💠 NORTH EXTRACT: V41.1 INDUSTRIAL IDENTITY TERMINAL (TEXT WRAP FORCED)
 * ============================================================================
 * Path: app/(auth)/login.tsx
 * STATUS: PRODUCTION READY
 * FIX:
 * - Added 'flexShrink: 1' and 'flexWrap: 'wrap'' DIRECTLY to Text styles.
 * - This forces React Native to break lines even if the container is flexible.
 * ============================================================================
 */

import React, { useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Database,
  Zap,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Twitter,
  Linkedin,
  Facebook,
  Shield,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { NORTH_THEME } from '@/constants/theme';

declare const require: any;

// --- INDUSTRIAL THEME ---
const THEME = {
  primary: NORTH_THEME.colors.primary,
  obsidian: NORTH_THEME.colors.background,
  cardBg: NORTH_THEME.colors.card,
  border: NORTH_THEME.colors.border,
  textMuted: NORTH_THEME.colors.textMuted,
  textMain: '#E6F1FF',
};

const APP_ICON = require('../../assets/icon.png');

// --- CONSTANTS ---
const DESKTOP_BREAKPOINT = 1024;
const EMAIL_PLACEHOLDER = 'operator@core.ext';
const PASSWORD_PLACEHOLDER = '••••••••';
const ALERT_TITLES = {
  CREDENTIALS_REQUIRED: 'Credentials Required',
  DENIED: 'Access Denied',
};
const MESSAGES = {
  INPUT_OPERATOR_ID: 'Please enter a valid email and password.',
  INVALID_EMAIL: 'Please enter a valid email address.',
};

// --- COMPONENT MODULES ---

interface ExtractionTierCardProps {
  title: string;
  subtitle: string;
  features: string[];
  recommended?: boolean;
  isDesktop: boolean;
  index: number;
}

const ExtractionTierCard = memo(
  ({
    title,
    subtitle,
    features,
    recommended,
    isDesktop,
    index,
  }: ExtractionTierCardProps) => (
    <Animated.View
      entering={FadeInUp.delay(
        isDesktop ? 300 + index * 100 : 300 + index * 150,
      )
        .springify()
        .damping(12)
        .mass(1.5)}
      style={[
        styles.tierWrapper,
        isDesktop ? { width: '31.5%' } : { width: '100%', marginBottom: 24 },
      ]}
    >
      <GlassCard
        intensity={recommended ? 65 : 40}
        style={[
          styles.tierInner,
          !isDesktop && { padding: 24 },
          recommended && styles.tierRecommended,
        ]}
      >
        {recommended && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>TITAN NODE</Text>
          </View>
        )}
        <Text style={styles.tierTitleText}>{title}</Text>
        <Text style={styles.tierSubtitleText}>{subtitle}</Text>

        <View style={styles.tierDivider} />

        <View style={{ gap: 16 }}>
          {features.map((f: string, i: number) => (
            <View key={i} style={styles.tierFeatRow}>
              <CheckCircle2
                size={18}
                color={THEME.primary}
                style={{ marginTop: 2, marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.tierFeatText}>{f}</Text>
              </View>
            </View>
          ))}
        </View>
      </GlassCard>
    </Animated.View>
  ),
);

interface CapabilityModuleProps {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  isDesktop: boolean;
  index: number;
}

const CapabilityModule = memo(
  ({ icon: Icon, title, desc, isDesktop, index }: CapabilityModuleProps) => (
    <Animated.View
      entering={FadeInUp.delay(
        isDesktop ? 200 + index * 100 : 200 + index * 150,
      )
        .springify()
        .damping(12)
        .mass(1.5)}
      style={[
        styles.capWrapper,
        !isDesktop && { width: '100%', marginBottom: 16 },
      ]}
    >
      <GlassCard
        intensity={50}
        style={[styles.capCard, !isDesktop && { padding: 20, gap: 16 }]}
      >
        <View style={styles.capIconContainer}>
          <Icon size={24} color={THEME.primary} />
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.capTitleText}>{title}</Text>
          <Text style={styles.capDescText}>{desc}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  ),
);

const IndustrialFooter = memo(({ isDesktop }: { isDesktop: boolean }) => (
  <View
    style={[
      styles.footerBaseContainer,
      !isDesktop && {
        marginTop: 60,
        paddingTop: 40,
        borderTopColor: 'rgba(255,255,255,0.08)',
      },
    ]}
  >
    <View
      style={[
        styles.footerGrid,
        !isDesktop && {
          flexDirection: 'column',
          gap: 40,
          alignItems: 'center',
        },
      ]}
    >
      <View
        style={[
          styles.footerColumn,
          !isDesktop && { alignItems: 'center', width: '100%' },
        ]}
      >
        <Text style={styles.footerHeader}>Network</Text>
        {['Node Clusters', 'Log Analytics', 'API Status'].map((l) => (
          <TouchableOpacity key={l}>
            <Text
              style={[
                styles.footerLinkText,
                !isDesktop && { textAlign: 'center' },
              ]}
            >
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View
        style={[
          styles.footerColumn,
          !isDesktop && { alignItems: 'center', width: '100%' },
        ]}
      >
        <Text style={styles.footerHeader}>Resource</Text>
        {['Schema Docs', 'Extraction Registry'].map((l) => (
          <TouchableOpacity key={l}>
            <Text
              style={[
                styles.footerLinkText,
                !isDesktop && { textAlign: 'center' },
              ]}
            >
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View
        style={[
          styles.footerColumn,
          !isDesktop && { alignItems: 'center', width: '100%' },
        ]}
      >
        <Text style={styles.footerHeader}>Legal</Text>
        {['Privacy Policy', 'Terms', 'Security'].map((l) => (
          <TouchableOpacity key={l}>
            <Text
              style={[
                styles.footerLinkText,
                !isDesktop && { textAlign: 'center' },
              ]}
            >
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={styles.footerSeparator} />

    <View
      style={[
        styles.footerBottomRow,
        !isDesktop && {
          flexDirection: 'column',
          gap: 24,
          alignItems: 'center',
        },
      ]}
    >
      <View
        style={{
          alignItems: isDesktop ? 'flex-start' : 'center',
          width: !isDesktop ? '100%' : 'auto',
        }}
      >
        <Text style={[styles.copyright, !isDesktop && { textAlign: 'center' }]}>
          © 2026 NorthExtract AI
        </Text>
        <Text
          style={[
            styles.versionTag,
            !isDesktop && { textAlign: 'center', marginTop: 8 },
          ]}
        >
          GRID PROTOCOL V5.2.4 | SECURE
        </Text>
      </View>
      <View style={styles.footerSocials}>
        <Twitter size={20} color={THEME.textMuted} />
        <Linkedin size={20} color={THEME.textMuted} />
        <Facebook size={20} color={THEME.textMuted} />
      </View>
    </View>
  </View>
));

interface LoginFormProps {
  email: string;
  setEmail: (v: string) => void;
  pass: string;
  setPass: (v: string) => void;
  loading: boolean;
  handleLogin: () => void;
  show: boolean;
  setShow: (v: boolean) => void;
  isDesktop: boolean;
}

const LoginFormModule = memo(
  ({
    email,
    setEmail,
    pass,
    setPass,
    loading,
    handleLogin,
    show,
    setShow,
    isDesktop,
  }: LoginFormProps) => (
    <View style={[styles.formContent, !isDesktop && { paddingHorizontal: 0 }]}>
      <Animated.View
        entering={FadeInDown.duration(800).springify().damping(15)}
        style={styles.actionHeader}
      >
        <View style={styles.actionBrandBox}>
          <Image source={APP_ICON} style={styles.actionBrandIcon} />
        </View>
        <Text style={styles.actionTitle}>Welcome Back</Text>
      </Animated.View>

      <GlassCard intensity={70} style={styles.actionGlassCard}>
        <View style={styles.actionInputStack}>
          <View>
            <Text style={styles.actionInputLabel}>Email</Text>
            <View style={styles.actionInputRow}>
              <Mail size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.actionTextInput}
                placeholder={EMAIL_PLACEHOLDER}
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          <View>
            <Text style={styles.actionInputLabel}>Password</Text>
            <View style={styles.actionInputRow}>
              <Lock size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.actionTextInput}
                placeholder={PASSWORD_PLACEHOLDER}
                placeholderTextColor="#475569"
                secureTextEntry={!show}
                value={pass}
                onChangeText={setPass}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShow(!show)}>
                {show ? (
                  <EyeOff size={18} color={THEME.textMuted} />
                ) : (
                  <Eye size={18} color={THEME.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.actionSubmitBtn, loading && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME.obsidian} />
            ) : (
              <View style={styles.actionBtnInner}>
                <Text style={styles.actionBtnLabel}>Sign In</Text>
                <ArrowRight size={20} color={THEME.obsidian} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.actionModeSwitchRow}>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.actionModeSwitchLink}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </GlassCard>

      <View style={styles.securityTagRow}>
        <Shield size={12} color={THEME.textMuted} />
        <Text style={styles.securityTagText}>
          NORTH-EXTRACT AES-256 ENCRYPTED GATEWAY
        </Text>
      </View>
    </View>
  ),
);

export default function LoginScreen() {
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = useCallback(async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert(
        ALERT_TITLES.CREDENTIALS_REQUIRED,
        MESSAGES.INPUT_OPERATOR_ID,
      );
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert(ALERT_TITLES.CREDENTIALS_REQUIRED, MESSAGES.INVALID_EMAIL);
      return;
    }

    setLoading(true);
    try {
      await login(trimmedEmail, trimmedPassword);
    } catch (error: any) {
      const errorMessage =
        error?.message || 'An unknown error occurred. Please try again.';
      Alert.alert(ALERT_TITLES.DENIED, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  const capabilities = [
    {
      icon: Zap,
      title: 'Titan-2 Heuristics',
      desc: 'Real-time mapping for decentralized data nodes',
    },
    {
      icon: Database,
      title: 'Cluster Deployment',
      desc: 'extraction nodes across distributed regions',
    },
    {
      icon: Layers,
      title: 'Semantic Repair',
      desc: 'Intelligent recovery algorithms for schema drift',
    },
    {
     icon: ShieldCheck,
      title: 'Biometric Vault',
      desc: 'Secure AES-256 encryption',
    },
  ];

  const tiers = [
    {
      title: 'MEMBER',
      subtitle: 'Standard',
      features: ['Semantic mapping', 'Daily limits'],
      recommended: false,
    },
    {
      title: 'PREMIUM',
      subtitle: 'Premium Member',
      features: ['Heuristic engine', 'Self-healing'],
      recommended: true,
    },
    {
      title: 'MOD',
      subtitle: 'Enterprise Cluster',
      features: ['Unlimited clusters', 'Expert schemas'],
      recommended: false,
    },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {isDesktop ? (
            <View style={styles.desktopLayout}>
              <View style={styles.sidebar}>
                <LoginFormModule
                  email={email}
                  setEmail={setEmail}
                  pass={password}
                  setPass={setPassword}
                  loading={loading}
                  handleLogin={handleLogin}
                  show={showPassword}
                  setShow={setShowPassword}
                  isDesktop={isDesktop}
                />
              </View>

              <ScrollView
                style={styles.contentScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.marketingContainer}>
                  <Animated.View entering={FadeInRight.duration(1000)}>
                    <Text style={styles.heroMainTitle}>
                      North<Text style={{ color: THEME.primary }}>Extract</Text>
                    </Text>
                    <Text style={styles.heroSubText}>
                      Autonomous High-Performance Web Intelligence System
                    </Text>
                  </Animated.View>
                  <View style={styles.heroSeparator} />

                  <Text style={styles.heroSectionTitle}>
                    SYSTEM CAPABILITIES
                  </Text>
                  <View style={styles.heroCapGrid}>
                    {capabilities.map((c, i) => (
                      <CapabilityModule
                        key={i}
                        {...c}
                        isDesktop={isDesktop}
                        index={i}
                      />
                    ))}
                  </View>

                  <View style={styles.heroSeparator} />

                  <Text style={styles.heroSectionTitle}>
                    OPERATOR HIERARCHY
                  </Text>
                  <View style={styles.heroTierRow}>
                    {tiers.map((t, i) => (
                      <ExtractionTierCard
                        key={i}
                        {...t}
                        isDesktop={isDesktop}
                        index={i}
                      />
                    ))}
                  </View>

                  <IndustrialFooter isDesktop={isDesktop} />
                </View>
              </ScrollView>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={mobileStyles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  mobileStyles.mobileActionPane,
                  { minHeight: height * 0.85 },
                ]}
              >
                <Animated.View entering={FadeInUp.duration(1000).springify()}>
                  <LoginFormModule
                    email={email}
                    setEmail={setEmail}
                    pass={password}
                    setPass={setPassword}
                    loading={loading}
                    handleLogin={handleLogin}
                    show={showPassword}
                    setShow={setShowPassword}
                    isDesktop={isDesktop}
                  />
                </Animated.View>
              </View>

              <View style={mobileStyles.mobileContentSection}>
                <Animated.View
                  entering={FadeInUp.delay(200).duration(800).springify()}
                  style={{ marginBottom: 40, alignItems: 'center' }}
                >
                  <Text
                    style={[
                      styles.heroMainTitle,
                      { fontSize: 42, lineHeight: 46, textAlign: 'center' },
                    ]}
                  >
                    North<Text style={{ color: THEME.primary }}>Extract</Text>
                  </Text>
                  <Text
                    style={[
                      styles.heroSubText,
                      { fontSize: 16, marginTop: 12, textAlign: 'center' },
                    ]}
                  >
                    Autonomous High-Performance Web Intelligence System
                  </Text>
                </Animated.View>

                <View style={styles.heroSeparator} />

                <Text
                  style={[styles.heroSectionTitle, { textAlign: 'center' }]}
                >
                  SYSTEM CAPABILITIES
                </Text>
                <View style={{ gap: 0 }}>
                  {capabilities.map((c, i) => (
                    <CapabilityModule
                      key={`mob-cap-${i}`}
                      {...c}
                      isDesktop={isDesktop}
                      index={i}
                    />
                  ))}
                </View>

                <View style={styles.heroSeparator} />

                <Text
                  style={[styles.heroSectionTitle, { textAlign: 'center' }]}
                >
                  OPERATOR HIERARCHY
                </Text>
                <View style={{ gap: 0 }}>
                  {tiers.map((t, i) => (
                    <ExtractionTierCard
                      key={`mob-tier-${i}`}
                      {...t}
                      isDesktop={isDesktop}
                      index={i}
                    />
                  ))}
                </View>

                <IndustrialFooter isDesktop={isDesktop} />
              </View>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.obsidian },

  // --- DESKTOP LAYOUT ---
  desktopLayout: { flexDirection: 'row', flex: 1 },
  sidebar: {
    width: '40%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    borderRightWidth: 1,
    borderRightColor: THEME.border,
    backgroundColor: THEME.obsidian,
    zIndex: 30,
  },
  contentScroll: { flex: 1, backgroundColor: '#010015' },
  marketingContainer: { padding: 80, paddingBottom: 120 },

  // --- LOGIN MODULE ---
  formContent: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  actionHeader: { alignItems: 'center', marginBottom: 40 },
  actionBrandBox: {
    width: 88,
    height: 88,
    backgroundColor: '#112240',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.25)',
    marginBottom: 24,
  },
  actionBrandIcon: { width: 48, height: 48, resizeMode: 'contain' },
  actionTitle: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },

  actionGlassCard: {
    padding: 32,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  actionInputLabel: {
    color: THEME.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 12,
    marginLeft: 8,
  },
  actionInputRow: {
    backgroundColor: 'rgba(2, 12, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  actionTextInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  actionInputStack: { gap: 24 },
  actionSubmitBtn: {
    backgroundColor: THEME.primary,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnLabel: {
    color: THEME.obsidian,
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: 2,
  },
  actionModeSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  actionModeSwitchText: { color: THEME.textMuted, fontSize: 15 },
  actionModeSwitchLink: { color: THEME.primary, fontWeight: '900' },
  securityTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 40,
    opacity: 0.5,
  },
  securityTagText: {
    color: THEME.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // --- HERO / MARKETING ---
  heroMainTitle: {
    color: '#FFF',
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: -4,
    fontStyle: 'italic',
  },
  heroSubText: {
    color: THEME.textMuted,
    fontSize: 22,
    lineHeight: 36,
    marginTop: 20,
    maxWidth: 680,
  },
  heroSeparator: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 64,
    opacity: 0.5,
  },
  heroSectionTitle: {
    color: THEME.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 40,
    textTransform: 'uppercase',
  },

  // CAPABILITY CARDS
  heroCapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 28 },
  capWrapper: { width: '48%', backgroundColor: 'transparent' },
  capCard: {
    padding: 32,
    borderRadius: 48,
    flexDirection: 'row',
    gap: 20,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  capIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },

  // FIX: Force wrapping on text nodes specifically
  capTitleText: {
    color: THEME.textMain,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  capDescText: {
    color: THEME.textMuted,
    fontSize: 15,
    lineHeight: 22,
    flexWrap: 'wrap',
    flexShrink: 1,
  },

  // TIER CARDS
  heroTierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  tierWrapper: { backgroundColor: 'transparent', borderRadius: 48 },
  tierInner: { padding: 40, borderRadius: 48, overflow: 'hidden' },
  tierRecommended: {
    borderColor: THEME.primary,
    borderWidth: 1,
    backgroundColor: 'rgba(100, 255, 218, 0.05)',
  },
  proBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  proBadgeText: {
    color: THEME.obsidian,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tierTitleText: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  tierSubtitleText: { color: THEME.textMuted, fontSize: 15, marginTop: 6 },
  tierDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 32,
  },
  tierFeatRow: { flexDirection: 'row', alignItems: 'flex-start' },

  // FIX: Force wrapping on text nodes specifically
  tierFeatText: {
    color: THEME.textMain,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    flexWrap: 'wrap',
    flexShrink: 1,
  },

  // FOOTER
  footerBaseContainer: {
    marginTop: 120,
    paddingTop: 80,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 50,
  },
  footerColumn: { minWidth: 160 },
  footerHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: 1,
  },
  footerLinkText: { color: THEME.textMuted, fontSize: 15, marginBottom: 16 },
  footerSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 48,
  },
  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerSocials: { flexDirection: 'row', gap: 24 },
  copyright: { color: '#4A5568', fontSize: 13 },
  versionTag: {
    color: THEME.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 6,
  },
});

const mobileStyles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: 80 },
  mobileActionPane: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mobileContentSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 20,
  },
});
