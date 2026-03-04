import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Linking, ScrollView } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  totalReviews: number;
  priceLevel: number;
  cuisineTypes?: string[];
  photoUrl?: string;
  phone?: string;
  website?: string;
  distance?: number;
}

interface RestaurantBottomSheetProps {
  restaurant: Restaurant | null;
  isVisible: boolean;
  onClose: () => void;
  onDetailPress: (restaurantId: string) => void;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    color: '#000',
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginVertical: 6,
  },
  distance: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
    marginBottom: 12,
  },
  cuisineTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
  },
  cuisineTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cuisineTagText: {
    fontSize: 11,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  detailButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export const RestaurantBottomSheet: React.FC<RestaurantBottomSheetProps> = ({
  restaurant,
  isVisible,
  onClose,
  onDetailPress,
}) => {
  const snapPoints = [100, 300, 500];

  if (!restaurant) return null;

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={isVisible ? 1 : -1}
      onClose={onClose}
      enablePanDownToClose
    >
      <ScrollView style={styles.container}>
        {restaurant.photoUrl && (
          <Image source={{ uri: restaurant.photoUrl }} style={styles.photo} />
        )}

        <Text style={styles.name}>{restaurant.name}</Text>

        <Text style={styles.meta}>
          ⭐ {restaurant.rating?.toFixed(1)} ({restaurant.totalReviews} reviews)
        </Text>

        <Text style={styles.meta}>
          {'$'.repeat(restaurant.priceLevel || 2)} • {restaurant.city}, {restaurant.state}
        </Text>

        {restaurant.distance && (
          <Text style={styles.distance}>📍 {formatDistance(restaurant.distance)}</Text>
        )}

        {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
          <View style={styles.cuisineTags}>
            {restaurant.cuisineTypes.map((cuisine, idx) => (
              <View key={idx} style={styles.cuisineTag}>
                <Text style={styles.cuisineTagText}>{cuisine}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          {restaurant.phone && (
            <Pressable
              style={styles.actionButton}
              onPress={() => Linking.openURL(`tel:${restaurant.phone}`)}
            >
              <Text style={styles.actionButtonText}>📞 Call</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.actionButton}
            onPress={() =>
              Linking.openURL(
                `https://maps.apple.com/?address=${encodeURIComponent(restaurant.address)}`
              )
            }
          >
            <Text style={styles.actionButtonText}>🗺️ Directions</Text>
          </Pressable>

          {restaurant.website && (
            <Pressable
              style={styles.actionButton}
              onPress={() => Linking.openURL(restaurant.website)}
            >
              <Text style={styles.actionButtonText}>🌐 Menu</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.detailButton}
          onPress={() => onDetailPress(restaurant.id)}
        >
          <Text style={styles.detailButtonText}>See Full Details</Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
};
