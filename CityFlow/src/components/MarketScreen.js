import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext'; 
// Navigare
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

const MOCK_VOUCHERS = [
  { id: '1', title: 'Espresso Gratis', shop: 'Meron Coffee', cost: 100, color: '#FFE0B2', icon: 'cafe' },
  { id: '2', title: '50% Reducere Muzeu', shop: 'Muzeul de Istorie', cost: 250, color: '#C5CAE9', icon: 'business' },
  { id: '3', title: 'Limonadă Mentă', shop: 'Parcul Central', cost: 80, color: '#C8E6C9', icon: 'leaf' }
];

export default function MarketScreen() {
  const navigation = useNavigation();
  const { coins, spendCoins } = useUser(); 
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const handleBuy = (item) => {
    if (spendCoins(item.cost)) {
      setSelectedVoucher(item);
      setModalVisible(true);
    } else {
      alert("Nu ai destule monede!");
    }
  };

  const renderVoucher = ({ item }) => (
    <View style={[styles.card, { backgroundColor: item.color }]}>
      <View style={styles.iconContainer}><Ionicons name={item.icon} size={32} color="#444" /></View>
      <View style={styles.cardInfo}>
        <Text style={styles.shopName}>{item.shop}</Text>
        <Text style={styles.voucherTitle}>{item.title}</Text>
        <Text style={styles.costText}>{item.cost} Coins</Text>
      </View>
      <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
        <Text style={styles.buyButtonText}>Cumpara</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* --- HEADER CU BUTON MENIU --- */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Rewards Market</Text>
        <View style={{width: 30}} />
      </View>

      <View style={styles.balanceSection}>
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet-outline" size={40} color="#333" />
          <View style={{marginLeft: 10}}>
            <Text style={styles.balanceText}>{coins}</Text>
            <Text style={styles.currencyLabel}>CityCoins</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Cheltuiește inteligent</Text>
      
      <FlatList
        data={MOCK_VOUCHERS}
        keyExtractor={(item) => item.id}
        renderItem={renderVoucher}
        contentContainerStyle={styles.listContent}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Felicitări!</Text>
            <Ionicons name="qr-code-outline" size={150} color="black" style={{marginVertical:20}} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, paddingTop: Platform.OS === 'android' ? 20 : 10 },
  navTitle: { fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' },
  balanceSection: { paddingHorizontal: 20, paddingBottom: 20 },
  balanceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  balanceText: { fontSize: 36, fontWeight: '800', lineHeight: 36 },
  currencyLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 20, marginBottom: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 18, marginBottom: 15, elevation: 3 },
  iconContainer: { backgroundColor: 'rgba(255,255,255,0.5)', padding: 10, borderRadius: 12, marginRight: 15 },
  cardInfo: { flex: 1 },
  shopName: { fontSize: 10, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase' },
  voucherTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  costText: { fontSize: 14, fontWeight: '600', color: '#555' },
  buyButton: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 12 },
  buyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 25, padding: 30, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  closeButton: { backgroundColor: '#333', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});