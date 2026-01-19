/**
 * PROJECT CRADLE: BIOMETRIC IDENTITY V5.1
 * Path: app/(tabs)/settings/profile.tsx
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Save, ArrowLeft, User, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user?.full_name?.split(' ')[0] || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (base64: string, uri: string) => {
    if (!user) return;
    setUploading(true);
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), { contentType: `image/${fileExt}`, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date().toISOString() });

      await refreshProfile();
      Alert.alert('Success', 'Biometric identity photo updated!');
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

  return (
    <SafeAreaView className="flex-1 bg-[#0A192F]">
      <ScrollView className="p-6">
        <View className="items-center mb-12">
          <View className="relative">
            <View className="w-32 h-32 rounded-full bg-[#112240] overflow-hidden border-4 border-[#4FD1C7] shadow-2xl items-center justify-center">
              {uploading ? <ActivityIndicator size="large" color="#4FD1C7" /> : 
               user?.avatar_url ? <Image source={{ uri: user.avatar_url }} className="w-full h-full" /> : 
               <User size={48} color="#8892B0" />}
            </View>
            <TouchableOpacity onPress={pickImage} className="absolute bottom-0 right-0 bg-[#4FD1C7] p-3 rounded-full border-4 border-[#0A192F]">
              <Camera size={20} color="#0A192F" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="gap-6">
          <View>
            <Text className="text-[#8892B0] mb-2 font-black text-[10px] uppercase ml-4 tracking-[3px]">Operator Name</Text>
            <View className="flex-row items-center bg-[#112240] px-6 py-5 rounded-[24px] border border-white/10">
              <User size={18} color="#4FD1C7" />
              <TextInput className="flex-1 ml-4 text-white text-lg font-medium" value={firstName} onChangeText={setFirstName} />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-10 bg-[#0A192F] border-t border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="w-full py-6 rounded-[32px] bg-[#4FD1C7] flex-row justify-center items-center shadow-2xl">
          <Save size={22} color="#0A192F" className="mr-3" />
          <Text className="text-[#0A192F] font-black text-xl uppercase italic">Save Core</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}