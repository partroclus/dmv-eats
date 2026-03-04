import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  section: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 12, color: '#000' },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  dietaryContainer: { gap: 8, marginBottom: 24 },
  dietaryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dietaryLabel: { fontSize: 14, color: '#333', flex: 1 },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: '#FF6B6B' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher'];

export const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggleDietary = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option]
    );
  };

  const handleComplete = () => {
    // TODO: Save user preferences + auth
    onComplete();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Find your favorite restaurants in the DMV</Text>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Email</Text>
          <View
            style={[
              styles.input,
              { borderColor: email ? '#FF6B6B' : '#ddd' },
            ]}
          >
            <Text style={{ fontSize: 14, color: email ? '#333' : '#999' }}>
              {email || 'your@email.com'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
            Dietary Restrictions
          </Text>
          <View style={styles.dietaryContainer}>
            {DIETARY_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={styles.dietaryOption}
                onPress={() => handleToggleDietary(option)}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: selected.includes(option) ? '#FF6B6B' : '#ddd',
                    backgroundColor: selected.includes(option) ? '#FF6B6B' : '#fff',
                  }}
                />
                <Text style={styles.dietaryLabel}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={handleComplete}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};
