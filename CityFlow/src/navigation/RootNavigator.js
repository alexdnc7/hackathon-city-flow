// src/navigation/RootNavigator.js in proiectul COLEGULUI
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";


// Ecranele Tale
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// ECRANUL LUI (Aici trebuie să pui numele corect al fișierului lui)
// Presupunem că se numește MarketScreen
import MarketScreen from "../screens/MarketScreen"; 

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // === LUMEA LUI (Aici ajungi după login) ===
          <Stack.Screen name="Market" component={MarketScreen} />
        ) : (
          // === LUMEA TA (Autentificare) ===
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}