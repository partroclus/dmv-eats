import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { SearchScreen } from '../screens/SearchScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SearchNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="SearchList" component={SearchScreen} />
  </Stack.Navigator>
);

const MapScreen = () => (
  <Text style={{ flex: 1, justifyContent: 'center' }}>Map (Day 4-5)</Text>
);

const FavoritesScreen = () => (
  <Text style={{ flex: 1, justifyContent: 'center' }}>Favorites (Day 9-10)</Text>
);

const SettingsScreen = () => (
  <Text style={{ flex: 1, justifyContent: 'center' }}>Settings (Day 13-14)</Text>
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
      component={MapScreen}
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
