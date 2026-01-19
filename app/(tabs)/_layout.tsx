// FILE: app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { Icons } from '@/components/ui/Icons';
import { AnimatedTab } from '@/components/ui/AnimatedTab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={90} tint="dark" style={styles.blur} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTab focused={focused} color={color} label="INTELLIGENCE" icon={<Icons.Cpu size={22} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTab focused={focused} color={color} label="DEPLOY" icon={<Icons.Plus size={26} color={color} />} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 34,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    borderTopWidth: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 0,
    overflow: 'hidden',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  }
});