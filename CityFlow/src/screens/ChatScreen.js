import React, { useRef, useState, useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View, StatusBar, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

import ChatBubble from '../components/ChatBubble';
import InputBar from '../components/InputBar';
import TaskValidator from '../components/TaskValidator';

const DUMMY_MESSAGES = [
  { id: '1', text: 'Salut! Sunt pregătit să explorăm orașul. Ce ai vrea să vizitezi?', sender: 'ai', type: 'text' },
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [showValidator, setShowValidator] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('RESET_CHAT', () => {
      setMessages(DUMMY_MESSAGES);
    });
    return () => subscription.remove();
  }, []);

  const handleSend = (text) => {
    const userMsg = { id: Date.now().toString(), text: text, sender: 'user', type: 'text' };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: "Am verificat zona. E destul de aglomerat la Castel (High Traffic). Îți recomand o cafea la Meron Coffee pentru 100 Coins cât timp aștepți!",
        sender: 'ai',
        type: 'text'
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const handleCameraPress = () => {
    setShowValidator(true);
  };

  const handleTaskSuccess = (photoUri) => {
    const photoMsg = { id: Date.now().toString(), sender: 'user', type: 'image', imageUri: photoUri };
    const rewardMsg = { id: (Date.now() + 1).toString(), text: "Superb! Ai primit 100 Coins.", sender: 'ai', type: 'text' };
    setMessages(prev => [...prev, photoMsg, rewardMsg]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu" size={30} color="#000" />
        </TouchableOpacity>

        <View style={{alignItems: 'center'}}>
          <Text style={styles.headerSubtitle}>ASISTENT VIRTUAL</Text>
          <Text style={styles.headerTitle}>City Chat</Text>
        </View>

        <View style={{width: 30}} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
});