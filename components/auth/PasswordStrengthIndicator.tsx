import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';

interface Props {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getStrength(password);
  
  const barStyle = useAnimatedStyle(() => {
    const colors = ['#334155', '#EF4444', '#F59E0B', '#10B981', '#64FFDA'];
    return {
      width: withTiming(`${(strength / 4) * 100}%`, { duration: 300 }),
      backgroundColor: withTiming(colors[strength] || '#334155')
    };
  });

  const Requirement = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.requirementItem}>
      <View style={[styles.checkIcon, { backgroundColor: met ? '#64FFDA' : 'rgba(255, 255, 255, 0.1)' }]}>
        {met && <Check size={10} color="#0A192F" strokeWidth={4} />}
      </View>
      <Text style={[styles.requirementText, { color: met ? '#64FFDA' : '#8892B0' }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Animated Bar */}
      <View style={styles.barContainer}>
        <Animated.View style={[{ height: '100%' }, barStyle]} />
      </View>
      
      {/* Requirements List */}
      <View style={styles.requirementsContainer}>
        <Requirement label="8+ Chars" met={password.length >= 8} />
        <Requirement label="Uppercase" met={/[A-Z]/.test(password)} />
        <Requirement label="Number" met={/[0-9]/.test(password)} />
        <Requirement label="Symbol" met={/[^A-Za-z0-9]/.test(password)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  barContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  requirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 12,
  },
  checkIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
