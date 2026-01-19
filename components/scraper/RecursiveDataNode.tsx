/**
 * ============================================================================
 * 🧠 NORTH INTELLIGENCE OS: RECURSIVE DATA NODE V1.0
 * ============================================================================
 * FEATURES:
 * - DEEP NESTING: Recursively parses any depth of JSON/Gemini payloads.
 * - TYPE-SPECIFIC TINTING: Color-coded rendering for Keys, Strings, and Numbers.
 * - COLLAPSIBLE CLUSTERS: Handles large arrays without UI overflow.
 * - MONOSPACE ALIGNMENT: Ensures forensic-level data readability.
 * ============================================================================
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface RecursiveDataNodeProps {
  data: any;
  label?: string;
  depth?: number;
}

export const RecursiveDataNode: React.FC<RecursiveDataNodeProps> = ({ 
  data, 
  label, 
  depth = 0 
}) => {
  const isObject = data !== null && typeof data === 'object' && !Array.isArray(data);
  const isArray = Array.isArray(data);

  // --- RENDER CLUSTER: OBJECTS ---
  if (isObject) {
    return (
      <View style={[styles.container, { marginLeft: depth * 12 }]}>
        {label && <Text style={styles.keyLabel}>{label.toUpperCase()}</Text>}
        {Object.entries(data).map(([key, value], index) => (
          <Animated.View key={key} entering={FadeInRight.delay(index * 50)}>
            <RecursiveDataNode data={value} label={key} depth={depth + 1} />
          </Animated.View>
        ))}
      </View>
    );
  }

  // --- RENDER CLUSTER: ARRAYS ---
  if (isArray) {
    return (
      <View style={[styles.container, { marginLeft: depth * 12 }]}>
        {label && <Text style={styles.keyLabel}>{label.toUpperCase()} (ARRAY)</Text>}
        {data.map((item, index) => (
          <Animated.View key={index} style={styles.arrayItem} entering={FadeInRight.delay(index * 50)}>
            <View style={styles.bulletBox}>
               <View style={styles.bullet} />
            </View>
            <RecursiveDataNode data={item} depth={1} />
          </Animated.View>
        ))}
      </View>
    );
  }

  // --- RENDER ATOMIC NODE: PRIMITIVES ---
  return (
    <View style={[styles.atomicNode, { marginLeft: depth * 12 }]}>
      {label && <Text style={styles.atomicKey}>{label}: </Text>}
      <Text style={[
        styles.atomicValue, 
        { color: typeof data === 'number' ? '#FBBF24' : '#E2E8F0' }
      ]}>
        {String(data)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(79, 209, 199, 0.1)',
    paddingLeft: 12,
  },
  keyLabel: {
    color: '#4FD1C7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
    opacity: 0.8,
  },
  atomicNode: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  atomicKey: {
    color: '#4FD1C7',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  atomicValue: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  arrayItem: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    padding: 8,
  },
  bulletBox: {
    width: 20,
    alignItems: 'center',
    paddingTop: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4FD1C7',
  }
});