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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';

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
  filterContainer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
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
  cuisineTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cuisineTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginTop: 4,
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
});

export const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  // Mock location (TODO: use expo-location)
  const userLocation = { lat: 38.9072, lng: -77.0369 };

  const { data: restaurants, isLoading, error } = useRestaurantSearch({
    query,
    lat: userLocation.lat,
    lng: userLocation.lng,
    cuisineType: selectedCuisine,
    priceLevel,
    minRating,
  });

  const handleRestaurantPress = (restaurantId: string) => {
    // Navigate to detail screen (TODO: implement navigation)
    console.log('Pressed restaurant:', restaurantId);
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
        style={styles.filterContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.filterRow}>
          {/* Cuisine Filter */}
          {['Sushi', 'Pizza', 'Taco', 'Italian', 'American'].map((cuisine) => (
            <Pressable
              key={cuisine}
              onPress={() =>
                setSelectedCuisine(
                  selectedCuisine === cuisine.toLowerCase() ? null : cuisine.toLowerCase()
                )
              }
              style={[
                styles.filterChip,
                selectedCuisine === cuisine.toLowerCase() && styles.filterChipActive,
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
      </ScrollView>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : restaurants && restaurants.length > 0 ? (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantCard}
          keyExtractor={(item) => item.id}
          style={styles.resultsList}
        />
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
