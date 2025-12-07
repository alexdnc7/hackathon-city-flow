import React, { useRef, useState, useEffect } from 'react';
import { 
  FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View, 
  StatusBar, TouchableOpacity, DeviceEventEmitter, ActivityIndicator, Image,
  Modal, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import ChatBubble from '../components/ChatBubble';
import InputBar from '../components/InputBar';
import TaskValidator from '../components/TaskValidator';
import GuideCard from '../components/GuideCard';
import ItineraryCard from '../components/ItineraryCard'; 

// --- IMPORTURI NECESARE ---
import { useUser } from '../context/UserContext';
import { getCityGuide } from '../services/mockCityGuide';
import { sendChatMessage, sendToVisionAPI } from '../services/visionService'; 

const DUMMY_MESSAGES = [
  { id: '1', text: 'Salut! Sunt pregătit să explorăm orașul. Ce ai vrea să vizitezi?', sender: 'ai', type: 'text' },
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const { addToHistory } = useUser(); 
  
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [showValidator, setShowValidator] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyImageUri, setVerifyImageUri] = useState(null);
  const [verifyLocationText, setVerifyLocationText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStartTime, setLocationStartTime] = useState(null); // Track when user asked for destination
  const flatListRef = useRef();

  // --- LOGICA 0: Obține locația utilizatorului la pornire ---
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permisiuni locație refuzate');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          long: location.coords.longitude
        });
      } catch (error) {
        console.error('Eroare la obținerea locației:', error);
      }
    };
    getLocation();
  }, []);

  // --- LOGICA 1: SALVARE ISTORIC LA RESET ---
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('RESET_CHAT', () => {
      const userFirstMsg = messages.find(m => m.sender === 'user');
      const title = userFirstMsg ? userFirstMsg.text : "Conversație nouă";
      
      if (messages.length > 1) {
        addToHistory(title);
      }

      setMessages(DUMMY_MESSAGES);
    });

    return () => subscription.remove();
  }, [messages]); 

  // --- LOGICA 2: RANDARE CARD VS TEXT ---
  const renderMessageItem = ({ item }) => {
    // Dacă mesajul e de tip 'itinerary' cu 3 locuri sugerite
    if (item.type === 'itinerary') {
      return (
        <ItineraryCard 
          data={item.data} 
          onSave={() => alert("Itinerariu salvat în profil!")} 
        />
      );
    }
    // Dacă mesajul e de tip 'guide', afișăm cardul de itinerariu
    if (item.type === 'guide') {
      return (
        <GuideCard 
          data={item.data} 
          onSave={() => alert("Itinerariu salvat în profil!")} 
        />
      );
    }
    // Altfel, afișăm bula normală de chat
    return <ChatBubble message={item} />;
  };


  // --- NOU: Funcția de ales poze (Image Picker) ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Avem nevoie de permisiuni pentru a accesa galeria!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      // AICI ESTE FIX-UL: Folosim MediaTypeOptions care este mai stabilă pe mai multe versiuni
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      // Append image immediately to chat
      const photoMsg = { id: Date.now().toString(), sender: 'user', type: 'image', imageUri: uri };
      setMessages(prev => [...prev, photoMsg]);

      // Try to get last user text as location name
      const lastUserText = getLastUserText();
      if (lastUserText) {
        // Auto-verify using the last typed user text
        await runVerification(uri, lastUserText);
      } else {
        // Ask user for location name to verify
        setVerifyImageUri(uri);
        setVerifyLocationText('');
        setVerifyModalVisible(true);
      }
    }
  };

  // --- NOU: Deschide camera și trimite poza imediat în chat ---
  const takePhotoAndSend = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Avem nevoie de permisiuni pentru a folosi camera!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled) return;

    const photoUri = result.assets[0].uri;

    // 1) Adăugăm poza ca mesaj al utilizatorului imediat
    const photoMsg = { id: Date.now().toString(), sender: 'user', type: 'image', imageUri: photoUri };
    setMessages(prev => [...prev, photoMsg]);
    // 2) Auto-verify if the user recently typed a location name; otherwise ask
    const lastUserText = getLastUserText();
    if (lastUserText) {
      await runVerification(photoUri, lastUserText);
    } else {
      setVerifyImageUri(photoUri);
      setVerifyLocationText('');
      setVerifyModalVisible(true);
    }
  };

  // Helper: get last user-typed text message
  const getLastUserText = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.sender === 'user' && m.type === 'text' && m.text && m.text.trim() !== '') return m.text;
    }
    return null;
  };

  // Run verification flow and append AI response
  const runVerification = async (imageUri, locationName) => {
    try {
      setIsVerifying(true);
      const verifyResponse = await sendToVisionAPI(imageUri, locationName || '');
      
      // Dacă verificarea a reușit (Vision a confirmat locația)
      if (verifyResponse.verified) {
        // 1. Calculează durata dacă am tracking de timp
        let durationText = '';
        if (locationStartTime) {
          const now = Date.now();
          const durationMs = now - locationStartTime;
          const durationMins = Math.floor(durationMs / 60000);
          if (durationMins > 0) {
            durationText = ` în ${durationMins} minut${durationMins !== 1 ? 'e' : ''}`;
          }
        }
        
        // 2. Mesaj de confirmare cu durata
        const confirmMsg = {
          id: (Date.now()).toString(),
          text: `✓ Confirmat! Ești la ${locationName}.`,
          sender: 'ai',
          type: 'text'
        };
        setMessages((prev) => [...prev, confirmMsg]);
        
        // 3. Mesaj de felicitări motivațional
        const congratsMsg = {
          id: (Date.now() + 1).toString(),
          text: `🎉 Felicitări! Ai ajuns la ${locationName}${durationText}! Ești într-o locație minunată. Continuă explorarea!`,
          sender: 'ai',
          type: 'text'
        };
        setMessages((prev) => [...prev, congratsMsg]);
        
        // 4. Reset timer pentru următoarea destinație
        setLocationStartTime(null);
      } else {
        // Verificare eșuată
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: verifyResponse.message || 'Imagine analizată.',
          sender: 'ai',
          type: 'text'
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    } catch (err) {
      console.error('Eroare la verificare:', err);
      const errMsg = { id: (Date.now() + 1).toString(), text: 'Eroare la verificarea imaginii.', sender: 'ai', type: 'text' };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsVerifying(false);
      setVerifyModalVisible(false);
      setVerifyImageUri(null);
      setVerifyLocationText('');
    }
  };

  const handleVerifyConfirm = async () => {
    if (!verifyImageUri) return setVerifyModalVisible(false);
    await runVerification(verifyImageUri, verifyLocationText);
  };

  const handleVerifyCancel = () => {
    setVerifyModalVisible(false);
    setVerifyImageUri(null);
    setVerifyLocationText('');
  };


  // --- LOGICA 3: AI BRAIN (Conectare la Backend) ---
  const handleSend = async (text) => {
    // Verificare: trebuie să existe text SAU imagine
    if (!text.trim() && !selectedImage) return;

    // 1. Pregătim mesajul Userului
    const userMsg = { 
      id: Date.now().toString(), 
      text: text, 
      sender: 'user', 
      type: 'text',
      imageUri: selectedImage
    };

    setMessages((prev) => [...prev, userMsg]);
    
    // 2. Salvăm istoricul și resetăm input-ul
    if (text) addToHistory(text); 
    const textToSend = text;
    const imageToSend = selectedImage;
    setSelectedImage(null);

    setIsLoading(true);

    try {
      // 3. Dacă e o imagine, trimitem la verify endpoint
      if (imageToSend && textToSend) {
        const verifyResponse = await sendToVisionAPI(imageToSend, textToSend);
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: verifyResponse.message || "Imagine analizată.",
          sender: 'ai',
          type: 'text'
        };
        setMessages((prev) => [...prev, aiResponse]);
      } 
      // 4. Dacă e doar text, trimitem la chat endpoint
      else if (textToSend) {
        // Folosim locația sau valori default (Cluj-Napoca)
        const lat = userLocation?.lat || 46.7693;
        const long = userLocation?.long || 23.5898;

        const chatResponse = await sendChatMessage(textToSend, lat, long);
        
        // Verifică tipul de răspuns
        const lowerText = textToSend.toLowerCase();
        
        // Dacă are itinerariu cu 3 locuri sugerite
        if (chatResponse.suggested_locations && chatResponse.suggested_locations.length >= 3) {
          // Afișează mesajul conversațional
          const textMsg = {
            id: (Date.now() + 1).toString(),
            text: chatResponse.text,
            sender: 'ai',
            type: 'text'
          };
          setMessages((prev) => [...prev, textMsg]);
          
          // Start timer for this destination
          setLocationStartTime(Date.now());
          
          // Creează card de itinerariu
          const itineraryMsg = {
            id: (Date.now() + 2).toString(),
            type: 'itinerary',
            sender: 'ai',
            data: {
              title: "🗺️ Itinerariu Optim",
              description: chatResponse.itinerary,
              locations: chatResponse.suggested_locations
            }
          };
          setMessages((prev) => [...prev, itineraryMsg]);
          
        } else if (lowerText.includes('itinerariu') || lowerText.includes('plan') || lowerText.includes('ghid')) {
          // Răspuns traditional cu mock data
          const guideData = getCityGuide(textToSend); 
          const aiGuideMsg = {
            id: (Date.now() + 2).toString(),
            type: 'guide',
            sender: 'ai',
            data: guideData
          };
          setMessages((prev) => [...prev, aiGuideMsg]);
        } else {
          // Răspuns simplu din OpenAI
          const responseText = chatResponse.text || chatResponse.reply || "Nu am putut obține un răspuns.";
          const aiResponse = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'ai',
            type: 'text'
          };
          setMessages((prev) => [...prev, aiResponse]);
        }
      }
      
    } catch (error) {
      console.error("❌ Eroare la backend:", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: `Eroare: ${error.message}. Verifică dacă serverul backend rulează pe http://192.168.1.100:8000`,
        sender: 'ai',
        type: 'text'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  // Logica pentru TaskValidator rămâne ca să nu strici celelalte feature-uri
  const handleCameraPress = () => {
    // Acum Camera Button din InputBar va deschide Image Picker
    pickImage();
  };
  const handleTaskSuccess = (photoUri) => {
    // Logica veche de recompensă
    const photoMsg = { id: Date.now().toString(), sender: 'user', type: 'image', imageUri: photoUri };
    const successMsg = { id: (Date.now() + 1).toString(), text: "Superb! Locație verificată.", sender: 'ai', type: 'text' };
    setMessages(prev => [...prev, photoMsg, successMsg]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={32} color="#000" />
        </TouchableOpacity>

        <View style={{alignItems: 'center'}}>
          <Text style={styles.headerSubtitle}>ASISTENT VIRTUAL</Text>
          <Text style={styles.headerTitle}>City Chat</Text>
        </View>

        <View style={{width: 32}} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem} // Folosim funcția care știe de GuideCard
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal pentru cererea numelui locației la verificare imagine */}
      <Modal visible={verifyModalVisible} transparent animationType="slide">
        <View style={styles.verifyOverlay}>
          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>Verificare Poză</Text>
            <Text style={styles.verifySubtitle}>Introdu numele locației pentru a verifica (sau lasă gol pentru verificare automată):</Text>
            <TextInput
              value={verifyLocationText}
              onChangeText={setVerifyLocationText}
              placeholder="Ex: Zidurile Cetății"
              style={styles.verifyInput}
            />

            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
              <TouchableOpacity onPress={handleVerifyCancel} style={[styles.verifyBtn, {backgroundColor: '#ccc'}]}>
                <Text>Renunță</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVerifyConfirm} style={[styles.verifyBtn, {backgroundColor: '#28a745'}]}>
                {isVerifying ? <ActivityIndicator color="#fff" /> : <Text style={{color: 'white'}}>Verifică</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NOU: Previzualizarea pozei selectate */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImageBtn}>
            <Ionicons name="close-circle" size={32} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      {/* NOU: Afișarea Loading Indicator (peste InputBar) */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analizăm imaginea...</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Acum onCameraPress va deschide Image Picker */}
        <InputBar onSend={handleSend} onCameraPress={takePhotoAndSend} onGalleryPress={pickImage} />
      </KeyboardAvoidingView>

      <TaskValidator 
        visible={showValidator}
        onClose={() => setShowValidator(false)}
        targetName="Meron Coffee"
        targetCoords={{ latitude: 46.7712, longitude: 23.5821 }}
        onTaskComplete={handleTaskSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  verifyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  verifyCard: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 20 },
  verifyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  verifySubtitle: { fontSize: 13, color: '#666', marginBottom: 10 },
  verifyInput: { borderWidth: 1, borderColor: '#DDD', padding: 10, borderRadius: 8, backgroundColor: '#F9F9F9' },
  verifyBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // --- STILURI NOI ---
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeImageBtn: {
    marginLeft: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 60, // Peste InputBar
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    zIndex: 10, // Asigură-te că este deasupra altor elemente
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  }
});