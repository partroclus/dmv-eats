import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: '#000' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 8, textTransform: 'uppercase' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  settingLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  settingValue: { fontSize: 12, color: '#999' },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: { backgroundColor: '#ffebee' },
  dangerButtonText: { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  divider: { height: 8, backgroundColor: '#f5f5f5' },
});

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert('Delete account?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete') },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Email</Text>
            <Text style={styles.settingValue}>user@example.com</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Member Since</Text>
            <Text style={styles.settingValue}>March 2026</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#ddd', true: '#FF6B6B' }}
              thumbColor={notifications ? '#fff' : '#f0f0f0'}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Location Services</Text>
            <Switch
              value={location}
              onValueChange={setLocation}
              trackColor={{ false: '#ddd', true: '#FF6B6B' }}
              thumbColor={location ? '#fff' : '#f0f0f0'}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable style={[styles.button, styles.dangerButton]} onPress={handleLogout}>
            <Text style={styles.dangerButtonText}>Logout</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.dangerButton]} onPress={handleDeleteAccount}>
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </Pressable>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Built with</Text>
            <Text style={styles.settingValue}>React Native</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};
