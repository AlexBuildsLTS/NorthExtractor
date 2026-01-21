import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Constants for animation and styling
const ANIMATION_CONFIG = {
  LIFT_DISTANCE: 8,
  SCALE_ACTIVE: 1.015,
  SCALE_INACTIVE: 1,
  BORDER_ACTIVE: 'rgba(100, 255, 218, 0.4)',
  BORDER_INACTIVE: 'rgba(255, 255, 255, 0.12)',
} as const;

const DEFAULT_INTENSITY = 25;
const CONTENT_PADDING = 20;

/**
 * Props for the GlassCard component.
 */
interface GlassCardProps {
  /** The content to display inside the card. */
  children: React.ReactNode;
  /** Optional className for additional styling using NativeWind. */
  className?: string;
  /** Intensity of the blur effect (only applies to native platforms). Defaults to 25. */
  intensity?: number;
  /** Optional additional styles using React Native StyleSheet. */
  style?: StyleProp<ViewStyle>;
  /** Visual variant of the card. */
  variant?: 'default' | 'dark' | 'elevated';
}

/**
 * A modern glassmorphism-style card component with smooth hover animations.
 * Features blurred background, animated lift effect, and elegant border styling.
 */
export const GlassCard = ({
  children,
  className = '',
  intensity = DEFAULT_INTENSITY,
  style,
  variant = 'default',
  ...props
}: GlassCardProps) => {
  // Animation values
  const lift = useSharedValue(0);

  // Animated style for lift and scale effects
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(lift.value * -ANIMATION_CONFIG.LIFT_DISTANCE) },
      { scale: withSpring(lift.value ? ANIMATION_CONFIG.SCALE_ACTIVE : ANIMATION_CONFIG.SCALE_INACTIVE) },
    ],
    borderColor: withSpring(lift.value ? ANIMATION_CONFIG.BORDER_ACTIVE : ANIMATION_CONFIG.BORDER_INACTIVE),
    shadowOpacity: withSpring(lift.value ? 0.3 : 0.15),
  }));

  // Event handlers for hover/press states
  const handleHoverIn = () => {
    lift.value = 1;
  };

  const handleHoverOut = () => {
    lift.value = 0;
  };

  // Variant styles for different visual themes
  const getVariantStyles = () => {
    const variants = {
      default: 'bg-slate-900/20 border-white/10 shadow-black/20',
      dark: 'bg-slate-950/30 border-slate-700/30 shadow-black/30',
      elevated: 'bg-white/5 border-cyan-400/20 shadow-cyan-500/10',
    };
    return variants[variant] || variants.default;
  };

  // Platform-specific blur rendering
  const BlurComponent = Platform.select({
    default: () => <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />,
    web: () => <View style={[StyleSheet.absoluteFill, styles.webFallback]} />,
  });

  return (
    <Pressable onHoverIn={handleHoverIn} onHoverOut={handleHoverOut} {...props}>
      <Animated.View
        className={`rounded-2xl overflow-hidden border backdrop-blur-xl ${getVariantStyles()} ${className}`}
        style={[styles.root, animatedStyle, style]}
      >
        <BlurComponent />
        <View style={styles.content}>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  webFallback: {
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    backdropFilter: 'blur(24px)',
  } as any,
  content: {
    padding: CONTENT_PADDING,
    position: 'relative',
    zIndex: 1,
  },
});