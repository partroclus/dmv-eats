import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { cuisineEmoji } from '../utils/mapboxConfig';

interface RestaurantMarkerProps {
  name: string;
  cuisineType: string;
  rating: number;
  onPress: () => void;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 80,
  },
  labelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({
  name,
  cuisineType,
  rating,
  onPress,
}) => {
  const emoji = cuisineEmoji[cuisineType.toLowerCase()] || cuisineEmoji.restaurant;

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.marker}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.label}>
        <Text style={styles.labelText}>{name.slice(0, 10)}</Text>
        <Text style={styles.labelText}>⭐ {rating.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
};
