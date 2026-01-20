/**
 * ============================================================================
 * 👤 NORTH INTELLIGENCE OS: BIOMETRIC IDENTITY V12.5 (TITAN-PRO)
 * ============================================================================
 * FEATURES:
 * - IMAGE UPLOAD: Restored Base64 decoding for 'avatars' bucket.
 * - METADATA SYNC: Updates 'full_name' in Supabase Profiles.
 * - ROLE HUD: Visualizes database assigned 'role' (Admin/Member).
 * - AAA UX: Hyper-rounded 32px modules with reactive upload states.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  Alert, ScrollView, ActivityIndicator, StyleSheet 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Camera, Save, ArrowLeft, User, ShieldCheck } from 'lucide-react-native';

// INTERNAL IMPORTS
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { MainHeader } from '@/components/ui/MainHeader';
import { GlassCard } from '@/components/ui/GlassCard';

export default function ProfileScreen() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [role, setRole] = useState('Member');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRole(user.role || 'Member');
    }
  }, [user]);

  const uploadAvatar = async (base64: string, uri: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), { 
          contentType: `image/${fileExt}`, 
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update Database Ledger
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      Alert.alert('Identity Verified', 'Biometric photo re-synchronized.');
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await uploadAvatar(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const handleSaveCore = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (error) throw error;
      await refreshProfile();
      Alert.alert('Core Updated', 'Ledger metadata synchronized successfully.');
    } catch (e: any) {
      Alert.alert('Update Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#020617', '#0A101F', '#020617']} style={StyleSheet.absoluteFill} />
      <MainHeader title="Identity Vault" />

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={16} color="#4FD1C7" />
          <Text style={styles.backText}>RETURN</Text>
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              {uploading ? (
                <ActivityIndicator size="large" color="#4FD1C7" />
              ) : user?.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <User size={48} color="#1E293B" />
              )}
            </View>
            <TouchableOpacity onPress={pickImage} style={styles.cameraBtn}>
              <Camera size={20} color="#020617" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.roleTag}>
             <ShieldCheck size={12} color="#4FD1C7" />
             <Text style={styles.roleText}>{role.toUpperCase()}</Text>
          </View>
        </View>

        <GlassCard style={styles.inputCard}>
          <Text style={styles.inputLabel}>OPERATOR_DESIGNATION</Text>
          <View style={styles.inputWrapper}>
             <User size={18} color="#4FD1C7" />
             <TextInput 
                style={styles.textInput} 
                value={fullName} 
                onChangeText={setFullName}
                placeholder="Enter core name"
                placeholderTextColor="#334155"
             />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCore} disabled={loading}>
            <LinearGradient 
              colors={['#4FD1C7', '#38B2AC']} 
              start={{x:0, y:0}} end={{x:1, y:0}} 
              style={styles.saveGradient}
            >
              {loading ? <ActivityIndicator color="#020617" /> : (
                <>
                   <Save size={20} color="#020617" />
                   <Text style={styles.saveBtnText}>SAVE PROFILE</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  scrollArea: { paddingHorizontal: 32, paddingBottom: 100 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  backText: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', marginLeft: 12, letterSpacing: 2 },
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#0F172A', borderWidth: 4, borderColor: '#4FD1C7', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: '#4FD1C7', shadowOpacity: 0.2, shadowRadius: 20 },
  avatarImage: { width: '100%', height: '100%' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4FD1C7', padding: 12, borderRadius: 24, borderWidth: 4, borderColor: '#020617' },
  roleTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(79, 209, 199, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 24, borderWidth: 1, borderColor: 'rgba(79, 209, 199, 0.2)' },
  roleText: { color: '#4FD1C7', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginLeft: 10 },
  inputCard: { padding: 32, borderRadius: 32 },
  inputLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 16, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', paddingHorizontal: 20, paddingVertical: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  textInput: { flex: 1, marginLeft: 16, color: 'white', fontSize: 18, fontWeight: '600' },
  saveBtn: { borderRadius: 20, overflow: 'hidden', shadowColor: '#4FD1C7', shadowOpacity: 0.3, shadowRadius: 15 },
  saveGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 22, gap: 12 },
  saveBtnText: { color: '#020617', fontWeight: '900', fontSize: 15, letterSpacing: 2, fontStyle: 'italic' }
});