/**
 * ============================================================================
 * 💠 NORTH EXTRACT: V40.0 INDUSTRIAL IDENTITY TERMINAL (REDESIGN 4)
 * ============================================================================
 * Path: app/(auth)/login.tsx
 * ARCHITECTURE: Pinned Action Left-40% / Independent Scroll Right-60%
 * UI SPEC: AAA+ Rounded Glassmorphism / Radius 44 / High Refraction
 * FIXES: TypeScript StyleSheet errors and "Square Box" UI failure
 * ============================================================================
 */

import React, { useState, memo } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, 
  useWindowDimensions, StyleSheet, Image 
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, Activity, 
  Database, Zap, Layers, ShieldCheck, CheckCircle2, 
  Twitter, Linkedin, Facebook, Cpu, Server, Terminal, Shield
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/ui/GlassCard';

// --- INDUSTRIAL THEME ---
const THEME = {
  primary: '#64FFDA',
  obsidian: '#0A192F',
  cardBg: '#112240',
  border: '#233554',
  textMuted: '#8892B0',
  textMain: '#E6F1FF',
};

const APP_ICON = require('../../assets/icon.png');

// --- REDESIGN 4: PURE SUB-MODULES ---

const ExtractionTierCard = memo(({ title, subtitle, features, recommended, isDesktop }: any) => (
  <Animated.View entering={FadeInUp.delay(300).duration(800)} style={[styles.tierWrapper, isDesktop ? { width: '31.5%' } : { width: '100%' }]}>
    <GlassCard intensity={30} style={StyleSheet.compose(styles.tierInner, recommended ? styles.tierRecommended : {})}>
      {recommended && (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>TITAN NODE</Text>
        </View>
      )}
      <Text style={styles.tierTitleText}>{title}</Text>
      <Text style={styles.tierSubtitleText}>{subtitle}</Text>
      <View style={styles.tierDivider} />
      {features.map((f: string, i: number) => (
        <View key={i} style={styles.tierFeatRow}>
          <CheckCircle2 size={16} color={THEME.primary} />
          <Text style={styles.tierFeatText}>{f}</Text>
        </View>
      ))}
    </GlassCard>
  </Animated.View>
));

const CapabilityModule = memo(({ icon: Icon, title, desc }: any) => (
  <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.capWrapper}>
    <GlassCard intensity={45} style={styles.capCard}>
      <View style={styles.capIconContainer}>
        <Icon size={24} color={THEME.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.capTitleText}>{title}</Text>
        <Text style={styles.capDescText}>{desc}</Text>
      </View>
    </GlassCard>
  </Animated.View>
));

const IndustrialFooter = memo(() => (
  <View style={styles.footerBaseContainer}>
    <View style={styles.footerGrid}>
      <View style={styles.footerColumn}>
        <Text style={styles.footerHeader}>Network</Text>
        {['Node Clusters', 'Log Analytics', 'API Status'].map(l => (
          <TouchableOpacity key={l}><Text style={styles.footerLinkText}>{l}</Text></TouchableOpacity>
        ))}
      </View>
      <View style={styles.footerColumn}>
        <Text style={styles.footerHeader}>Resource</Text>
        {['Schema Docs', 'Extraction Registry'].map(l => (
          <TouchableOpacity key={l}><Text style={styles.footerLinkText}>{l}</Text></TouchableOpacity>
        ))}
      </View>
      <View style={styles.footerColumn}>
        <Text style={styles.footerHeader}>Legal</Text>
        {['Privacy Policy', 'Terms', 'Security'].map(l => (
          <TouchableOpacity key={l}><Text style={styles.footerLinkText}>{l}</Text></TouchableOpacity>
        ))}
      </View>
    </View>
    <View style={styles.footerSeparator} />
    <View style={styles.footerBottomRow}>
      <View>
        <Text style={styles.copyright}>© 2026 NorthExtract Autonomous Intelligence</Text>
        <Text style={styles.versionTag}>GRID PROTOCOL V5.2.4 | SECURE OPERATOR SESSION</Text>
      </View>
      <View style={styles.footerSocials}>
        <Twitter size={18} color={THEME.textMuted} />
        <Linkedin size={18} color={THEME.textMuted} />
        <Facebook size={18} color={THEME.textMuted} />
      </View>
    </View>
  </View>
));

interface LoginFormProps {
  email: string; setEmail: (v: string) => void;
  pass: string; setPass: (v: string) => void;
  loading: boolean; handleLogin: () => void;
  show: boolean; setShow: (v: boolean) => void;
}

