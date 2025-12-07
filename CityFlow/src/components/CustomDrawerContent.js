import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Importuri combinate (Context + Auth)
import { useUser } from '../context/UserContext';
import { useAuth } from '../hooks/useAuth'; 
import { logoutUser } from '../services/authService';

export default function CustomDrawerContent(props) {
  const router = useRouter();
  
  // Hook-uri combinate
  const { chatHistory } = useUser(); // Pentru istoric (Barnu)
  const { user } = useAuth();        // Pentru profil (Ciolo)

  // 1. Logica de Logout (Ciolo)
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log("Eroare la logout:", error);
    }
  };

  // 2. Logica de Chat Nou (Barnu)
  const handleNewChat = () => {
    props.navigation.closeDrawer();
    router.push('/(drawer)');
    DeviceEventEmitter.emit('RESET_CHAT');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        {/* --- A. HEADER PROFIL (De la Ciolo) --- */}
        <View style={styles.header}>
            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle-outline" size={60} color="#fff" />
            </View>
            <Text style={styles.userName}>
                {user?.email || "Vizitator CityFlow"}
            </Text>
            <Text style={styles.userEmail}>Explore & Earn</Text>
        </View>

        {/* --- B. BUTON DISCUTIE NOUA (De la Barnu) --- */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
            <Ionicons name="add-circle" size={24} color="#333" />
            <Text style={styles.newChatText}>Discuție nouă</Text>
          </TouchableOpacity>
        </View>

        {/* --- C. MENIUL STANDARD (Navigare) --- */}
        <View style={styles.menuList}>
           <DrawerItemList {...props} />
        </View>

        <View style={styles.divider} />

        {/* --- D. ISTORIC RECENT (De la Barnu) --- */}
        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>Recent</Text>
          {chatHistory.length === 0 ? (
            <Text style={styles.emptyText}>Nicio conversație recentă</Text>
          ) : (
            chatHistory.map((item) => (
              <TouchableOpacity key={item.id} style={styles.historyItem}>
                <Ionicons name="chatbubble-outline" size={18} color="#666" />
                <Text style={styles.historyText} numberOfLines={1}>
                  {item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

      </DrawerContentScrollView>

      {/* --- E. FOOTER LOGOUT (De la Ciolo) --- */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <Ionicons name="log-out-outline" size={22} color="#fff" />
                <Text style={styles.logoutText}>Deconectare</Text>
            </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Stiluri Header (Ciolo)
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#333', 
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: { marginBottom: 10 },
  userName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  userEmail: { color: '#ccc', fontSize: 12 },

  // Stiluri Actiuni & Meniu (Barnu)
  actionSection: { paddingHorizontal: 20, marginBottom: 10 },
  newChatBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E0E0E0', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 12 
  },
  newChatText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#333' },
  menuList: { marginTop: 5 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15, marginHorizontal: 20 },
  
  // Stiluri Istoric (Barnu)
  historySection: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionLabel: { marginBottom: 10, fontSize: 12, color: '#888', fontWeight: 'bold' },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  historyText: { marginLeft: 12, color: '#444', fontSize: 14 },
  emptyText: { marginLeft: 12, color: '#999', fontSize: 13, fontStyle: 'italic' },

  // Stiluri Footer (Ciolo)
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#FF3B30', 
  },
  logoutButton: { paddingVertical: 5 },
  logoutText: { fontSize: 15, marginLeft: 10, fontWeight: 'bold', color: '#fff' },
});