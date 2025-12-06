// src/screens/RegisterScreen.js
import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import { registerUser } from "../services/authService";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Eroare", "Parolele nu coincid!");
      return;
    }
    
    if (password.length < 6) {
        Alert.alert("Eroare", "Parola trebuie să aibă minim 6 caractere.");
        return;
    }

    setLoading(true);
    try {
      await registerUser(email, password);
      // Nu trebuie să navigăm manual, AuthContext va detecta userul și va schimba ecranul automat
    } catch (error) {
      Alert.alert("Eroare la înregistrare", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creează Cont</Text>
      <Text style={styles.subtitle}>Alătură-te CityFlow pentru recompense!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Parolă"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmă Parola"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Înregistrează-te</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>Ai deja cont? <Text style={{fontWeight: 'bold'}}>Intră în cont</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 5, textAlign: "center", color: "#333" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30, textAlign: "center" },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    backgroundColor: "#f9f9f9",
    padding: 15, 
    marginBottom: 15, 
    borderRadius: 10,
    fontSize: 16
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkText: { textAlign: "center", color: "#007AFF", fontSize: 16 }
});