import React, { useRef, useState, useEffect } from 'react';
import { 
  FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View, 
  StatusBar, TouchableOpacity, DeviceEventEmitter, ActivityIndicator, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // <-- PĂSTRĂM DOAR ACEST IMPORT

import ChatBubble from '../components/ChatBubble';
import InputBar from '../components/InputBar';
import TaskValidator from '../components/TaskValidator'; 

// --- IMPORTURI NECESARE ---
import { useUser } from '../context/UserContext';
import GuideCard from '../components/GuideCard';
import { getCityGuide } from '../services/mockCityGuide';
import { sendToVisionAPI } from '../services/visionService'; 

const DUMMY_MESSAGES = [
  { id: '1', text: 'Salut! Sunt pregătit să explorăm orașul. Ce ai vrea să vizitezi?', sender: 'ai', type: 'text' },
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const { addToHistory } = useUser(); 
  
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [showValidator, setShowValidator] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // <-- NOU: URI-ul pozei
  const [isLoading, setIsLoading] = useState(false); // <-- NOU: Indicator de încărcare
  const flatListRef = useRef();

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
    // Dacă mesajul e de tip 'guide', afișăm cardul de itinerariu
    if (item.type === 'guide') {
      return (
        <GuideCard 
          data={item.data} 
          onSave={() => alert("Itinerariu salvat în profil!")} 
        />
      );
    }
    // Altfel, afișăm bula normală de chat (ChatBubble trebuie să știe să randeze item.imageUri)
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
      setSelectedImage(result.assets[0].uri);
    }
  };


  // --- LOGICA 3: AI BRAIN (Conectare la Vision API) ---
  const handleSend = async (text) => {
    // Verificare: trebuie să existe text SAU imagine
    if (!text.trim() && !selectedImage) return;

    // 1. Pregătim mesajul Userului
    const userMsg = { 
      id: Date.now().toString(), 
      text: text, 
      sender: 'user', 
      type: 'text',
      imageUri: selectedImage // Adăugăm poza dacă există
    };

    setMessages((prev) => [...prev, userMsg]);
    
    // 2. Salvăm istoricul și resetăm input-ul
    if (text) addToHistory(text); 
    const textToSend = text;
    const imageToSend = selectedImage;
    setSelectedImage(null); // Curățăm poza din preview

    setIsLoading(true);

    try {
      // 3. Trimitem la Backend (Vision API)
      const response = await sendToVisionAPI(textToSend, imageToSend);

      // AICI: Verificăm dacă răspunsul e de tip itinerariu sau text
      const lowerText = textToSend.toLowerCase();

      if (lowerText.includes('itinerariu') || lowerText.includes('plan') || lowerText.includes('ghid') || lowerText.includes('vacanta')) {
        // Răspuns bazat pe logica mock, dar se trimite și la Vision
        const guideData = getCityGuide(textToSend); 
        const aiGuideMsg = {
          id: (Date.now() + 2).toString(),
          type: 'guide',
          sender: 'ai',
          data: guideData
        };
        setMessages((prev) => [...prev, aiGuideMsg]);
        
      } else {
        // Răspuns bazat pe Vision API / Backend
        const aiText = response.reply || "Nu am putut obține un răspuns de la Vision API. Verifică serverul.";
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          sender: 'ai',
          type: 'text'
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
      
    } catch (error) {
      console.error("Eroare la trimiterea către Vision API:", error);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: "Eroare: Nu m-am putut conecta la server. Verifică IP-ul și portul.",
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
    const rewardMsg = { id: (Date.now() + 1).toString(), text: "Superb! Ai primit 100 Coins.", sender: 'ai', type: 'text' };
    setMessages(prev => [...prev, photoMsg, rewardMsg]);
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
        <InputBar onSend={handleSend} onCameraPress={handleCameraPress} />
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