const LoginFormModule = memo(({ email, setEmail, pass, setPass, loading, handleLogin, show, setShow }: LoginFormProps) => (
  <View style={styles.formContent}>
    <Animated.View entering={FadeInDown.duration(800)} style={styles.actionHeader}>
      <View style={styles.actionBrandBox}>
        <Image source={APP_ICON} style={styles.actionBrandIcon} />
      </View>
      <Text style={styles.actionTitle}>Welcome Back</Text>
    </Animated.View>

    {/* INDUSTRIAL FIX: Radius 44 and High Intensity */}
    <GlassCard intensity={45} style={styles.actionGlassCard}>
      <View style={styles.actionInputStack}>
        <View>
          <Text style={styles.actionInputLabel}>Email</Text>
          <View style={styles.actionInputRow}>
            <Mail size={18} color={THEME.textMuted} />
            <TextInput style={styles.actionTextInput} placeholder="operator@core.ext" placeholderTextColor="#475569" value={email} onChangeText={setEmail} autoCapitalize="none" editable={!loading} />
          </View>
        </View>

        <View>
          <Text style={styles.actionInputLabel}>Password</Text>
          <View style={styles.actionInputRow}>
            <Lock size={18} color={THEME.textMuted} />
            <TextInput style={styles.actionTextInput} placeholder="••••••••" placeholderTextColor="#475569" secureTextEntry={!show} value={pass} onChangeText={setPass} editable={!loading} />
            <TouchableOpacity onPress={() => setShow(!show)}>{show ? <EyeOff size={18} color={THEME.textMuted} /> : <Eye size={18} color={THEME.textMuted} />}</TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.actionSubmitBtn, loading && { opacity: 0.8 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={THEME.obsidian} /> : <View style={styles.actionBtnInner}><Text style={styles.actionBtnLabel}>Sign In</Text><ArrowRight size={20} color={THEME.obsidian} /></View>}
        </TouchableOpacity>

        <View style={styles.actionModeSwitchRow}>
          <Link href="/register" asChild><TouchableOpacity><Text style={styles.actionModeSwitchLink}>Create Account</Text></TouchableOpacity></Link>
        </View>
      </View>
    </GlassCard>
    
    <View style={styles.securityTagRow}>
       <Shield size={12} color={THEME.textMuted} />
       <Text style={styles.securityTagText}>NORTH-EXTRACT AES-256 ENCRYPTED GATEWAY</Text>
    </View>
  </View>
));

