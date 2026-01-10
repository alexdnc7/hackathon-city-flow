import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InputBar({ onSend, onCameraPress, onGalleryPress }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim().length > 0) {
      onSend(text);
      setText('');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Buton Cameră Negru (tap = camera, long-press = galerie) */}
        <TouchableOpacity onPress={onCameraPress} onLongPress={onGalleryPress} style={styles.cameraButton}>
          <Ionicons name="camera-outline" size={24} color="#FFF" />
        </TouchableOpacity>
        
        {/* Input Gri Rotunjit */}
        <TextInput
          style={styles.input}
          placeholder="Întreabă CityFlow AI..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          multiline
        />
        
        {/* Buton Trimite (Săgeată) */}
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="arrow-up" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between'
  },
  cameraButton: { 
    backgroundColor: '#000', // Negru
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F5F5F5', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    fontSize: 16, 
    maxHeight: 100,
    marginRight: 10,
    color: '#000'
  },
  sendButton: { 
    backgroundColor: '#000', // Negru
    width: 40, 
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center'
  },
});