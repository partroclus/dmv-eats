# Mapbox Integration Strategy

**Goal:** Deploy production-grade geospatial visualization with <500ms query times

---

## 🔑 Mapbox Setup

### 1. Account & Token

**Create Mapbox account:**
```
https://account.mapbox.com/auth/signin/
Email: adebisi_abiodun@ymail.com
```

**Generate public token:**
1. Go to Account → Tokens
2. Create new token: "DMV Eats Mobile"
3. Scopes: `maps:read`, `geospatial:read`
4. Save to `.env`:

```bash
MAPBOX_ACCESS_TOKEN=pk_live_XXX
MAPBOX_STYLE_ID=clXXXXXX (light style)
```

**Set usage limits:**
```
Maps: $50/month
Directions: $10/month
Max: $100/month safety cap
```

---

## 📊 Database Indexing for Geospatial Queries

### Current Status
✅ PostGIS enabled
✅ GiST index on (latitude, longitude)
✅ 1,000+ restaurants with coordinates

### Query Performance Test

**Nearest-neighbor query (1km radius):**
```sql
SELECT id, name, latitude, longitude,
  ST_Distance(
    ST_MakePoint(latitude, longitude)::geography,
    ST_MakePoint(38.9072, -77.0369)::geography
  ) as distance_meters
FROM "Restaurant"
WHERE ST_DWithin(
  ST_MakePoint(latitude, longitude)::geography,
  ST_MakePoint(38.9072, -77.0369)::geography,
  1000 -- 1km in meters
)
ORDER BY distance_meters
LIMIT 100;
```

**Expected time:** <100ms with GiST index ✅

### Optimization: Create specialized index

```sql
CREATE INDEX idx_restaurants_geog 
ON "Restaurant" USING GIST (
  ST_GeogFromText('SRID=4326;POINT(' || longitude || ' ' || latitude || ')')
);
```

---

## 🚀 React Native Mapbox Implementation

### Installation

```bash
cd apps/mobile

# Main Mapbox library
npm install @rnmapbox/maps

# Expo compatibility
expo install @rnmapbox/maps@10

# Location services
npm install expo-location

# Bottom sheet (for marker details)
npm install @gorhom/bottom-sheet react-native-gesture-handler

# State management (geospatial state)
npm install zustand
```

### Environment Setup

**.env.local (mobile):**
```
MAPBOX_ACCESS_TOKEN=pk_live_XXX
MAPBOX_STYLE=mapbox://styles/mapbox/light-v11
```

**Configure app.json:**
```json
{
  "plugins": [
    [
      "@rnmapbox/maps",
      {
        "RNMapboxMapsVersion": "10.0.0"
      }
    ],
    [
      "expo-location",
      {
        "locationAlwaysAndWhenInUsePermissions": "Allow $(PRODUCT_NAME) to use your location."
      }
    ]
  ]
}
```

---

## 🗺️ Map Component Architecture

### Directory Structure

```
apps/mobile/src/
├── components/
│   ├── MapView.tsx (main map container)
│   ├── MarkerClusterer.tsx (cluster rendering)
│   ├── RestaurantMarker.tsx (single marker)
│   └── BottomSheetCard.tsx (tap → detail)
├── hooks/
│   ├── useMapLocation.ts (user location)
│   ├── useRestaurantSearch.ts (tRPC search)
│   └── useMapViewport.ts (zoom/pan state)
└── utils/
    ├── mapboxHelpers.ts (clustering logic)
    └── geospatial.ts (distance calculations)
```

### MapView Component (Core)

