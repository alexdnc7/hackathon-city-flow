import React from 'react';
// Importăm Stack pentru navigarea generală
import { Stack } from 'expo-router'; 
// Importăm Banca (Providerul). Calea este corectă aici: ../src...
import { UserProvider } from '../src/context/UserContext';

export default function RootLayout() {
  return (
    // 1. Împachetăm totul în Provider (Bancă)
    <UserProvider>
      {/* 2. Definim navigarea principală */}
      <Stack>
        {/* Ascundem header-ul pentru că îl avem pe cel din Tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}