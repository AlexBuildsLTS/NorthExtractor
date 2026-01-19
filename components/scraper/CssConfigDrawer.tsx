/**
 * ============================================================================
 * 🛠️ NORTH INTELLIGENCE OS: CSS CONFIG ENGINE V1.0 (TITAN-PRO)
 * ============================================================================
 * FEATURES:
 * - MANUAL OVERRIDE: Define custom CSS selectors for high-precision extraction.
 * - DYNAMIC MAPPING: Add/Remove selector nodes in real-time.
 * - GLASS_DRAWER: Hyper-rounded 32px geometry with obsidian depth.
 * - TYPE-SAFE SCHEMA: Directly feeds into the 'target_schema' database column.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Plus, Trash2, Crosshair, Cpu, Save } from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';

interface SelectorNode {
  id: string;
  key: string;
  selector: string;
}

interface CssConfigDrawerProps {
  onConfigSave: (config: Record<string, string>) => void;
}

export const CssConfigDrawer: React.FC<CssConfigDrawerProps> = ({
  onConfigSave,
}) => {
  const [selectors, setSelectors] = useState<SelectorNode[]>([
    { id: '1', key: 'title', selector: 'h1' },
  ]);

  const addNode = () => {
    setSelectors([
      ...selectors,
      {
        id: Math.random().toString(),
        key: '',
        selector: '',
      },
    ]);
  };

  const removeNode = (id: string) => {
    setSelectors(selectors.filter((s) => s.id !== id));
  };

  const updateNode = (id: string, field: 'key' | 'selector', value: string) => {
    setSelectors(
      selectors.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const commitToLedger = () => {
    const configMap: Record<string, string> = {};
    selectors.forEach((s) => {
      if (s.key && s.selector) configMap[s.key] = s.selector;
    });
    onConfigSave(configMap);
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Crosshair size={18} color="#4FD1C7" />
        <Text style={styles.title}>DOM TARGETING</Text>
        <TouchableOpacity onPress={addNode} style={styles.addBtn}>
          <Plus size={16} color="#020617" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.nodeList} nestedScrollEnabled>
        {selectors.map((node) => (
          <View key={node.id} style={styles.nodeRow}>
            <TextInput
              style={[styles.input, styles.keyInput]}
              value={node.key}
              onChangeText={(t) => updateNode(node.id, 'key', t)}
              placeholder="DATA"
              placeholderTextColor="#334155"
            />
            <TextInput
              style={[styles.input, styles.selectorInput]}
              value={node.selector}
              onChangeText={(t) => updateNode(node.id, 'selector', t)}
              placeholder=".css-selector"
              placeholderTextColor="#334155"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => removeNode(node.id)}>
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={commitToLedger} style={styles.saveBtn}>
        <Save size={16} color="#4FD1C7" />
        <Text style={styles.saveText}>START</Text>
      </TouchableOpacity>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 32,
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(79, 209, 199, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    flex: 1,
  },
  addBtn: { backgroundColor: '#4FD1C7', padding: 8, borderRadius: 10 },
  nodeList: { maxHeight: 200 },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  keyInput: { flex: 1 },
  selectorInput: { flex: 2 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 209, 199, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(79, 209, 199, 0.2)',
  },
  saveText: {
    color: '#4FD1C7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
