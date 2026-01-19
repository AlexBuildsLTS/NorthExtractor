import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Constants for animation and styling
const ANIMATION_CONFIG = {
  LIFT_DISTANCE: 12,
  SCALE_ACTIVE: 1.02,
  SCALE_INACTIVE: 1,
  BORDER_ACTIVE: 'rgba(79, 209, 199, 0.3)',
  BORDER_INACTIVE: 'rgba(255, 255, 255, 0.08)',
} as const;

const DEFAULT_INTENSITY = 20;
const CONTENT_PADDING = 24;

/**
 * Props for the GlassCard component.
 */
interface GlassCardProps {
  /** The content to display inside the card. */
  children: React.ReactNode;
  /** Optional className for additional styling using NativeWind. */
  className?: string;
  /** Intensity of the blur effect (only applies to native platforms). Defaults to 20. */
  intensity?: number;
  /** Optional additional styles using React Native StyleSheet. */
  style?: StyleProp<ViewStyle>;
}

/**
 * A glassmorphism-style card component with hover animations.
 * Provides a blurred background effect with animated lift and scale on hover.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  intensity = DEFAULT_INTENSITY,
  style,
}) => {
  const lift = useSharedValue(0);

  // Memoized animated style for performance
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(lift.value * -ANIMATION_CONFIG.LIFT_DISTANCE) },
      { scale: withSpring(lift.value ? ANIMATION_CONFIG.SCALE_ACTIVE : ANIMATION_CONFIG.SCALE_INACTIVE) },
    ],
    borderColor: withSpring(
      lift.value ? ANIMATION_CONFIG.BORDER_ACTIVE : ANIMATION_CONFIG.BORDER_INACTIVE
    ),
  }));

  // Event handlers for hover states
  const handleHoverIn = () => {
    lift.value = 1;
  };

  const handleHoverOut = () => {
    lift.value = 0;
  };

  // Platform-specific blur rendering
  const BlurComponent = Platform.select({
    default: () => <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />,
    web: () => <View style={[StyleSheet.absoluteFill, styles.webFallback]} />,
  });

  return (
    <Pressable onHoverIn={handleHoverIn} onHoverOut={handleHoverOut}>
      <Animated.View
        className={`rounded-[32px] overflow-hidden border ${className}`}
        style={[styles.root, animatedStyle, style]}
      >
        <BlurComponent />
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { backgroundColor: 'rgba(255, 255, 255, 0.01)' },
  webFallback: { backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(20px)' } as any,
  content: { padding: CONTENT_PADDING },
});