# Week 5-6: Mobile UI Development Plan

**Goal:** Build production-ready React Native search UI with Mapbox geospatial visualization

**Timeline:** 2 weeks (14 days)
**Team Capacity:** 1 developer
**Technology:** React Native 0.83 + Expo 54 + Mapbox GL React Native

---

## 📱 Screens to Build (Priority Order)

### 1. **Search Screen** (Days 1-3)
The core discovery interface

**Components:**
- Header: "Find Restaurants" + location icon
- Search bar: Query text input with autocomplete
- Filters (collapsible):
  - Cuisine type (multi-select: Italian, Mexican, Sushi, etc.)
  - Price level ($ to $$$$)
  - Rating (min 4.0, 4.5, 5.0)
  - Distance (1km, 2km, 5km, 10km)
  - Open now toggle
- Results list: FlatList showing:
  - Restaurant name
  - Cuisine tags
  - Rating (⭐ 4.8)
  - Distance from user
  - Thumbnail photo
  - Tap to detail view

**Backend Integration:**
```typescript
// tRPC query: restaurant.search
{
  query: "sushi",
  lat: 38.9072,
  lng: -77.0369,
  cuisineTypes: ["sushi"],
  priceLevel: [1, 2],
  rating: 4.5,
  maxDistance: 5000 // meters
}
→ Returns: [Restaurant] with distance calculated
```

**UI Flow:**
- User types → Autocomplete suggestions (cities, cuisine, restaurant names)
- User selects filter → Results re-filter instantly
- User taps restaurant → Navigate to detail screen

---

### 2. **Map Screen** (Days 4-5)
Geospatial visualization with Mapbox

**Components:**
- Full-screen Mapbox GL map
- Restaurant markers (custom icons by cuisine type):
  - 🍕 Pizza
  - 🍣 Sushi
  - 🌮 Taco
  - etc.
- User location (blue dot with accuracy circle)
- Marker clustering (zoom-dependent)
- Search bar overlay (sticky at top)
- Bottom sheet: Shows selected restaurant (swipe to dismiss)

**Backend Integration:**
```typescript
// tRPC query: restaurant.nearby
{
  lat: 38.9072,
  lng: -77.0369,
  radius: 5000, // meters
  limit: 100
}
→ Returns: [Restaurant] sorted by distance
```

**Mapbox Setup:**
- Billable API key (set limit: $50/month)
- Mapbox style: light (readable with markers)
- Clustering: max zoom 15, cluster radius 50px
- Marker tap: Show restaurant card in bottom sheet

---

### 3. **Restaurant Detail Screen** (Days 6-8)
Full restaurant profile

