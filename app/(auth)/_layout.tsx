import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NORTH_THEME } from '../../constants/theme';

/**
 * Layout component for authentication screens.
 * Provides a consistent background and navigation setup for login/register flows.
 */
export default function AuthLayout() {
  // Extracted screen options for better readability and maintainability
  const screenOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: NORTH_THEME.colors.background },
    animation: 'fade' as const,
    gestureEnabled: false,
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="login" options={{ title: 'Sign In' }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      </Stack>
    </View>
  );
}