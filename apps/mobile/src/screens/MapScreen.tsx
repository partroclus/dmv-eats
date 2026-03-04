import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapboxGL from '@rnmapbox/maps';
import { useMapLocation } from '../hooks/useMapLocation';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';
import { useMapStore } from '../store/mapStore';
import { RestaurantBottomSheet } from '../components/RestaurantBottomSheet';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_CENTER, getRadiusFromZoom } from '../utils/mapboxConfig';

MapboxGL.setAccessToken(MAPBOX_TOKEN);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  zoomButton: {
    position: 'absolute',
    right: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  zoomButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

interface Restaurant {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
  priceLevel: number;
  cuisineTypes: string[];
  address: string;
  city: string;
  state: string;
  photoUrl?: string;
  phone?: string;
  website?: string;
  distance?: number;
}

export const MapScreen = () => {
  const insets = useSafeAreaInsets();
  const { location, isLoading: locationLoading } = useMapLocation();
  const { viewport, setViewport, selectedRestaurant, setSelectedRestaurant, showBottomSheet, setShowBottomSheet } = useMapStore();

  // Get restaurants for current viewport
  const searchLocation = location || DEFAULT_CENTER;
  const radius = getRadiusFromZoom(viewport.zoomLevel);

  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurantSearch({
    lat: searchLocation.lat,
    lng: searchLocation.lng,
    maxDistance: radius,
  });

  const handleMarkerPress = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowBottomSheet(true);
  };

  const handleDetailPress = (restaurantId: string) => {
    // TODO: Navigate to detail screen
    console.log('Navigate to detail:', restaurantId);
  };

  if (locationLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
            Getting your location...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <MapboxGL.MapView
        style={styles.mapView}
        centerCoordinate={[searchLocation.lng, searchLocation.lat]}
        zoomLevel={viewport.zoomLevel}
        onCameraChanged={(event) => {
          const { geometry } = event;
          setViewport({
            lat: geometry.center.lat,
            lng: geometry.center.lng,
            zoomLevel: event.zoomLevel,
          });
        }}
        styleURL={MAPBOX_STYLE}
        showUserLocation
      >
        {/* Camera */}
        <MapboxGL.Camera
          centerCoordinate={[searchLocation.lng, searchLocation.lat]}
          zoomLevel={viewport.zoomLevel}
          animationMode="flyTo"
          animationDuration={500}
        />

        {/* User location layer */}
        <MapboxGL.UserLocation />

        {/* Restaurant markers */}
        {restaurants && restaurants.length > 0 && (
          <MapboxGL.ShapeSource
            id="restaurants"
            shape={{
              type: 'FeatureCollection',
              features: restaurants.map((r) => ({
                type: 'Feature',
                id: r.id,
                geometry: {
                  type: 'Point',
                  coordinates: [r.longitude, r.latitude],
                },
                properties: {
                  name: r.name,
                  rating: r.rating,
                  cuisineType: r.cuisineTypes[0] || 'restaurant',
                },
              })),
            }}
          >
            <MapboxGL.SymbolLayer
              id="restaurantSymbols"
              style={{
                iconImage: ['get', 'cuisineType'],
                iconSize: 0.5,
                iconAllowOverlap: true,
                textField: ['get', 'name'],
                textSize: 10,
                textAnchor: 'top',
                textOffset: [0, 1],
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>

      {/* Zoom indicator */}
      <View style={{ position: 'absolute', bottom: 100, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
          Zoom: {viewport.zoomLevel.toFixed(1)} | Showing {restaurants?.length || 0} restaurants
        </Text>
      </View>

      {/* Bottom sheet */}
      <RestaurantBottomSheet
        restaurant={selectedRestaurant}
        isVisible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        onDetailPress={handleDetailPress}
      />

      {restaurantsLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      )}
    </View>
  );
};
