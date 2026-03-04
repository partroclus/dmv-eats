import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRestaurantDetail } from '../hooks/useRestaurantDetail';
import { PhotoCarousel } from '../components/PhotoCarousel';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  backButton: {
    fontSize: 24,
  },
  saveButton: {
    fontSize: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingValue: {
    fontWeight: '600',
    color: '#FF6B6B',
  },
  cuisineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  cuisineTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cuisineTagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    width: 80,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
  },
  primaryButtonText: {
    color: '#fff',
  },
  hoursContainer: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxHeight: 150,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 12,
  },
  hourDay: {
    fontWeight: '600',
    color: '#333',
  },
  hourTime: {
    color: '#666',
  },
  reviewContainer: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontWeight: '600',
    fontSize: 13,
    color: '#333',
  },
  reviewRating: {
    fontSize: 11,
    color: '#FF6B6B',
  },
  reviewContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

interface DetailScreenProps {
  route?: { params?: { restaurantId: string } };
}

export const DetailScreen: React.FC<DetailScreenProps> = ({ route }) => {
  const insets = useSafeAreaInsets();
  const restaurantId = route?.params?.restaurantId || '1';
  const { data: restaurant, isLoading, error } = useRestaurantDetail(restaurantId);
  const [isSaved, setIsSaved] = useState(false);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>
          {error || 'Restaurant not found'}
        </Text>
      </View>
    );
  }

  const handleCall = () => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  const handleDirections = () => {
    Linking.openURL(
      `https://maps.apple.com/?address=${encodeURIComponent(restaurant.address)}`
    );
  };

  const handleWebsite = () => {
    if (restaurant.website) {
      Linking.openURL(restaurant.website);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${restaurant.name} in ${restaurant.city}! ⭐ ${restaurant.rating.toFixed(1)}`,
        url: restaurant.website,
        title: restaurant.name,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const photos = restaurant.photoUrl
    ? [
        { url: restaurant.photoUrl, caption: restaurant.name },
        { url: restaurant.photoUrl, caption: 'Photo 2' },
        { url: restaurant.photoUrl, caption: 'Photo 3' },
      ]
    : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PhotoCarousel photos={photos} />

      <View style={[styles.header, { top: insets.top }]}>
        <Pressable onPress={() => console.log('Go back')}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Pressable onPress={() => setIsSaved(!isSaved)}>
          <Text style={styles.saveButton}>{isSaved ? '❤️' : '🤍'}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.rating}>
            <Text style={styles.ratingValue}>⭐ {restaurant.rating.toFixed(1)}</Text>
            {' '}({restaurant.totalReviews} reviews)
          </Text>
          <Text style={styles.rating}>
            {'$'.repeat(restaurant.priceLevel || 2)} · {restaurant.cuisineTypes.join(', ')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <Pressable style={styles.actionButton} onPress={handleCall}>
            <Text style={styles.actionButtonText}>📞 Call</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleDirections}>
            <Text style={styles.actionButtonText}>🗺️ Directions</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleWebsite}>
            <Text style={styles.actionButtonText}>🌐 Menu</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonText}>📤 Share</Text>
          </Pressable>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>
              {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zipCode}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{restaurant.phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Hours */}
        {restaurant.hours && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <View style={styles.hoursContainer}>
              {Object.entries(restaurant.hours).map(([day, time]) => (
                <View key={day} style={styles.hourRow}>
                  <Text style={styles.hourDay}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                  <Text style={styles.hourTime}>{time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews */}
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Reviews</Text>
            {restaurant.reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewContainer}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                <Text style={styles.reviewContent}>{review.content}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};
