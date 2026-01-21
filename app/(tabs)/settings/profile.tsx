/**
 * ============================================================================
 * 👤 APEXSCRAPE: OPERATOR CONFIG (BINARY UPLOAD FIX)
 * ============================================================================
 * PATH: app/(tabs)/settings/profile.tsx
 * STATUS: PRODUCTION READY
 * FIX: Uses arrayBuffer/base64 to ensure the server receives the file body.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { User, Camera, Save, LogOut } from 'lucide-react-native';

import { GlassCard } from '@/components/ui/GlassCard';
import { MainHeader } from '@/components/ui/MainHeader';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { user, refreshIdentity, signOut } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Request base64 for reliable upload
      });

      if (result.canceled || !user) return;

      setIsUpdating(true);
      const asset = result.assets[0];
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const contentType = asset.mimeType || `image/${fileExt}`;

      let fileBody;

      if (Platform.OS === 'web') {
        // WEB: Convert Data URI to Blob
        const res = await fetch(asset.uri);
        fileBody = await res.blob();
      } else {
        // NATIVE: Decode Base64 to ArrayBuffer
        const base64 = asset.base64;
        if (!base64) throw new Error('Could not read image data');
        fileBody = decode(base64);
      }

      // 1. Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileBody, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // 3. Update DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshIdentity();
      Alert.alert('Success', 'Avatar updated.');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Upload Error', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper for Native Base64 decoding
  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      await refreshIdentity();
      Alert.alert('Success', 'Identity updated.');
    } catch (err: any) {
      Alert.alert('Sync Error', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#020617', '#0A101F', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <MainHeader title="Operator Config" />

      <View style={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#334155" />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handlePickImage}
              disabled={isUpdating}
            >
              <Camera size={16} color="#020617" />
            </TouchableOpacity>
          </View>
          <Text style={styles.roleBadge}>
            {user?.role?.toUpperCase() || 'MEMBER'}
          </Text>
        </View>

        <GlassCard style={styles.formCard}>
          <Text style={styles.label}>FULL IDENTITY NAME</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Operator Name"
            placeholderTextColor="#475569"
            editable={!isUpdating}
          />
          <Text style={styles.label}>ACCOUNT NODE ID</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{user?.id}</Text>
          </View>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdateProfile}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Save size={18} color="#020617" />
                <Text style={styles.saveText}>PATCH IDENTITY</Text>
              </>
            )}
          </TouchableOpacity>
        </GlassCard>

        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <LogOut size={18} color="#F43F5E" />
          <Text style={styles.logoutText}>TERMINATE CONNECTION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#020617' },
  container: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#4FD1C7',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4FD1C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#020617',
  },
  roleBadge: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 20,
  },
  formCard: { padding: 24, borderRadius: 32, gap: 16 },
  label: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#020617',
    padding: 16,
    borderRadius: 12,
    color: 'white',
    borderWidth: 1,
    borderColor: '#1E293B',
    fontSize: 14,
  },
  readOnlyBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 16,
    borderRadius: 12,
  },
  readOnlyText: {
    color: '#334155',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  saveBtn: {
    backgroundColor: '#4FD1C7',
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  saveText: {
    color: '#020617',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 40,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  logoutText: {
    color: '#F43F5E',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
