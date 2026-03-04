import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';
import { formatDistance } from '../utils/geospatial';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  filterSection: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
  },
  resultsList: {
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    gap: 12,
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  restaurantMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  restaurantDistance: {
    fontSize: 11,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  cuisineTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  cuisineTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cuisineTagText: {
    fontSize: 10,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  resultsCountText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});

const CUISINES = ['Sushi', 'Pizza', 'Taco', 'Italian', 'American', 'Chinese', 'Indian', 'Thai'];
const PRICE_LEVELS = ['$', '$$', '$$$', '$$$$'];
const DISTANCES = ['1km', '2km', '5km', '10km'];
const RATINGS = ['4.0+', '4.5+', '4.8+', '5.0'];

export const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [distance, setDistance] = useState<number>(5000); // 5km default
  const [openNow, setOpenNow] = useState(false);

  // Mock location (TODO: use expo-location)
  const userLocation = { lat: 38.9072, lng: -77.0369 };

  const { data: restaurants, isLoading, error } = useRestaurantSearch({
    query,
    lat: userLocation.lat,
    lng: userLocation.lng,
    cuisineType: selectedCuisine?.toLowerCase(),
    priceLevel,
    minRating,
    maxDistance: distance,
    openNow,
  });

  const handleRestaurantPress = (restaurantId: string) => {
    console.log('Pressed restaurant:', restaurantId);
    // TODO: Navigate to detail screen
  };

  const renderRestaurantCard = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => handleRestaurantPress(item.id)}
      style={styles.restaurantCard}
    >
      {item.photoUrl && (
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.restaurantImage}
        />
      )}

      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>

        <Text style={styles.restaurantMeta}>
          ⭐ {item.rating?.toFixed(1)} ({item.totalReviews} reviews) •{' '}
          {'$'.repeat(item.priceLevel || 2)}
        </Text>

        {item.distance && (
          <Text style={styles.restaurantDistance}>
            📍 {formatDistance(item.distance)}
          </Text>
        )}

        <View style={styles.cuisineTags}>
          {item.cuisineTypes?.slice(0, 2).map((cuisine: string, idx: number) => (
            <View key={idx} style={styles.cuisineTag}>
              <Text style={styles.cuisineTagText}>{cuisine}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Header + Search */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Restaurants</Text>

        <TextInput
          style={styles.searchBar}
          placeholder="Search by name, cuisine..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      <ScrollView
        style={styles.filterSection}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Cuisine Filter */}
        <Text style={styles.filterLabel}>Cuisine</Text>
        <View style={styles.filterRow}>
          {CUISINES.map((cuisine) => (
            <Pressable
              key={cuisine}
              onPress={() =>
                setSelectedCuisine(
                  selectedCuisine === cuisine.toLowerCase()
                    ? null
                    : cuisine.toLowerCase()
                )
              }
              style={[
                styles.filterChip,
                selectedCuisine === cuisine.toLowerCase() &&
                  styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCuisine === cuisine.toLowerCase() &&
                    styles.filterChipTextActive,
                ]}
              >
                {cuisine}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Price Filter */}
        <Text style={[styles.filterLabel, { marginTop: 12 }]}>Price</Text>
        <View style={styles.filterRow}>
          {PRICE_LEVELS.map((level, idx) => (
            <Pressable
              key={level}
              onPress={() => setPriceLevel(priceLevel === idx + 1 ? null : idx + 1)}
              style={[
                styles.filterChip,
                priceLevel === idx + 1 && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  priceLevel === idx + 1 && styles.filterChipTextActive,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Rating Filter */}
        <Text style={[styles.filterLabel, { marginTop: 12 }]}>Minimum Rating</Text>
        <View style={styles.filterRow}>
          {RATINGS.map((rating) => {
            const value = parseFloat(rating);
            return (
              <Pressable
                key={rating}
                onPress={() => setMinRating(minRating === value ? null : value)}
                style={[
                  styles.filterChip,
                  minRating === value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    minRating === value && styles.filterChipTextActive,
                  ]}
                >
                  {rating}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Distance Filter */}
        <Text style={[styles.filterLabel, { marginTop: 12 }]}>Distance</Text>
        <View style={styles.filterRow}>
          {DISTANCES.map((dist) => {
            const value = parseInt(dist) * 1000;
            return (
              <Pressable
                key={dist}
                onPress={() => setDistance(value)}
                style={[
                  styles.filterChip,
                  distance === value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    distance === value && styles.filterChipTextActive,
                  ]}
                >
                  {dist}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Open Now Toggle */}
        <View style={[styles.toggleRow, { marginTop: 12 }]}>
          <Text style={styles.toggleLabel}>Open Now</Text>
          <Switch
            value={openNow}
            onValueChange={setOpenNow}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={openNow ? '#fff' : '#f0f0f0'}
          />
        </View>
      </ScrollView>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Error: {error}</Text>
        </View>
      ) : restaurants && restaurants.length > 0 ? (
        <>
          <View style={styles.resultsCount}>
            <Text style={styles.resultsCountText}>
              {restaurants.length} restaurants found
            </Text>
          </View>
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item.id}
            style={styles.resultsList}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {query ? 'No restaurants found' : 'Start searching for restaurants'}
          </Text>
        </View>
      )}
    </View>
  );
};
