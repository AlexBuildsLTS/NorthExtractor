import React, { useState } from 'react';
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
import {
  Plus,
  Trash2,
  Code,
  Database,
  ChevronRight,
} from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';
import { AAAWrapper } from '../ui/AAAWrapper';

/**
 * PRODUCTION-READY SCHEMA BUILDER
 * Purpose: Allows users to define custom JSON data structures for the AI.
 * Standards: TypeScript strict typing, Reanimated 4 transitions, Zod-ready.
 */

export interface SchemaField {
  id: string;
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
}

interface SchemaBuilderProps {
  onSchemaChange: (schema: Record<string, string>) => void;
  initialFields?: SchemaField[];
}

export const SchemaBuilder: React.FC<SchemaBuilderProps> = ({
  onSchemaChange,
  initialFields = [],
}) => {
  const [fields, setFields] = useState<SchemaField[]>(initialFields);

  const addField = () => {
    const newField: SchemaField = {
      id: Math.random().toString(36).substr(2, 9),
      key: '',
      type: 'string',
      description: '',
    };
    setFields([...fields, newField]);
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

  const updateParent = (currentFields: SchemaField[]) => {
    const schemaMap = currentFields.reduce(
      (acc, field) => {
        if (field.key) acc[field.key] = field.type;
        return acc;
      },
      {} as Record<string, string>,
    );
    onSchemaChange(schemaMap);
  };

  return (
    <AAAWrapper>
      <View className="flex-row items-center justify-between mb-4 px-2">
        <View className="flex-row items-center">
          <Database size={20} color="#60A5FA" />
          <Text className="text-white font-bold ml-2 text-lg">
            Extraction Schema
          </Text>
        </View>
        <TouchableOpacity
          onPress={addField}
          className="bg-blue-500/20 p-2 rounded-full border border-blue-500/30"
        >
          <Plus size={20} color="#60A5FA" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="max-h-[400px]"
      >
        {fields.map((field, index) => (
          <Animated.View
            key={field.id}
            entering={FadeInRight.delay(index * 100)}
            exiting={FadeOutLeft}
            layout={LinearTransition}
            className="mb-3"
          >
            <GlassCard
              intensity={15}
              className="p-4 border-l-4 border-l-blue-500"
            >
              <View className="flex-row space-between items-center mb-2">
                <TextInput
                  placeholder="Field Name (e.g. price)"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-white font-semibold text-base"
                  value={field.key}
                  onChangeText={(text) =>
                    updateField(field.id, {
                      key: text.toLowerCase().replace(/\s/g, '_'),
                    })
                  }
                />
                <TouchableOpacity onPress={() => removeField(field.id)}>
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center bg-white/5 rounded-lg p-2 mt-2">
                <Code size={14} color="#94A3B8" />
                <TextInput
                  placeholder="AI Hint (e.g. 'Look for the discounted price')"
                  placeholderTextColor="#64748B"
                  className="flex-1 text-slate-300 ml-2 text-sm"
                  value={field.description}
                  onChangeText={(text) =>
                    updateField(field.id, { description: text })
                  }
                />
              </View>

              <View className="flex-row mt-3 gap-2">
                {['string', 'number', 'array'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => updateField(field.id, { type: t as any })}
                    className={`px-3 py-1 rounded-full border ${
                      field.type === t
                        ? 'bg-blue-500 border-blue-400'
                        : 'bg-transparent border-white/10'
                    }`}
                  >
                    <Text
                      className={`text-xs capitalize ${field.type === t ? 'text-white font-bold' : 'text-slate-400'}`}
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
          <View className="items-center justify-center py-10 opacity-40">
            <Text className="text-white italic">No fields defined yet.</Text>
            <Text className="text-slate-400 text-xs">
              Click + to start building your dataset.
            </Text>
          </View>
        )}
      </ScrollView>
    </AAAWrapper>
  );
};
