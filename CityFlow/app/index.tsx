import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        // Ne duce către Drawer (care va deschide Chat-ul)
        router.replace('/(drawer)'); 
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CityFlow Login</Text>
      <TextInput style={styles.input} placeholder="Email" />
      <TextInput style={styles.input} placeholder="Parolă" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
          {loading ? <ActivityIndicator color="#FFF"/> : <Text style={styles.buttonText}>INTRĂ ÎN CONT</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#28a745", marginBottom: 40 },
  input: { borderWidth: 1, borderColor: "#ddd", backgroundColor: "#f9f9f9", padding: 15, marginBottom: 15, borderRadius: 10 },
  button: { backgroundColor: "#28a745", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});