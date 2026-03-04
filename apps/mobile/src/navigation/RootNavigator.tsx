import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SearchScreen } from '../screens/SearchScreen';
import { MapScreen } from '../screens/MapScreen';
import { DetailScreen } from '../screens/DetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SearchNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="SearchList" component={SearchScreen} />
    <Stack.Screen name="Detail" component={DetailScreen} options={{ presentation: 'modal' }} />
  </Stack.Navigator>
);

const MapNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MapView" component={MapScreen} />
    <Stack.Screen name="Detail" component={DetailScreen} options={{ presentation: 'modal' }} />
  </Stack.Navigator>
);

const FavoritesScreen = () => (
  <SearchScreen />
);

const SettingsScreen = () => (
  <SearchScreen />
);

export const RootNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#FF6B6B',
      tabBarInactiveTintColor: '#999',
    }}
  >
    <Tab.Screen
      name="Search"
      component={SearchNavigator}
      options={{
        title: 'Search',
        tabBarLabel: '🔍',
      }}
    />
    <Tab.Screen
      name="Map"
      component={MapNavigator}
      options={{
        title: 'Map',
        tabBarLabel: '🗺️',
      }}
    />
    <Tab.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{
        title: 'Favorites',
        tabBarLabel: '❤️',
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: 'Settings',
        tabBarLabel: '⚙️',
      }}
    />
  </Tab.Navigator>
);
