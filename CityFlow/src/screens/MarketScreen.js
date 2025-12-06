import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// IMPORTANT: Importăm hook-ul de la bancă.
// Asigură-te că fișierul UserContext.js există în ../context/
import { useUser } from '../context/UserContext'; 

// Baza de date fictivă (Produsele)
const MOCK_VOUCHERS = [
  {
    id: '1',
    title: 'Espresso Gratis',
    shop: 'Meron Coffee',
    cost: 100,
    color: '#FFE0B2',
    icon: 'cafe'
  },
  {
    id: '2',
    title: '50% Reducere Muzeu',
    shop: 'Muzeul de Istorie',
    cost: 250,
    color: '#C5CAE9',
    icon: 'business'
  },
  {
    id: '3',
    title: 'Limonadă cu Mentă',
    shop: 'Parcul Central',
    cost: 80,
    color: '#C8E6C9',
    icon: 'leaf'
  }
];

export default function MarketScreen() {
  // AICI ESTE SCHIMBAREA PRINCIPALĂ:
  // Nu mai folosim useState pentru coins, ci luăm datele din Context (Bancă)
  const { coins, spendCoins } = useUser(); 

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Funcția de cumpărare actualizată
  const handleBuy = (item) => {
    // Încercăm să cheltuim banii prin funcția din context
    const success = spendCoins(item.cost);

    if (success) {
      // Dacă am avut bani
      setSelectedVoucher(item);
      setModalVisible(true);
    } else {
      // Dacă nu am avut bani
      alert("You don`t have enough tokens! Complete more tasks");
    }
  };

  // Cum arată un card de produs
  const renderVoucher = ({ item }) => (
    <View style={[styles.card, { backgroundColor: item.color }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={32} color="#444" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.shopName}>{item.shop}</Text>
        <Text style={styles.voucherTitle}>{item.title}</Text>
        <Text style={styles.costText}>{item.cost} Coins</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.buyButton} 
        onPress={() => handleBuy(item)}
      >
        <Text style={styles.buyButtonText}>Cumpara</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Portofel */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portofel Digital</Text>
        <View style={styles.balanceContainer}>
          <Ionicons name="wallet-outline" size={40} color="#333" />
          <View style={{marginLeft: 10}}>
            {/* Afișăm monedele din Context */}
            <Text style={styles.balanceText}>{coins}</Text>
            <Text style={styles.currencyLabel}>CityCoins</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Lista Produse */}
      <Text style={styles.sectionTitle}>Cheltuiește inteligent</Text>
      <FlatList
        data={MOCK_VOUCHERS}
        keyExtractor={(item) => item.id}
        renderItem={renderVoucher}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Pop-up cu QR Code */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Felicitări!</Text>
            <Text style={styles.modalSubtitle}>Arată acest cod la casă:</Text>
            
            <View style={styles.qrPlaceholder}>
               <Ionicons name="qr-code-outline" size={150} color="black" />
            </View>

            <Text style={styles.voucherName}>{selectedVoucher?.title}</Text>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Închide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// Stiluri CSS-in-JS
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    paddingTop: 10 
  },
  header: { 
    padding: 20, 
    paddingTop: 10 
  },
  headerTitle: { 
    fontSize: 14, 
    color: '#888', 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  balanceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  balanceText: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: '#333',
    lineHeight: 36
  },
  currencyLabel: { 
    fontSize: 14, 
    color: '#666', 
    fontWeight: '600' 
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 20,
    marginBottom: 20
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 20, 
    marginBottom: 15,
    color: '#222'
  },
  listContent: { 
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center',
    padding: 15, 
    borderRadius: 18, 
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3 
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    padding: 10,
    borderRadius: 12,
    marginRight: 15
  },
  cardInfo: { flex: 1 },
  shopName: { fontSize: 10, opacity: 0.6, fontWeight: '700', textTransform: 'uppercase' },
  voucherTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  costText: { fontSize: 14, fontWeight: '600', color: '#555' },
  buyButton: { 
    backgroundColor: '#111', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 12 
  },
  buyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    elevation: 5
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  modalSubtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  qrPlaceholder: { marginBottom: 20 },
  voucherName: { fontSize: 18, fontWeight: '600', marginBottom: 30, textAlign: 'center' },
  closeButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});