**apps/mobile/src/components/MapView.tsx:**
```typescript
import Mapbox, { Camera } from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';
import { useRestaurantSearch } from '../hooks/useRestaurantSearch';
import { MarkerClusterer } from './MarkerClusterer';

Mapbox.setAccessToken(process.env.MAPBOX_ACCESS_TOKEN);

export const MapViewScreen = () => {
  const cameraRef = useRef<Camera>(null);
  const [viewport, setViewport] = useState({
    lat: 38.9072,
    lng: -77.0369,
    zoomLevel: 14,
  });

  const { data: restaurants, isLoading } = useRestaurantSearch({
    lat: viewport.lat,
    lng: viewport.lng,
    radius: getRadiusFromZoom(viewport.zoomLevel),
  });

  return (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={process.env.MAPBOX_STYLE}
      centerCoordinate={[viewport.lng, viewport.lat]}
      zoomLevel={viewport.zoomLevel}
      onCameraChanged={(event) => {
        const { geometry } = event;
        setViewport({
          lat: geometry.center.lat,
          lng: geometry.center.lng,
          zoomLevel: event.zoomLevel,
        });
      }}
    >
      <Camera
        ref={cameraRef}
        centerCoordinate={[viewport.lng, viewport.lat]}
        zoomLevel={viewport.zoomLevel}
      />

      {/* Clustered restaurants */}
      {!isLoading && restaurants && (
        <MarkerClusterer
          restaurants={restaurants}
          zoomLevel={viewport.zoomLevel}
        />
      )}

      {/* User location dot */}
      <UserLocationMarker />
    </Mapbox.MapView>
  );
};

function getRadiusFromZoom(zoomLevel: number): number {
  // Larger radius at lower zoom (more area visible)
  if (zoomLevel < 12) return 25000; // 25km
  if (zoomLevel < 14) return 10000; // 10km
  if (zoomLevel < 16) return 5000;  // 5km
  return 2000;                       // 2km
}
```

### MarkerClusterer Component

**apps/mobile/src/components/MarkerClusterer.tsx:**
```typescript
import Mapbox from '@rnmapbox/maps';
import { clusterRestaurants } from '../utils/mapboxHelpers';
import { RestaurantMarker } from './RestaurantMarker';

export const MarkerClusterer = ({ restaurants, zoomLevel }) => {
  const clusters = clusterRestaurants(restaurants, zoomLevel);

  return (
    <>
      {clusters.map((cluster, idx) => {
        if (cluster.type === 'cluster') {
          // Clustered markers
          return (
            <Mapbox.MarkerView
              key={`cluster-${idx}`}
              coordinate={[cluster.lng, cluster.lat]}
            >
              <ClusterBubble count={cluster.count} />
            </Mapbox.MarkerView>
          );
        } else {
          // Individual marker
          return (
            <RestaurantMarker
              key={`restaurant-${cluster.id}`}
              restaurant={cluster}
              onPress={() => handleMarkerPress(cluster)}
            />
          );
        }
      })}
    </>
  );
};

// Cluster bubble UI
const ClusterBubble = ({ count }: { count: number }) => (
  <View
    style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FF6B6B',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
      {count > 99 ? '99+' : count}
    </Text>
  </View>
);
```

### RestaurantMarker Component

**apps/mobile/src/components/RestaurantMarker.tsx:**
```typescript
import Mapbox from '@rnmapbox/maps';
import { Image, Pressable, Text, View } from 'react-native';

const cuisineIcon = {
  sushi: require('../../assets/icons/sushi.png'),
  pizza: require('../../assets/icons/pizza.png'),
  taco: require('../../assets/icons/taco.png'),
  american: require('../../assets/icons/american.png'),
  italian: require('../../assets/icons/italian.png'),
  // ... more
};

export const RestaurantMarker = ({ restaurant, onPress }) => {
  // Get cuisine type for icon
  const cuisineType = restaurant.cuisineTypes?.[0] || 'restaurant';
  const icon = cuisineIcon[cuisineType] || require('../../assets/icons/restaurant.png');

  return (
    <Mapbox.MarkerView
      coordinate={[restaurant.longitude, restaurant.latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Pressable
        onPress={() => onPress(restaurant)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#FFF',
          borderWidth: 2,
          borderColor: '#FF6B6B',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
      >
        <Image source={icon} style={{ width: 24, height: 24 }} />
      </Pressable>

      {/* Label (visible at high zoom) */}
      <View
        style={{
          marginTop: 8,
          backgroundColor: 'rgba(0,0,0,0.7)',
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        }}
      >
        <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
          {restaurant.name.slice(0, 15)}
        </Text>
      </View>
    </Mapbox.MarkerView>
  );
};
```

### Bottom Sheet Integration

