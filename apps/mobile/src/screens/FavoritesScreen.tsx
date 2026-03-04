import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavoritesStore } from '../store/favoritesStore';

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
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  sortButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  sortButtonText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  favoriteCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cuisines: {
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
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

type SortType = 'distance' | 'rating' | 'alphabetical';

export const FavoritesScreen = () => {
  const insets = useSafeAreaInsets();
  const { favorites, removeFavorite, clearFavorites } = useFavoritesStore();
  const [sortBy, setSortBy] = useState<SortType>('distance');

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleRemove = (restaurantId: string, name: string) => {
    Alert.alert(
      'Remove from favorites?',
      `Remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFavorite(restaurantId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (favorites.length === 0) return;
    Alert.alert(
      'Clear all favorites?',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearFavorites(),
        },
      ]
    );
  };

  if (favorites.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Saved Restaurants</Text>
          <Text style={styles.subtitle}>
            0 saved • {sortBy === 'distance' ? '📍' : sortBy === 'rating' ? '⭐' : '🔤'} {sortBy}
          </Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Save restaurants from Search or Map to see them here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Saved Restaurants</Text>
        <Text style={styles.subtitle}>
          {favorites.length} saved • {sortBy === 'distance' ? '📍' : sortBy === 'rating' ? '⭐' : '🔤'} {sortBy}
        </Text>

        <View style={styles.controls}>
          {(['distance', 'rating', 'alphabetical'] as SortType[]).map((sort) => (
            <Pressable
              key={sort}
              onPress={() => setSortBy(sort)}
              style={[
                styles.sortButton,
                sortBy === sort && styles.sortButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === sort && styles.sortButtonTextActive,
                ]}
              >
                {sort === 'distance'
                  ? '📍 Distance'
                  : sort === 'rating'
                  ? '⭐ Rating'
                  : '🔤 A-Z'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={sortedFavorites}
        renderItem={({ item }) => (
          <Pressable style={styles.favoriteCard}>
            {item.photoUrl && (
              <Image source={{ uri: item.photoUrl }} style={styles.image} />
            )}

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>

              <Text style={styles.meta}>
                ⭐ {item.rating?.toFixed(1)} {item.distance ? `• ${(item.distance / 1000).toFixed(1)}km` : ''}
              </Text>

              {item.cuisineTypes && item.cuisineTypes.length > 0 && (
                <View style={styles.cuisines}>
                  {item.cuisineTypes.slice(0, 2).map((cuisine, idx) => (
                    <View key={idx} style={styles.cuisineTag}>
                      <Text style={styles.cuisineTagText}>{cuisine}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <Pressable
              style={styles.removeButton}
              onPress={() => handleRemove(item.restaurantId, item.name)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </Pressable>
          </Pressable>
        )}
        keyExtractor={(item) => item.restaurantId}
        ListFooterComponent={
          <Pressable
            onPress={handleClearAll}
            style={{ padding: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: '600' }}>
              Clear all
            </Text>
          </Pressable>
        }
      />
    </View>
  );
};
