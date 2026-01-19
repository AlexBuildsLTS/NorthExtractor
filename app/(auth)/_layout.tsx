import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A192F' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A192F' },
          animation: 'fade',
          gestureEnabled: false, 
        }}
      >
        <Stack.Screen name="login" options={{ title: 'Sign In' }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      </Stack>
    </View>
  );
}