export default function LoginScreen() {
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return Alert.alert('Credentials Required', 'Input operator ID.');
    setLoading(true);
    try { await login(email.trim(), password); } 
    catch (e: any) { Alert.alert('Denied', e.message); } 
    finally { setLoading(false); }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          {isDesktop ? (
            <View style={styles.desktopLayout}>
              <View style={styles.sidebar}><LoginFormModule email={email} setEmail={setEmail} pass={password} setPass={setPassword} loading={loading} handleLogin={handleLogin} show={showPassword} setShow={setShowPassword} /></View>
              <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.marketingContainer}>
                  <Animated.View entering={FadeInRight.duration(1000)}>
                    <Text style={styles.heroMainTitle}>North<Text style={{ color: THEME.primary }}>Extract</Text></Text>
                    <Text style={styles.heroSubText}>Autonomous High-Performance Web Intelligence System</Text>
                  </Animated.View>
                  <View style={styles.heroSeparator} />
                  <Text style={styles.heroSectionTitle}>SYSTEM CAPABILITIES</Text>
                  <View style={styles.heroCapGrid}>
                    <CapabilityModule icon={Zap} title="Titan-2 Heuristics" desc="Real-time structural mapping for decentralized data nodes." />
                    <CapabilityModule icon={Database} title="Cluster Deployment" desc="Auto-provision extraction nodes across distributed regions." />
                    <CapabilityModule icon={Layers} title="Semantic Repair" desc="Intelligent recovery algorithms for schema drift." />
                    <CapabilityModule icon={ShieldCheck} title="Biometric Vault" desc="SecEnclave integration for credential synchronization." />
                  </View>
                  <View style={styles.heroSeparator} />
                  <Text style={styles.heroSectionTitle}>OPERATOR HIERARCHY</Text>
                  <View style={styles.heroTierRow}>
                    <ExtractionTierCard isDesktop={isDesktop} title="MEMBER" subtitle="Standard" features={['Semantic mapping', 'Daily limits']} />
                    <ExtractionTierCard isDesktop={isDesktop} title="PREMIUM" subtitle="Premium Member" recommended={true} features={['Heuristic engine', 'Self-healing']} />
                    <ExtractionTierCard isDesktop={isDesktop} title="MOD" subtitle="Enterprise Cluster" features={['Unlimited clusters', 'Expert schemas']} />
                  </View>
                  <IndustrialFooter />
                </View>
              </ScrollView>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={[mobileStyles.mobileActionPane, { minHeight: height * 0.85 }]}>
                <LoginFormModule email={email} setEmail={setEmail} pass={password} setPass={setPassword} loading={loading} handleLogin={handleLogin} show={showPassword} setShow={setShowPassword} />
              </View>
              <View style={styles.mobileMarketingPane}>
                <Text style={styles.heroMainTitle}>NorthExtract</Text>
                <IndustrialFooter />
              </View>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.obsidian },
  desktopLayout: { flexDirection: 'row', flex: 1 },
  sidebar: { width: '40%', height: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 48, borderRightWidth: 1, borderRightColor: THEME.border, backgroundColor: THEME.obsidian, zIndex: 30 },
  contentScroll: { flex: 1, backgroundColor: '#010015' },
  formContent: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  actionHeader: { alignItems: 'center', marginBottom: 40 },
  actionBrandBox: { width: 88, height: 88, backgroundColor: '#112240', borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(100, 255, 218, 0.25)', marginBottom: 24 },
  actionBrandIcon: { width: 48, height: 48, resizeMode: 'contain' },
  actionTitle: { color: '#FFF', fontSize: 40, fontWeight: '900', letterSpacing: -2 },
  actionSubtitle: { color: THEME.textMuted, fontSize: 16, marginTop: 10, textAlign: 'center' },
  actionGlassCard: { padding: 36, borderRadius: 44, borderWidth: 1, borderColor: THEME.border, backgroundColor: 'rgba(17, 34, 64, 0.8)', overflow: 'hidden' },
  actionInputLabel: { color: THEME.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12, marginLeft: 4 },
  actionInputRow: { backgroundColor: THEME.obsidian, borderWidth: 1, borderColor: THEME.border, borderRadius: 18, height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22 },
  actionTextInput: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 16 },
  actionInputStack: { gap: 20 },
  actionSubmitBtn: { backgroundColor: THEME.primary, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  actionBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtnLabel: { color: THEME.obsidian, fontWeight: '900', fontSize: 17, letterSpacing: 2 },
  actionModeSwitchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  actionModeSwitchText: { color: THEME.textMuted, fontSize: 15 },
  actionModeSwitchLink: { color: THEME.primary, fontWeight: '900' },
  securityTagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40, opacity: 0.4 },
  securityTagText: { color: THEME.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  marketingContainer: { padding: 80, paddingBottom: 120 },
  heroMainTitle: { color: '#FFF', fontSize: 60, fontWeight: '900', letterSpacing: -4, fontStyle: 'italic' },
  heroSubText: { color: THEME.textMuted, fontSize: 22, lineHeight: 36, marginTop: 20, maxWidth: 680 },
  heroSeparator: { height: 1, backgroundColor: THEME.border, marginVertical: 72 },
  heroSectionTitle: { color: THEME.primary, fontSize: 12, fontWeight: '900', letterSpacing: 5, marginBottom: 44 },
  heroCapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 28 },
  capWrapper: { width: '48%' },
  capCard: { padding: 32, borderRadius: 36, borderWidth: 1, borderColor: THEME.border, flexDirection: 'row', gap: 20, overflow: 'hidden' },
  capIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(100, 255, 218, 0.1)', alignItems: 'center', justifyContent: 'center' },
  capTitleText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  capDescText: { color: THEME.textMuted, fontSize: 15, lineHeight: 22, marginTop: 6 },
  heroTierRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20 },
  tierWrapper: { backgroundColor: '#0A192F', borderRadius: 44, borderWidth: 1, borderColor: THEME.border, overflow: 'hidden' },
  tierInner: { padding: 36 },
  tierRecommended: { borderColor: THEME.primary, backgroundColor: '#112240' },
  proBadge: { backgroundColor: THEME.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 20 },
  proBadgeText: { color: THEME.obsidian, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  tierTitleText: { color: '#FFF', fontSize: 26, fontWeight: '900' },
  tierSubtitleText: { color: THEME.textMuted, fontSize: 15, marginTop: 6 },
  tierDivider: { height: 1, backgroundColor: THEME.border, marginVertical: 28 },
  tierFeatRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  tierFeatText: { color: THEME.textMain, fontSize: 15 },
  footerBaseContainer: { marginTop: 140, paddingTop: 100, borderTopWidth: 1, borderTopColor: THEME.border },
  footerGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 50 },
  footerColumn: { minWidth: 180 },
  footerHeader: { color: '#FFF', fontSize: 17, fontWeight: '800', marginBottom: 28 },
  footerLinkText: { color: THEME.textMuted, fontSize: 16, marginBottom: 16 },
  footerSeparator: { height: 1, backgroundColor: THEME.border, marginVertical: 60 },
  footerBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerSocials: { flexDirection: 'row', gap: 24 },
  copyright: { color: '#4A5568', fontSize: 14 },
  versionTag: { color: THEME.primary, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginTop: 4 },
  mobileMarketingPane: { backgroundColor: '#0B1C36', padding: 32, borderTopWidth: 1, borderTopColor: THEME.border }
});

const mobileStyles = StyleSheet.create({
  mobileActionPane: { justifyContent: 'center', alignItems: 'center', padding: 24, flex: 1 },
});