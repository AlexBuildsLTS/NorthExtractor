// FILE: components/ui/Layouts.tsx
import React from 'react';
import { ViewProps } from 'react-native';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';

interface EntranceProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'down' | 'right';
}

export const Entrance = ({ children, delay = 0, direction = 'down', ...props }: EntranceProps) => {
  const animation = direction === 'down' ? FadeInDown : FadeInRight;
  return (
    <Animated.View 
      {...props}
      entering={animation.delay(delay).springify().damping(15).stiffness(100)}
      layout={Layout.springify()}
    >
      {children}
    </Animated.View>
  );
};