**Components:**
- Header: Photo carousel (Yelp photos)
- Title + cuisine tags + rating
- Key info:
  - ⭐ 4.8 (492 reviews)
  - 💵 $$
  - 📍 Distance (0.8km away)
  - 🕐 Open/Closed status + hours
  - 📞 Call button (tel://)
  - 🌐 Website button (deep link)
  - 🗺️ Directions button (Apple Maps / Google Maps)
- Sections:
  - About (cuisine types, price, website)
  - Gallery (photos with attribution to Yelp)
  - Reviews (top 3 Yelp reviews + "See all")
  - Similar nearby (3-5 comparable restaurants)
- Bottom: Save button (heart icon) + Share button

**Backend Integration:**
```typescript
// tRPC query: restaurant.detail
{ restaurantId: "uuid" }
→ Returns: Restaurant with full details + reviews
```

---

### 4. **Favorites Screen** (Days 9-10)
Personal saved restaurants

**Components:**
- Empty state (no saved restaurants)
- Grid/list toggle
- Favorites list with:
  - Thumbnail
  - Name + cuisine
  - Rating
  - Swipe to remove
- "Sort by": Distance, Rating, Alphabetical

**Backend Integration:**
```typescript
// tRPC mutation: restaurant.toggleFavorite
{ restaurantId: "uuid", userId: "uuid" }

// tRPC query: user.favorites
{ userId: "uuid" }
→ Returns: [Restaurant] sorted by distance
```

---

### 5. **Onboarding / Auth Screen** (Days 11-12)
User signup + preferences

**Components:**
- Welcome screen: "Find your vibe"
- Signup: Email + password OR Apple/Google sign-in
- Preferences: Dietary restrictions (multi-select)
  - Vegetarian, Vegan, Gluten-free, etc.
- Location permission: "Allow location access?"
- Terms & privacy acceptance
- "Let's eat!" button → Main app

**Backend Integration:**
```typescript
// tRPC mutation: user.create
{
  email: "user@example.com",
  password: "hashed",
  dietaryRestrictions: ["vegetarian"],
  homeLocation: { lat, lng }
}
→ Returns: User + JWT token
```

---

### 6. **Settings Screen** (Days 13-14)
User profile & preferences

**Components:**
- User profile card (avatar, name, email)
- Preferences:
  - Dietary restrictions
  - Default sort (distance/rating)
  - Notifications (on/off)
- Account:
  - Logout
  - Delete account
  - Privacy policy
  - About app

---

## 🗺️ Mapbox Integration (Parallel with Screens 2-4)

### Setup (Day 1)

**Install packages:**
```bash
npm install react-native-mapbox-gl @mapbox/mapbox-sdk
expo install expo-location
```

**Create Mapbox token:** (set usage limit to $50/month for safety)

**Initialize map component:**
```typescript
// apps/mobile/src/components/MapView.tsx
import { MapView } from '@react-native-mapbox-gl/maps';

export const RestaurantMap = ({ restaurants, userLocation }) => {
  return (
    <MapView
      style={{ flex: 1 }}
      centerCoordinate={[userLocation.lng, userLocation.lat]}
      zoomLevel={14}
      showUserLocation
      onUserLocationUpdate={(location) => {
        // Handle location update
      }}
    >
      {/* Render clustered markers */}
      <MarkerClusterer
        restaurants={restaurants}
        onMarkerPress={handleMarkerPress}
      />
    </MapView>
  );
};
```

### Features

**Clustering (zoom-dependent):**
```typescript
{
  zoomLevel < 12: Show 50-restaurant clusters
  12 <= zoomLevel < 15: Show 10-restaurant clusters
  zoomLevel >= 15: Show individual markers
}
```

**Marker customization by cuisine:**
```typescript
const cuisineIcon = {
  sushi: require('icons/sushi.png'),
  pizza: require('icons/pizza.png'),
  taco: require('icons/taco.png'),
  // ... more
};
```

**Bottom sheet integration:**
```typescript
// When user taps marker:
1. Show restaurant card in Gorhom bottom sheet
2. Display: Name, rating, distance, call/directions buttons
3. Swipe down to dismiss
```

---

## 🔧 Implementation Checklist

### Days 1-3: Search Screen
- [ ] Create search tab in navigation
- [ ] Implement TextInput with autocomplete
- [ ] Build filter UI (cuisine, price, rating, distance)
- [ ] Create restaurant result card component
- [ ] Integrate with restaurant.search tRPC query
- [ ] Test with 50+ restaurants

### Days 4-5: Map Screen
- [ ] Install Mapbox packages
- [ ] Create MapView component
- [ ] Implement user location tracking (expo-location)
- [ ] Render markers from backend data
- [ ] Add cluster rendering
- [ ] Build bottom sheet restaurant card
- [ ] Test interactions (tap marker, zoom, pan)

### Days 6-8: Detail Screen
- [ ] Create detail screen layout
- [ ] Image carousel (react-native-carousel-view)
- [ ] Hours of operation parsing
- [ ] Call/directions/website button handlers
- [ ] Similar restaurants section
- [ ] Like/favorite toggle
- [ ] Review display

### Days 9-10: Favorites Screen
- [ ] Create favorites screen
- [ ] Implement heart toggle
- [ ] Display saved restaurants
- [ ] Sort/filter options
- [ ] Persist to database

### Days 11-12: Onboarding
- [ ] Create welcome screen
- [ ] Clerk authentication integration
- [ ] Dietary preferences form
- [ ] Location permission request
- [ ] Store in user profile

### Days 13-14: Settings
- [ ] Create settings screen
- [ ] Profile display
- [ ] Preferences UI
- [ ] Logout/account deletion

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Search Input   │
│   (User text)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ restaurant.search (tRPC)            │
│ Input: query, filters, location     │
│ Output: [Restaurant] sorted by      │
│   distance                          │
└────────┬────────────────────────────┘
         │
         ├──► Search Screen (FlatList)
         │
         ├──► Map Screen (Mapbox)
         │
         └──► Restaurant Detail
             │
             ▼
         ┌──────────────────────┐
         │ restaurant.detail    │
         │ (get full reviews)   │
         └──────────────────────┘
```

---

## 🎨 UI/UX Best Practices

**Accessibility:**
- Large touch targets (min 44px)
- High contrast (WCAG AA)
- Screen reader support

**Performance:**
- Virtualized lists (FlatList)
- Image optimization (lazy load)
- Cluster rendering for 100+ markers

**Offline Support:**
- Cache recent searches
- Cache favorite restaurants
- Queue like/favorite actions for sync

---

## 📦 Dependencies Needed

```json
{
  "@gorhom/bottom-sheet": "^4.4.0",
  "@react-native-mapbox-gl/maps": "^8.8.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "@react-navigation/native": "^6.1.0",
  "expo-location": "^16.1.0",
  "react-native-carousel-view": "^3.0.0",
  "react-native-gesture-handler": "^2.10.0",
  "react-native-reanimated": "^3.3.0",
  "zustand": "^4.3.8"
}
```

---

## ✅ Success Criteria

- [ ] All 5 core screens functional
- [ ] Map displays 100+ restaurants with clustering
- [ ] <2s load time for search results
- [ ] No console errors or warnings
- [ ] Tested on iOS + Android simulators
- [ ] Mapbox monthly bill < $50
- [ ] Favorites persist to database
- [ ] Location permission handled gracefully

---

**Status:** Ready to start Day 1
**Next Action:** Create tab navigator structure
