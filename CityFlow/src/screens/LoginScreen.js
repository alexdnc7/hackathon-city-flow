// src/screens/LoginScreen.js
import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image,
  ActivityIndicator
} from "react-native";
import { loginUser } from "../services/authService";

// Primim { navigation } ca prop, standard în React Navigation
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginUser(email, password);
      // NU TREBUIE să navigăm manual. 
      // AuthContext vede că userul s-a schimbat și RootNavigator te mută automat la Market.
    } catch (error) {
      Alert.alert("Eroare", "Email sau parolă incorectă.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Info", "Autentificarea cu Google necesită configurare Google Cloud Console.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CityFlow</Text>
      <Text style={styles.subtitle}>Explorează lumea fără aglomerație.</Text>
      
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

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Intră în cont</Text>
        </TouchableOpacity>
      )}

      {/* === BUTONUL GOOGLE === */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        {/* Imaginea Google */}
        <Image 
            source={require('../../assets/images/google.png')} 
            style={styles.googleIcon} 
        />
        <Text style={styles.googleText}>Continuă cu Google</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={{color: '#666'}}>Nu ai cont?</Text>
        {/* Folosim navigation.navigate pentru Register */}
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}> Înregistrează-te</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: "#28a745", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 40 },
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
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  googleIcon: { width: 24, height: 24, marginRight: 10 },
  googleText: { fontSize: 16, fontWeight: '600', color: '#333' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  linkText: { color: "#28a745", fontWeight: "bold", fontSize: 16 }
});