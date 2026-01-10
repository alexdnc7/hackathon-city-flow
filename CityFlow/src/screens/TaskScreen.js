import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useUser } from '../context/UserContext'; 

// Coordonate ȚINTĂ (Ex: Parcul Central Cluj)
// Modifică aici cu coordonatele unde vrei să trimiți utilizatorul
const TARGET_LOCATION = {
  latitude: 46.783051, 
  longitude: 23.607874,
  radius: 0.005 // Raza de aprox 500m
};

export default function TaskScreen() {
  const { /* addCoins */ } = useUser(); 
  const [loading, setLoading] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);

  // Funcția care declanșează DIRECT pop-up-ul nativ iOS/Android
  const handleValidateLocation = async () => {
    setLoading(true);

    // 1. Aici apare automat întrebarea sistemului (Nativ)
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      setLoading(false);
      Alert.alert(
        'Acces Refuzat', 
        'Nu putem valida misiunea fără locație. Te rugăm să dai Allow din setări.'
      );
      return;
    }

    // 2. Dacă a dat Allow, luăm poziția GPS
    try {
      let userLocation = await Location.getCurrentPositionAsync({});
      validateMission(userLocation.coords);
    } catch (error) {
      setLoading(false);
      Alert.alert("Eroare", "Nu am putut obține locația GPS. Verifică dacă ai GPS pornit.");
    }
  };

  // 3. Verificăm matematica (Dacă e în zonă)
  const validateMission = (coords) => {
    const latDiff = Math.abs(coords.latitude - TARGET_LOCATION.latitude);
    const longDiff = Math.abs(coords.longitude - TARGET_LOCATION.longitude);

    setLoading(false);

    // Verificăm dacă ești în raza țintei
    if (latDiff < TARGET_LOCATION.radius && longDiff < TARGET_LOCATION.radius) {
      // SUCCESS!
      setTaskCompleted(true);
      // Removed coin reward - only confirm completion
      Alert.alert("🎉 Felicitări!", "Ai ajuns la destinație. Misiune validată.");
    } else {
      // FAIL
      Alert.alert("Mai ai de mers!", "GPS-ul arată că nu ești încă în Parcul Central.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="map" size={60} color="#4A90E2" />
        <Text style={styles.title}>Misiunea Zilei</Text>
        <Text style={styles.description}>
          Mergi în Parcul Central și validează locația pentru a primi recompensă.
        </Text>
        {/* Reward display removed per UX request */}

        {taskCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.completedText}>COMPLETAT</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleValidateLocation} // Apelează direct funcția nativă
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Validează Locația</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#333' },
  description: { textAlign: 'center', color: '#666', marginVertical: 10 },
  reward: { fontSize: 28, fontWeight: 'bold', color: '#27ae60', marginBottom: 20 },
  actionButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 200,
    alignItems: 'center'
  },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  completedBadge: {
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center'
  },
  completedText: { color: 'white', fontWeight: 'bold', marginLeft: 5 }
});