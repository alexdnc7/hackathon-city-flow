import React, { useState } from 'react';
import { 
  View, Text, Modal, StyleSheet, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext'; 

export default function TaskValidator({ visible, onClose, onTaskComplete, targetCoords, targetName }) {
  const { /* addCoins */ } = useUser();
  const [loading, setLoading] = useState(false);

  // 1. Verificăm Locația
  const startValidation = async () => {
    setLoading(true);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLoading(false);
      Alert.alert('Eroare', 'Trebuie să permiți accesul la locație.');
      return;
    }

    try {
      let userLocation = await Location.getCurrentPositionAsync({});
      
      // Pentru debugging (poți șterge liniile astea mai târziu)
      console.log("User:", userLocation.coords);
      console.log("Target:", targetCoords);

      const isNearby = checkDistance(userLocation.coords);

      if (isNearby) {
        openCamera();
      } else {
        setLoading(false);
        Alert.alert("Nu ești acolo", `Mergi la ${targetName} pentru a valida.`);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Eroare GPS", "Nu am putut verifica locația.");
    }
  };

  const checkDistance = (coords) => {
    const radius = 0.005; 
    const latDiff = Math.abs(coords.latitude - targetCoords.latitude);
    const longDiff = Math.abs(coords.longitude - targetCoords.longitude);
    return latDiff < radius && longDiff < radius;
  };

  // 2. Deschidem Camera (MODIFICAT AICI)
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setLoading(false);
      Alert.alert('Eroare', 'Trebuie să permiți accesul la cameră.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      // MODIFICARE: Folosim noua sintaxă MediaType
      mediaTypes: ImagePicker.MediaType.Images, 
      allowsEditing: true,
      quality: 0.5,
    });

    setLoading(false);

    if (!result.canceled) {
      handleSuccess(result.assets[0].uri);
    }
  };

  const handleSuccess = (photoUri) => {
    // Rewarding via coins removed — only confirm success to the user
    onTaskComplete(photoUri);
    onClose();
    Alert.alert("Bravo! 🎉", "Locație verificată și poză trimisă. Mulțumim!");
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Validare Misiune</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconCircle}>
               <Ionicons name="location" size={40} color="#4A90E2" />
            </View>
            <Text style={styles.targetText}>Obiectiv: {targetName}</Text>
            <Text style={styles.instructions}>
              Aplicația va verifica GPS-ul și va deschide camera pentru a face o poză dovadă.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={startValidation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="scan-circle" size={24} color="white" style={{marginRight: 8}} />
                <Text style={styles.btnText}>Verifică & Fă Poză</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  content: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  targetText: { fontSize: 20, fontWeight: 'bold', color: '#4A90E2', marginBottom: 10 },
  instructions: { textAlign: 'center', color: '#666', lineHeight: 20 },
  actionBtn: { backgroundColor: '#333', paddingVertical: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});