import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter, ScrollView } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext'; // Importăm contextul

export default function CustomDrawerContent(props) {
  const router = useRouter();
  const { chatHistory } = useUser(); // Luăm istoricul din bancă

  const handleNewChat = () => {
    props.navigation.closeDrawer();
    router.push('/(drawer)');
    // Trimitem semnalul ca ChatScreen să salveze și să se reseteze
    DeviceEventEmitter.emit('RESET_CHAT');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
            <Ionicons name="add" size={24} color="#333" />
            <Text style={styles.newChatText}>Discuție nouă</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Meniu Principal</Text>
        <View style={styles.menuList}>
           <DrawerItemList {...props} />
        </View>

        <View style={styles.divider} />

        <View style={styles.historySection}>
          <Text style={styles.sectionLabel}>Recent</Text>
          
          {/* AFISARE DINAMICĂ A ISTORICULUI */}
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
      <View style={styles.footer}>
        <Text style={styles.footerText}>City Flow v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: { padding: 20, paddingTop: 50 },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E0E0', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12 },
  newChatText: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: '#333' },
  sectionLabel: { marginLeft: 20, marginTop: 15, marginBottom: 5, fontSize: 12, color: '#888', fontWeight: 'bold' },
  menuList: { marginTop: 5 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15, marginHorizontal: 20 },
  historySection: { paddingHorizontal: 20 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyText: { marginLeft: 12, color: '#444', fontSize: 14 },
  emptyText: { marginLeft: 12, color: '#999', fontSize: 13, fontStyle: 'italic', marginTop: 5 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  footerText: { color: '#AAA', fontSize: 12, textAlign: 'center' }
});