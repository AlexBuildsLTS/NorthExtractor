/**
 * ============================================================================
 * 💠 NORTH EXTRACT: V41.0 INDUSTRIAL REGISTRATION (MOBILE OPTIMIZED)
 * ============================================================================
 * Path: app/(auth)/register.tsx
 * ARCHITECTURE:
 *   - Desktop: Split View
 *   - Mobile:  Vertical Stack (Spring Animated)
 * IMPROVEMENTS:
 *   - LAYOUT: Optimized mobile padding (24px) & gaps.
 *   - WRAPPING: Fixed text truncation with flex shrinking & minWidth.
 *   - ANIMATION: Staggered spring animations for all elements.
 *   - FORM: Glassmorphism inputs with validation states.
 * ============================================================================
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Server,
  Cpu,
  Database,
  Zap,
  Layers,
  Eye,
  EyeOff,
  ArrowRight,
  Twitter,
  Linkedin,
  Facebook,
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  ZoomIn,
  SlideInRight,
  FadeInUp,
  FadeInRight,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { supabase } from '@/lib/supabase';
import { NORTH_THEME } from '@/constants/theme';

// Fix: Declare require to avoid TypeScript error
declare const require: any;

// --- INDUSTRIAL THEME ---
const THEME = {
  primary: NORTH_THEME.colors.primary,
  obsidian: NORTH_THEME.colors.background,
  cardBg: NORTH_THEME.colors.card,
  border: NORTH_THEME.colors.border,
  textMuted: NORTH_THEME.colors.textMuted,
  textMain: '#E6F1FF',
  error: '#FF6B6B',
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const DESKTOP_BREAKPOINT = 1024;
const APP_ICON = require('../../assets/icon.png');

const ERROR_MESSAGES = {
  firstNameRequired: 'First name is required',
  lastNameRequired: 'Last name is required',
  emailRequired: 'Email is required',
  emailInvalid: 'Invalid email format',
  emailRegistered: 'This email is already registered',
  passwordRequired: 'Password is required',
  passwordTooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  passwordsMismatch: 'Passwords do not match',
  agreementRequired: 'Security protocols must be accepted',
  generalError: 'An unexpected error occurred. Please try again.',
};

// --- TYPES ---
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  pass: string;
  vPass: string;
  agreed: boolean;
}

interface RegisterFormProps {
  form: FormState;
  setForm: (form: FormState) => void;
  loading: boolean;
  handleRegister: () => void;
  errors: Record<string, string>;
  isFormValid: boolean;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  isDesktop: boolean;
}

// --- UTILITY FUNCTIONS ---
const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

const validateForm = (form: FormState): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!form.firstName.trim())
    errors.firstName = ERROR_MESSAGES.firstNameRequired;
  if (!form.lastName.trim()) errors.lastName = ERROR_MESSAGES.lastNameRequired;

  if (!form.email.trim()) {
    errors.email = ERROR_MESSAGES.emailRequired;
  } else if (!validateEmail(form.email)) {
    errors.email = ERROR_MESSAGES.emailInvalid;
  }

  if (!form.pass) {
    errors.pass = ERROR_MESSAGES.passwordRequired;
  } else if (form.pass.length < MIN_PASSWORD_LENGTH) {
    errors.pass = ERROR_MESSAGES.passwordTooShort;
  }

  if (form.pass !== form.vPass) errors.vPass = ERROR_MESSAGES.passwordsMismatch;
  if (!form.agreed) errors.agreed = ERROR_MESSAGES.agreementRequired;

  return errors;
};

// --- SUB-COMPONENTS ---

const AuthorizedView = memo(() => (
  <Animated.View
    entering={ZoomIn.duration(800)}
    exiting={FadeOut}
    style={styles.successWrapper}
  >
    <View style={styles.successBadge}>
      <ShieldCheck size={80} color={THEME.primary} />
    </View>
    <Text style={styles.successTitle}>AUTHORIZED</Text>
    <Text style={styles.successSubtitle}>
      Operator core established. Synchronizing node terminal...
    </Text>
    <ActivityIndicator color={THEME.primary} style={{ marginTop: 40 }} />
  </Animated.View>
));

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
        .damping(14)
        .mass(1.2)}
      style={[
        styles.tierWrapper,
        isDesktop ? { width: '31.5%' } : { width: '100%', marginBottom: 24 },
      ]}
    >
      {/* RESPONSIVE PADDING: Desktop 40px, Mobile 24px */}
      <GlassCard
        intensity={recommended ? 80 : 40}
        style={[
          styles.tierInner,
          recommended && styles.tierRecommended,
          !isDesktop && { padding: 24 },
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
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
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
        .damping(14)
        .mass(1.2)}
      style={[
        styles.capWrapper,
        !isDesktop && { width: '100%', marginBottom: 16 },
      ]}
    >
      {/* RESPONSIVE PADDING: Desktop 32px, Mobile 20px */}
      <GlassCard
        intensity={50}
        style={[styles.capCard, !isDesktop && { padding: 20, gap: 16 }]}
      >
        <View style={styles.capIconContainer}>
          <Icon size={24} color={THEME.primary} />
        </View>
        <View style={styles.capTextContainer}>
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
          gap: 48,
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
          gap: 32,
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
          © 2026 NorthExtract Autonomous Intelligence
        </Text>
        <Text
          style={[
            styles.versionTag,
            !isDesktop && { textAlign: 'center', marginTop: 8 },
          ]}
        >
          GRID PROTOCOL V5.2.4 | SECURE OPERATOR SESSION
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

const RegisterForm = memo(
  ({
    form,
    setForm,
    loading,
    handleRegister,
    errors,
    isFormValid,
    showPass,
    setShowPass,
    isDesktop,
  }: RegisterFormProps) => {
    const updateForm = useCallback(
      (key: keyof FormState, value: string | boolean) => {
        setForm({ ...form, [key]: value });
      },
      [form, setForm],
    );

    return (
      <View
        style={[styles.formContainer, !isDesktop && { paddingHorizontal: 0 }]}
      >
        <Animated.View
          entering={FadeInDown.duration(800).springify().damping(15)}
          style={styles.brandHeader}
        >
          <View style={styles.brandBox}>
            <Image
              source={APP_ICON}
              style={styles.brandIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Establish Core</Text>
          <Text style={styles.subtitle}>Provision new operator identity</Text>
        </Animated.View>

        <GlassCard
          intensity={70}
          style={[
            styles.provisionCard,
            !isDesktop && { padding: 24, borderRadius: 32 },
          ]}
        >
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.nameRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <View
                style={[
                  styles.inputBox,
                  errors.firstName && { borderColor: THEME.error },
                ]}
              >
                <User size={18} color={THEME.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Jane"
                  placeholderTextColor="#475569"
                  value={form.firstName}
                  onChangeText={(text) => updateForm('firstName', text)}
                  editable={!loading}
                />
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <View
                style={[
                  styles.inputBox,
                  errors.lastName && { borderColor: THEME.error },
                ]}
              >
                <User size={18} color={THEME.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Doe"
                  placeholderTextColor="#475569"
                  value={form.lastName}
                  onChangeText={(text) => updateForm('lastName', text)}
                  editable={!loading}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Identity Email</Text>
            <View
              style={[
                styles.inputBox,
                errors.email && { borderColor: THEME.error },
              ]}
            >
              <Mail size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="operator@core.ext"
                placeholderTextColor="#475569"
                value={form.email}
                onChangeText={(text) => updateForm('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Master Token</Text>
            <View
              style={[
                styles.inputBox,
                errors.pass && { borderColor: THEME.error },
              ]}
            >
              <Lock size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showPass}
                value={form.pass}
                onChangeText={(text) => updateForm('pass', text)}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                {showPass ? (
                  <EyeOff size={18} color={THEME.textMuted} />
                ) : (
                  <Eye size={18} color={THEME.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            <PasswordStrengthIndicator password={form.pass} />
          </View>

          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Verify Token</Text>
            <View
              style={[
                styles.inputBox,
                errors.vPass && { borderColor: THEME.error },
              ]}
            >
              <Shield size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showPass}
                value={form.vPass}
                onChangeText={(text) => updateForm('vPass', text)}
                editable={!loading}
              />
            </View>
            {errors.vPass && (
              <Text style={styles.errorText}>{errors.vPass}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.protocolRow}
            onPress={() => updateForm('agreed', !form.agreed)}
            disabled={loading}
          >
            <View
              style={[
                styles.checkbox,
                form.agreed && {
                  backgroundColor: THEME.primary,
                  borderColor: THEME.primary,
                },
              ]}
            >
              {form.agreed && <CheckCircle2 size={14} color={THEME.obsidian} />}
            </View>
            <Text
              style={[
                styles.protocolText,
                errors.agreed && { color: THEME.error },
              ]}
            >
              Accept Security Protocols & Terms
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.activateBtn,
              (!isFormValid || loading) && styles.activateBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={THEME.obsidian} />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.activateText}>Activate Node</Text>
                <ArrowRight size={20} color={THEME.obsidian} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already provisioned? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.switchLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </GlassCard>

        <View style={styles.securityTagRow}>
          <Shield size={12} color={THEME.textMuted} />
          <Text style={styles.securityTagText}>
            NORTH-EXTRACT AES-256 ENCRYPTED GATEWAY
          </Text>
        </View>
      </View>
    );
  },
);

// --- MAIN SCREEN ---

export default function RegisterScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    pass: '',
    vPass: '',
    agreed: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = useMemo(() => {
    return (
      form.firstName.trim() !== '' &&
      form.lastName.trim() !== '' &&
      form.email.trim() !== '' &&
      validateEmail(form.email) &&
      form.pass.length >= MIN_PASSWORD_LENGTH &&
      form.pass === form.vPass &&
      form.agreed
    );
  }, [form]);

  const handleValidation = useCallback((): boolean => {
    const newErrors = validateForm(form);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleRegister = useCallback(async () => {
    if (!handleValidation()) return;
    setLoading(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.pass,
        options: {
          data: {
            full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          },
        },
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 4500);
    } catch (e: any) {
      if (e.message?.includes('already registered')) {
        setErrors({ email: ERROR_MESSAGES.emailRegistered });
      } else {
        setErrors({ general: ERROR_MESSAGES.generalError });
      }
    } finally {
      setLoading(false);
    }
  }, [form, router, handleValidation]);

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
                {success ? (
                  <AuthorizedView />
                ) : (
                  <RegisterForm
                    form={form}
                    setForm={setForm}
                    loading={loading}
                    handleRegister={handleRegister}
                    errors={errors}
                    isFormValid={isFormValid}
                    showPass={showPass}
                    setShowPass={setShowPass}
                    isDesktop={isDesktop}
                  />
                )}
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
                {success ? (
                  <AuthorizedView />
                ) : (
                  <Animated.View entering={FadeInUp.duration(1000).springify()}>
                    <RegisterForm
                      form={form}
                      setForm={setForm}
                      loading={loading}
                      handleRegister={handleRegister}
                      errors={errors}
                      isFormValid={isFormValid}
                      showPass={showPass}
                      setShowPass={setShowPass}
                      isDesktop={isDesktop}
                    />
                  </Animated.View>
                )}
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

  // Layout
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

  // Register Form
  formContainer: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  brandHeader: { alignItems: 'center', marginBottom: 36 },
  brandBox: {
    width: 80,
    height: 80,
    backgroundColor: '#112240',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(100, 255, 218, 0.25)',
    marginBottom: 20,
  },
  brandIcon: { width: 44, height: 44, resizeMode: 'contain' },
  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    color: THEME.textMuted,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },

  // Provision Card (Glass)
  provisionCard: {
    padding: 32,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  nameRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  fieldLabel: {
    color: THEME.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
    marginLeft: 6,
  },
  inputBox: {
    backgroundColor: 'rgba(2, 12, 27, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 14,
  },
  inputSpacing: { marginBottom: 20 },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  errorText: {
    color: THEME.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
    fontWeight: '600',
  },

  // Buttons & Checkbox
  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolText: { color: THEME.textMuted, fontSize: 13, flex: 1 },

  activateBtn: {
    backgroundColor: THEME.primary,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  activateBtnDisabled: { opacity: 0.6 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activateText: {
    color: THEME.obsidian,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },

  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  switchText: { color: THEME.textMuted, fontSize: 14 },
  switchLink: { color: THEME.primary, fontWeight: '900' },

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

  // Success State
  successWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.primary,
    marginBottom: 32,
  },
  successTitle: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
  },
  successSubtitle: {
    color: THEME.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    lineHeight: 24,
  },

  // Hero & Marketing (Copied & matched from Login)
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
  },
  capTextContainer: { flex: 1, minWidth: 0 },
  capTitleText: {
    color: '#FFF',
    fontSize: 19,
    fontWeight: '800',
    flexWrap: 'wrap',
  },
  capDescText: {
    color: THEME.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    flexWrap: 'wrap',
    flexShrink: 1,
  },

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
  tierFeatRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  tierFeatText: {
    color: THEME.textMain,
    fontSize: 15,
    fontWeight: '500',
    flexWrap: 'wrap',
    lineHeight: 22,
    flexShrink: 1,
  },

  // Footer
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
