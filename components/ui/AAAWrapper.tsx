import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * AAAWRAPPER - Enterprise Layout Foundation
 * Purpose: Provides a consistent glassmorphism background and entrance 
 * animations across all screens.
 * Performance: Uses hardware-accelerated LinearGradient and Reanimated.
 */

interface AAAWrapperProps {
  children: React.ReactNode;
  style?: any;
}

export const AAAWrapper: React.FC<AAAWrapperProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Deep Space Background Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#000000']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Subtle Ambient Light Orbs for Glassmorphism depth */}
      <View 
        className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/10 rounded-full" 
        style={{ filter: 'blur(80px)' }} 
      />
      <View 
        className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-indigo-600/10 rounded-full" 
        style={{ filter: 'blur(100px)' }} 
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View 
          entering={FadeIn.duration(600)} 
          style={{ flex: 1 }}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default AAAWrapper;