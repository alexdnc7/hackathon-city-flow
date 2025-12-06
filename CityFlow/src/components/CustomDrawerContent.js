// src/components/CustomDrawerContent.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';

export default function CustomDrawerContent(props) {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log("Eroare la logout:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ backgroundColor: '#fff', paddingTop: 0 }}
      >
        {/* Header-ul Meniului (Profil) */}
        <View style={styles.header}>
            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle-outline" size={60} color="#fff" />
            </View>
            <Text style={styles.userName}>
                {user?.email || "Vizitator CityFlow"}
            </Text>
            <Text style={styles.userEmail}>Explore & Earn</Text>
        </View>

        {/* Lista automată de butoane (Chat, Market) */}
        <View style={{ flex: 1, paddingTop: 10 }}>
            <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Butonul de Logout (Jos de tot) */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="log-out-outline" size={22} color="#fff" />
                <Text style={styles.logoutText}>Deconectare</Text>
            </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#333', // Sau culoarea temei tale (Verde)
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#ccc',
    fontSize: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#FF3B30', // Roșu pentru logout
  },
  logoutButton: {
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});