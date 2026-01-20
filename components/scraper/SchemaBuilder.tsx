/**
 * ============================================================================
 * 🛠️ APEXSCRAPE: NEURAL SCHEMA ARCHITECT V100.0 (TITAN-PRO)
 * ============================================================================
 * PATH: components/scraper/SchemaBuilder.tsx
 * ARCHITECTURE:
 * - DUAL-SYNC ENGINE: Synchronizes Record<string, string> with UI SchemaField[].
 * - AAA+ UX: NativeWind + Reanimated 4 for fluid field manipulation.
 * - TYPE-STRICT: Aligned with Database['public']['Tables']['scraping_jobs'].
 * - NATIVE-FIDELITY: Uses Lucide-React-Native for terminal aesthetics.
 * ============================================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';
import { Plus, Trash2, Code, Database, Tag, Info } from 'lucide-react-native';

// UI COMPONENTS
import { GlassCard } from '../ui/GlassCard';
import { AAAWrapper } from '../ui/AAAWrapper';

export interface SchemaField {
  id: string;
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
}

interface SchemaBuilderProps {
  /** Callback triggered whenever the schema is updated */
  onSchemaChange: (schema: Record<string, string>) => void;
  /** Initial schema provided as a flat object (from database) */
  initialSchema?: Record<string, string>;
  /** Optional pre-defined UI fields */
  initialFields?: SchemaField[];
}

/**
 * PRODUCTION SCHEMA BUILDER
 * Manages the "Extraction Blueprint" used by the Scrape Engine.
 */
export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({
  onSchemaChange,
  initialSchema,
  initialFields = [],
}) => {
  // --- INITIALIZATION LOGIC ---
  // Converts initialSchema (Record) into internal Fields (Array) for UI state
  const [fields, setFields] = useState<SchemaField[]>(() => {
    if (initialSchema && Object.keys(initialSchema).length > 0) {
      return Object.entries(initialSchema).map(([key, type]) => ({
        id: Math.random().toString(36).substring(2, 9),
        key,
        type: (['string', 'number', 'boolean', 'array'].includes(type)
          ? type
          : 'string') as any,
        description: '',
      }));
    }
    return initialFields;
  });

  /**
   * SYNC ENGINE
   * Updates the parent component whenever internal fields change.
   */
  const updateParent = useCallback(
    (currentFields: SchemaField[]) => {
      const schemaMap = currentFields.reduce(
        (acc, field) => {
          if (field.key.trim()) acc[field.key.trim()] = field.type;
          return acc;
        },
        {} as Record<string, string>,
      );
      onSchemaChange(schemaMap);
    },
    [onSchemaChange],
  );

  // --- ACTIONS ---
  const addField = () => {
    const newField: SchemaField = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      type: 'string',
      description: '',
    };
    const updated = [...fields, newField];
    setFields(updated);
    updateParent(updated);
  };

  const removeField = (id: string) => {
    const updated = fields.filter((f) => f.id !== id);
    setFields(updated);
    updateParent(updated);
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFields(updated);
    updateParent(updated);
  };

  return (
    <AAAWrapper>
      {/* HEADER UNIT */}
      <View className="flex-row items-center justify-between mb-6 px-2">
        <View className="flex-row items-center">
          <Database size={20} color="#4FD1C7" />
          <View className="ml-3">
            <Text className="text-white font-black text-xs tracking-widest italic">
              EXTRACTION_BLUEPRINT
            </Text>
            <Text className="text-slate-500 text-[9px] font-bold tracking-widest mt-1">
              v1.5_TITAN_CORE
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={addField}
          activeOpacity={0.7}
          className="bg-teal-500/10 p-3 rounded-xl border border-teal-500/20"
        >
          <Plus size={20} color="#4FD1C7" />
        </TouchableOpacity>
      </View>

      {/* FIELD MATRIX */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-h-[450px]"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {fields.map((field, index) => (
          <Animated.View
            key={field.id}
            entering={FadeInRight.delay(index * 50)}
            exiting={FadeOutLeft}
            layout={LinearTransition}
            className="mb-4"
          >
            <GlassCard
              intensity={20}
              className="p-5 border-l-2 border-l-teal-500/50"
            >
              {/* PRIMARY KEY INPUT */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1 mr-4">
                  <Tag size={14} color="#4FD1C7" />
                  <TextInput
                    placeholder="JSON_KEY (e.g. product_price)"
                    placeholderTextColor="#334155"
                    className="ml-3 flex-1 text-white font-black text-sm tracking-tight"
                    value={field.key}
                    autoCapitalize="none"
                    onChangeText={(text) =>
                      updateField(field.id, {
                        key: text
                          .toLowerCase()
                          .replace(/\s/g, '_')
                          .replace(/[^a-z0-9_]/g, ''),
                      })
                    }
                  />
                </View>
                <TouchableOpacity
                  onPress={() => removeField(field.id)}
                  className="bg-rose-500/10 p-2 rounded-lg"
                >
                  <Trash2 size={16} color="#F43F5E" />
                </TouchableOpacity>
              </View>

              {/* AI HINT INPUT */}
              <View className="flex-row items-center bg-slate-900/50 rounded-xl px-4 py-3 border border-white/5 mb-4">
                <Info size={12} color="#94A3B8" />
                <TextInput
                  placeholder="Neural hint for the engine..."
                  placeholderTextColor="#475569"
                  className="flex-1 text-slate-300 ml-3 text-xs italic"
                  value={field.description}
                  onChangeText={(text) =>
                    updateField(field.id, { description: text })
                  }
                />
              </View>

              {/* TYPE SELECTOR MATRIX */}
              <View className="flex-row flex-wrap gap-2">
                {['string', 'number', 'boolean', 'array'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    activeOpacity={0.8}
                    onPress={() => updateField(field.id, { type: t as any })}
                    className={`px-4 py-2 rounded-lg border ${
                      field.type === t
                        ? 'bg-teal-500/20 border-teal-500/50'
                        : 'bg-transparent border-white/5'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black tracking-widest uppercase ${
                        field.type === t ? 'text-teal-400' : 'text-slate-600'
                      }`}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        {fields.length === 0 && (
          <View className="items-center justify-center py-16 opacity-30">
            <Code size={40} color="#475569" />
            <Text className="text-white font-black italic mt-4 tracking-tighter">
              LEDGER_EMPTY
            </Text>
            <Text className="text-slate-500 text-[10px] font-bold tracking-widest mt-2 uppercase">
              No fields defined for extraction
            </Text>
          </View>
        )}
      </ScrollView>
    </AAAWrapper>
  );
};
