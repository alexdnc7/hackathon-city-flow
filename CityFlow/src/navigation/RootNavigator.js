// src/navigation/RootNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";

// Ecranele de Autentificare
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Importăm Navigatorul Principal (care conține Meniul/Chat-ul/Market-ul)
// Acest fișier "AppNavigator.js" trebuie să existe în folderul navigation!
import AppNavigator from "./AppNavigator"; 

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

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