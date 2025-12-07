// src/navigation/RootNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { ActivityIndicator, View } from "react-native";

// Ecranele de Autentificare
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Importăm Navigatorul Principal
import AppNavigator from "./AppNavigator"; 

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  // Arată un loading indicator în timp ce Firebase se inițializează
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // === DACA ESTI LOGAT: Mergi la Navigatorul Principal (Chat + Market + Meniu) ===
          <Stack.Screen name="MainApp" component={AppNavigator} />
        ) : (
          // === DACA NU ESTI LOGAT: Arată Ecranele de Login ===
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}