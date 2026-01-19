/**
 * =============================================================
 * 💠 NORTH EXTRACT: V29.0 PROVISIONING TERMINAL
 * =============================================================
 * Path: app/(auth)/register.tsx
 * IMPROVEMENTS:
 * - Enhanced TypeScript types for better type safety
 * - Improved error handling with state-based error messages instead of alerts
 * - Added email validation and more robust form validation
 * - Used useCallback for event handlers to optimize re-renders
 * - Extracted validation logic into separate functions
 * - Added accessibility props for better UX
 * - Performance: Memoized components and reduced inline functions
 * =============================================================
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  useWindowDimensions, StyleSheet, Image, Alert
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import {
  User, Mail, Lock, Shield, ShieldCheck, CheckCircle2,
  Server, Cpu, Database
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, ZoomIn, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { supabase } from '@/lib/supabase';

// --- INDUSTRIAL THEME (MATCHING LOGIN) ---
const THEME = {
  primary: '#64FFDA',
  obsidian: '#0A192F',
  cardBg: '#112240',
  border: '#233554',
  textMuted: '#8892B0',
  textMain: '#E6F1FF',
  error: '#FF6B6B',
} as const;

const APP_ICON = require('@/assets/icon.png');

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
}

// --- SUB-COMPONENTS DEFINED OUTSIDE ---

const AuthorizedView = React.memo(() => (
  <Animated.View entering={ZoomIn.duration(800)} exiting={FadeOut} style={styles.successWrapper}>
    <View style={styles.successBadge}><ShieldCheck size={80} color={THEME.primary} /></View>
    <Text style={styles.successTitle}>AUTHORIZED</Text>
    <Text style={styles.successSubtitle}>Operator core established. Synchronizing node terminal...</Text>
    <ActivityIndicator color={THEME.primary} style={{ marginTop: 40 }} />
  </Animated.View>
));

const MarketingPane = React.memo(() => (
  <Animated.View entering={SlideInRight.duration(800)} style={styles.marketingContent}>
    <Text style={styles.marketingSubtitle}>Connect your cluster to the NorthExtract heuristic mapping mesh.</Text>
    <View style={styles.nodeGraphic}>
      <Server size={60} color={THEME.primary} style={{ opacity: 0.3 }} />
      <View style={styles.nodeLink} />
      <Cpu size={60} color={THEME.primary} />
      <View style={styles.nodeLink} />
      <Database size={60} color={THEME.primary} style={{ opacity: 0.3 }} />
    </View>
  </Animated.View>
));

const RegisterForm = React.memo(({ form, setForm, loading, handleRegister, errors, isFormValid }: RegisterFormProps) => {
  const updateForm = useCallback((key: keyof FormState, value: string | boolean) => {
    setForm({ ...form, [key]: value });
  }, [form, setForm]);

  return (
    <View style={styles.formContainer}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.brandHeader}>
        <View style={styles.brandBox}>
          <Image source={APP_ICON} style={styles.brandIcon} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Establish Core</Text>
        <Text style={styles.subtitle}>Provision new operator identity</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(800)}>
        <GlassCard intensity={45} style={styles.provisionCard}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <View style={styles.inputBox}>
                <User size={18} color={THEME.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Jane"
                  placeholderTextColor="#475569"
                  value={form.firstName}
                  onChangeText={(t) => updateForm('firstName', t)}
                  editable={!loading}
                  accessibilityLabel="First Name"
                />
              </View>
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <View style={styles.inputBox}>
                <User size={18} color={THEME.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Doe"
                  placeholderTextColor="#475569"
                  value={form.lastName}
                  onChangeText={(t) => updateForm('lastName', t)}
                  editable={!loading}
                  accessibilityLabel="Last Name"
                />
              </View>
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>
          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Identity Email</Text>
            <View style={styles.inputBox}>
              <Mail size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="jane@core.ext"
                placeholderTextColor="#475569"
                value={form.email}
                onChangeText={(t) => updateForm('email', t)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                accessibilityLabel="Email Address"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Master Token</Text>
            <View style={styles.inputBox}>
              <Lock size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry
                value={form.pass}
                onChangeText={(t) => updateForm('pass', t)}
                editable={!loading}
                accessibilityLabel="Password"
              />
            </View>
            <PasswordStrengthIndicator password={form.pass} />
            {errors.pass && <Text style={styles.errorText}>{errors.pass}</Text>}
          </View>
          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Verify Token</Text>
            <View style={styles.inputBox}>
              <Shield size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry
                value={form.vPass}
                onChangeText={(t) => updateForm('vPass', t)}
                editable={!loading}
                accessibilityLabel="Confirm Password"
              />
            </View>
            {errors.vPass && <Text style={styles.errorText}>{errors.vPass}</Text>}
          </View>
          <TouchableOpacity
            style={styles.protocolRow}
            onPress={() => updateForm('agreed', !form.agreed)}
            disabled={loading}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: form.agreed }}
            accessibilityLabel="Accept Security Protocols"
          >
            <View style={[styles.checkbox, form.agreed && { backgroundColor: THEME.primary }]}>
              {form.agreed && <CheckCircle2 size={12} color={THEME.obsidian} />}
            </View>
            <Text style={styles.protocolText}>Accept Security Protocols</Text>
          </TouchableOpacity>
          {errors.agreed && <Text style={styles.errorText}>{errors.agreed}</Text>}
          <TouchableOpacity
            style={[styles.activateBtn, isFormValid && { backgroundColor: 'rgba(60, 153, 139, 1)', shadowColor: 'rgba(60, 153, 139, 1)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15, elevation: 15 }, (!isFormValid || loading) && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={!isFormValid || loading}
            accessibilityRole="button"
            accessibilityLabel="Create Account"

          >
            {loading ? <ActivityIndicator color={THEME.obsidian} /> : <Text style={styles.activateText}>Activate Node</Text>}
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
      </Animated.View>
    </View>
  );
});

const RegisterForm_v2 = React.memo(({ form, setForm, loading, handleRegister, errors }: RegisterFormProps) => {
  const updateForm = useCallback((key: keyof FormState, value: string | boolean) => {
    setForm({ ...form, [key]: value });
  }, [form, setForm]);

  return (
    <View style={styles.formContainer}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.brandHeader}>
        <View style={styles.brandBox}>
          <Image source={APP_ICON} style={styles.brandIcon} resizeMode="contain" /> 
        </View> 
        <Text style={styles.title}>Establish Core</Text>
        <Text style={styles.subtitle}>Provision new operator identity</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(800)}>
        <GlassCard intensity={45} style={styles.provisionCard}>
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <View style={styles.inputBox}>
                <User size={18} color={THEME.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Jane"
                  placeholderTextColor="#475569"
                  value={form.firstName}
                  onChangeText={(t) => updateForm('firstName', t)}
                  editable={!loading}
                  accessibilityLabel="First Name"
                />
              </View>
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <View style={styles.inputBox}>
                <User size={18} color={THEME.textMuted} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Doe"
                  placeholderTextColor="#475569"
                  value={form.lastName}
                  onChangeText={(t) => updateForm('lastName', t)}
                  editable={!loading}
                  accessibilityLabel="Last Name"
                />
              </View>
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>
          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Identity Email</Text>
            <View style={styles.inputBox}>
              <Mail size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="jane@core.ext"
                placeholderTextColor="#475569"
                value={form.email}
                onChangeText={(t) => updateForm('email', t)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                accessibilityLabel="Email Address"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}  
          </View>
          <TouchableOpacity
            style={[styles.activateBtn, (!form.agreed || loading) && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={!form.agreed || loading}
            accessibilityRole="button"
            accessibilityLabel="Create Account"
          >
            {loading ? <ActivityIndicator color={THEME.obsidian} /> : <Text style={styles.activateText}>Activate Node</Text>} 
            
          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Master Token</Text>
            <View style={styles.inputBox}>
              <Lock size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry
                value={form.pass}
                onChangeText={(t) => updateForm('pass', t)}
                editable={!loading}
                accessibilityLabel="Password"
              />
            </View>
            <PasswordStrengthIndicator password={form.pass} />
            {errors.pass && <Text style={styles.errorText}>{errors.pass}</Text>}
          </View>
          <View style={styles.inputSpacing}>
            <Text style={styles.fieldLabel}>Verify Token</Text>
            <View style={styles.inputBox}>
              <Shield size={18} color={THEME.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry
                value={form.vPass}
                onChangeText={(t) => updateForm('vPass', t)}
                editable={!loading}
                accessibilityLabel="Confirm Password"
              />
            </View>
            {errors.vPass && <Text style={styles.errorText}>{errors.vPass}</Text>}
          </View>
          <TouchableOpacity
            style={styles.protocolRow}
            onPress={() => updateForm('agreed', !form.agreed)}
            disabled={loading}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: form.agreed }}
            accessibilityLabel="Accept Security Protocols"
          >
            <View style={[styles.checkbox, form.agreed && { backgroundColor: THEME.primary }]}>
              {form.agreed && <CheckCircle2 size={12} color={THEME.obsidian} />}
            </View>
            <Text style={styles.protocolText}>Accept Security Protocols</Text>
          </TouchableOpacity>
          {errors.agreed && <Text style={styles.errorText}>{errors.agreed}</Text>}
            </TouchableOpacity>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already provisioned? </Text>
            <Link href="/(auth)/login" asChild><TouchableOpacity><Text style={styles.switchLink}>Sign In</Text></TouchableOpacity></Link>
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
});

export default function RegisterScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isDesktop = useMemo(() => width >= 1024, [width]);
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    pass: '',
    vPass: '',
    agreed: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = useMemo(() => {
    return form.firstName.trim() !== '' &&
           form.lastName.trim() !== '' &&
           form.email.trim() !== '' &&
           /\S+@\S+\.\S+/.test(form.email) &&
           form.pass.length >= 8 &&
           form.pass === form.vPass &&
           form.agreed;
  }, [form]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.pass) newErrors.pass = 'Password is required';
    else if (form.pass.length < 8) newErrors.pass = 'Password must be at least 8 characters';
    if (form.pass !== form.vPass) newErrors.vPass = 'Passwords do not match';
    if (!form.agreed) newErrors.agreed = 'You must accept the security protocols';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.pass,
        options: { data: { full_name: `${form.firstName.trim()} ${form.lastName.trim()}` } }
      });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 4500);
    } catch (e: any) {
      if (e.message.includes('already registered')) {
        setErrors({ email: 'This email is already registered' });
      } else {
        Alert.alert('Provisioning Failed', e.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [form, router, validateForm]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          {isDesktop ? (
            <View style={styles.desktopContainer}>
              <View style={styles.sidebar}>
                {success ? <AuthorizedView /> : <RegisterForm form={form} setForm={setForm} loading={loading} handleRegister={handleRegister} errors={errors} isFormValid={isFormValid} />}
              </View>
              <View style={styles.rightPane}><MarketingPane /></View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              <View style={[mobileStyles.mobileActionArea, { minHeight: height * 0.85 }]}>
                {success ? <AuthorizedView /> : <RegisterForm form={form} setForm={setForm} loading={loading} handleRegister={handleRegister} errors={errors} isFormValid={isFormValid} />}
              </View>
              <View style={mobileStyles.mobileMarketingArea}><MarketingPane /></View>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.obsidian },
  desktopContainer: { flexDirection: 'row', flex: 1 },
  sidebar: { width: '40%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, borderRightWidth: 1, borderRightColor: THEME.border, backgroundColor: THEME.obsidian, zIndex: 30 },
  rightPane: { flex: 1, backgroundColor: '#010015', justifyContent: 'center', padding: 64 },
  formContainer: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  brandHeader: { alignItems: 'center', marginBottom: 40 },
  brandBox: { width: 88, height: 88, backgroundColor: '#112240', borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(100, 255, 218, 0.25)', marginBottom: 24 },
  brandIcon: { width: 48, height: 48, resizeMode: 'contain' },
  title: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: -2 },
  subtitle: { color: THEME.textMuted, fontSize: 16, marginTop: 10, textAlign: 'center' },
  provisionCard: { padding: 36, borderRadius: 44, borderWidth: 1, borderColor: THEME.border, backgroundColor: 'rgba(17, 34, 64, 0.8)', overflow: 'hidden' },
  nameRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  fieldLabel: { color: THEME.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12, marginLeft: 4 },
  inputBox: { backgroundColor: THEME.obsidian, borderWidth: 1, borderColor: THEME.border, borderRadius: 18, height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22 },
  textInput: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 16 },
  inputSpacing: { marginBottom: 20 },
  protocolRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, marginBottom: 24 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  protocolText: { color: THEME.textMuted, fontSize: 14 },
  activateBtn: { backgroundColor: THEME.primary, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  activateText: { color: THEME.obsidian, fontWeight: '900', fontSize: 17, letterSpacing: 2 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, alignSelf: 'center' },
  switchText: { color: THEME.textMuted, fontSize: 15 },
  switchLink: { color: THEME.primary, fontWeight: '900' },
  successWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  successBadge: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(100, 255, 218, 0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: THEME.primary, marginBottom: 40 },
  successTitle: { color: '#FFF', fontSize: 44, fontWeight: '900', letterSpacing: 8 },
  successSubtitle: { color: THEME.textMuted, fontSize: 18, textAlign: 'center', marginTop: 20, paddingHorizontal: 40 },
  marketingContent: { alignItems: 'center' },
  marketingTitle: { color: '#FFF', fontSize: 60, fontWeight: '900', letterSpacing: -4, fontStyle: 'italic' },
  marketingSubtitle: { color: THEME.textMuted, fontSize: 22, marginTop: 20, textAlign: 'center', maxWidth: 500 },
  nodeGraphic: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 60, opacity: 0.6 },
  nodeLink: { height: 2, width: 40, backgroundColor: THEME.primary, opacity: 0.2 },
  errorText: { color: THEME.error, fontSize: 12, marginTop: 4, marginLeft: 4 }
});

const mobileStyles = StyleSheet.create({
  mobileActionArea: { justifyContent: 'center', alignItems: 'center', padding: 24, flex: 1 },
  mobileMarketingArea: { backgroundColor: '#0B1C36', padding: 32, borderTopWidth: 1, borderTopColor: THEME.border }
});