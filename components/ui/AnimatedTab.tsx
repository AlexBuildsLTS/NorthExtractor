// FILE: components/ui/AnimatedTab.tsx
// PURPOSE: Enterprise-grade animated tab item for the glass tab bar.
// FEATURES: Reanimated 4 scale and opacity transitions.

import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface AnimatedTabProps {
  label: string;
  icon: React.ReactNode;
  focused: boolean;
  color: string;
}

export const AnimatedTab: React.FC<AnimatedTabProps> = ({ label, icon, focused, color }) => {
  // Reanimated 4: Style changes automatically animate if we use withSpring
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.2 : 1) }],
    opacity: withSpring(focused ? 1 : 0.6),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(focused ? 0 : 10) }],
    opacity: withSpring(focused ? 1 : 0),
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {icon}
      <Animated.Text style={[styles.label, { color }, labelStyle]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
});