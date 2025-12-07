// src/navigation/AppNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Importăm ecranele reale
import ChatScreen from '../screens/ChatScreen';
import MarketScreen from '../screens/MarketScreen';
// Asigură-te că ai creat componenta CustomDrawerContent la pasul anterior!
import CustomDrawerContent from '../components/CustomDrawerContent'; 

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <Drawer.Navigator
      // Aici conectăm meniu personalizat (cu profil și logout)
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // Ascundem header-ul default (folosim butoane custom în ecrane)
        drawerActiveBackgroundColor: '#333',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: { marginLeft: 0, fontWeight: '600' },
        drawerItemStyle: { borderRadius: 10, marginHorizontal: 10 },
      }}
    >
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'City Chat',
          drawerIcon: ({ color }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Market"
        component={MarketScreen}
        options={{
          title: 'Rewards Market',
          drawerIcon: ({ color }) => (
            <Ionicons name="gift-outline" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}