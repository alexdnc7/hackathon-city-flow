import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Importăm corect Providerii din folderele lor
import { UserProvider } from '../src/context/UserContext';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    // AuthProvider primul (pentru Login), apoi UserProvider (pentru Bani)
    <AuthProvider>
      <UserProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
      </UserProvider>
    </AuthProvider>
  );
}