**apps/mobile/src/components/BottomSheetCard.tsx:**
```typescript
import BottomSheet from '@gorhom/bottom-sheet';
import { Image, Pressable, Text, View } from 'react-native';
import { Linking } from 'react-native';

export const RestaurantBottomSheet = ({ restaurant, isVisible, onClose }) => {
  const snapPoints = [100, 300, 500];

  if (!restaurant) return null;

  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={isVisible ? 1 : -1}
      onClose={onClose}
      enablePanDownToClose
    >
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        {/* Photo */}
        {restaurant.photoUrl && (
          <Image
            source={{ uri: restaurant.photoUrl }}
            style={{ width: '100%', height: 200, borderRadius: 8 }}
          />
        )}

        {/* Name + Rating */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 12 }}>
          {restaurant.name}
        </Text>
        <Text style={{ color: '#666', marginVertical: 4 }}>
          ⭐ {restaurant.rating?.toFixed(1)} ({restaurant.totalReviews} reviews)
        </Text>

        {/* Cuisine + Price */}
        <Text style={{ color: '#888', marginBottom: 12 }}>
          {restaurant.cuisineTypes?.join(', ')} • {'$'.repeat(restaurant.priceLevel || 2)}
        </Text>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
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
                `https://maps.apple.com/?address=${restaurant.address}`
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

        {/* See More Button */}
        <Pressable
          onPress={() => navigateToDetail(restaurant.id)}
          style={styles.moreButton}
        >
          <Text style={styles.moreButtonText}>See Full Details</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
};
```

---

## 🎯 Performance Optimization

### 1. Clustering Algorithm
- Cluster at zoom < 14
- Max cluster size: 50 restaurants per cluster
- Cluster radius: 50 pixels

### 2. Query Caching
- Cache restaurants within current viewport
- Re-query only when viewport moves >20%
- Cache TTL: 5 minutes

### 3. Image Optimization
- Use Yelp thumbnail URLs (already compressed)
- Lazy load images in bottom sheet
- Placeholder images while loading

### 4. State Management (Zustand)

**apps/mobile/src/store/mapStore.ts:**
```typescript
import { create } from 'zustand';

export const useMapStore = create((set) => ({
  viewport: { lat: 38.9072, lng: -77.0369, zoomLevel: 14 },
  selectedRestaurant: null,
  setViewport: (viewport) => set({ viewport }),
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
}));
```

---

## 📈 Usage & Billing

### Free Tier (First 50K map views/month)
- Maps (50k views): Free
- Geocoding: First 600 free, then $0.50 per 1k

### Expected Usage
- 100 DAU × 3 map sessions/day = 300 sessions/day
- ~9,000 map views/month = **Free tier**

### Cost Control
- Set monthly budget cap: $50
- Monitor dashboard: account.mapbox.com/billing

---

## 🔐 Security

### API Token Best Practices
1. **Public token only** (no secret key in mobile)
2. **Token scopes:** `maps:read` only
3. **URL restrictions:** `https://dmveats.app`
4. **Monthly budget:** $50 cap

### Rate Limiting
- No rate limiting needed for maps
- Search queries: 100 req/sec (tRPC handles)

---

## ✅ Testing Checklist

- [ ] Map loads in <2s
- [ ] User location accurate (<10m)
- [ ] Markers render at all zoom levels
- [ ] Clustering works (collapse/expand)
- [ ] Tap marker → Bottom sheet
- [ ] Directions button opens Apple Maps
- [ ] Scroll performance smooth (FPS > 50)
- [ ] Tested on iPhone + Android simulators
- [ ] Offline: Map loads from cache

---

## 📚 Mapbox API Reference

**Key methods:**
```typescript
// Camera controls
mapRef.current?.setCamera({
  centerCoordinate: [lng, lat],
  zoomLevel: 15,
  duration: 300,
});

// Query features at point
const features = await mapRef.current?.querySourceFeatures('restaurants', {
  sourceLayerId: 'restaurant-layer',
});

// Add layer
mapRef.current?.setLayerProperties('restaurant-layer', {
  visibility: 'visible',
});
```

---

## 🎯 Next Steps

1. ✅ Verify restaurant data (done)
2. → Get Mapbox token (Day 1)
3. → Implement MapView component (Days 4-5)
4. → Test with live data
5. → Deploy to Expo Go for testing

**Ready to build!** 🚀
