<<<<<<< HEAD
import React, { createContext, useState, useContext, useEffect } from "react";
// Importăm librăria colegului pentru salvare (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Creăm contextul
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // 1. ZONA BANI (Logica colegului + Numele tale)
  
  // Pornim cu 500 (cum a vrut colegul pentru teste)
  const [coins, setCoins] = useState(500); 

  // Încărcăm banii salvați când pornește aplicația
  useEffect(() => {
    const loadCoins = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem('userCoins');
        if (storedCoins !== null) {
          setCoins(parseInt(storedCoins));
        }
      } catch (e) {
        console.error("Eroare la încărcarea banilor", e);
      }
    };
    loadCoins();
  }, []);

  // Funcție ajutătoare care salvează și în RAM și pe Telefon
  const updateBalance = (newAmount) => {
    setCoins(newAmount);
    AsyncStorage.setItem('userCoins', newAmount.toString());
  };

  // Funcția TA 'addCoins' (conectată la sistemul de salvare al colegului)
  const addCoins = (amount) => {
    updateBalance(coins + amount);
  };

  // Funcția TA 'spendCoins' (conectată la sistemul de salvare)
  const spendCoins = (amount) => {
    if (coins >= amount) {
      updateBalance(coins - amount);
      return true; // Tranzacție reușită
    }
    return false; // Fonduri insuficiente
  };

  // 2. ZONA CHAT (Logica ta pentru meniul Gemini)
  const [chatHistory, setChatHistory] = useState([]); 

  const addToHistory = (title) => {
    const newEntry = { id: Date.now(), title: title, date: new Date().toLocaleDateString() };
    setChatHistory(prev => [newEntry, ...prev]); 
  };

  // 3. EXPORTĂM TOT CE AVEM NEVOIE
  return (
    <UserContext.Provider value={{ 
      coins, 
      addCoins,    // Pentru TaskValidator
      spendCoins,  // Pentru MarketScreen
      chatHistory, // Pentru Meniu (CustomDrawer)
      addToHistory // Pentru ChatScreen
    }}>
=======
// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// === SCHIMBARE MAJORĂ: Importăm direct Contextul, nu Hook-ul ===
// Fiind în același folder, folosim calea "./AuthContext"
import { AuthContext } from './AuthContext'; 

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Folosim useContext direct aici. Nu mai depindem de fișierul useAuth.js
  const { user } = useContext(AuthContext); 
  
  const [coins, setCoins] = useState(0); 

  useEffect(() => {
    const loadUserCoins = async () => {
      // Verificăm dacă userul există și are proprietatea uid
      if (user && user.uid) {
        const storageKey = `userCoins_${user.uid}`;
        
        try {
          const storedCoins = await AsyncStorage.getItem(storageKey);
          
          if (storedCoins !== null) {
            console.log(`[BANK] User vechi. Sold: ${storedCoins}`);
            setCoins(parseInt(storedCoins));
          } else {
            console.log(`[BANK] User nou. Bonus 500!`);
            setCoins(500);
            await AsyncStorage.setItem(storageKey, '500');
          }
        } catch (e) {
          console.error("Eroare la banca", e);
        }
      } else {
        setCoins(0);
      }
    };

    loadUserCoins();
  }, [user]); 

  const saveCoins = async (newAmount) => {
    if (user && user.uid) {
      setCoins(newAmount);
      const storageKey = `userCoins_${user.uid}`;
      await AsyncStorage.setItem(storageKey, newAmount.toString());
    }
  };

  const spendCoins = (amount) => {
    if (coins >= amount) {
      saveCoins(coins - amount);
      return true;
    }
    return false;
  };

  const earnCoins = (amount) => {
    saveCoins(coins + amount);
  };

  return (
    <UserContext.Provider value={{ coins, spendCoins, earnCoins }}>
>>>>>>> ciolo
      {children}
    </UserContext.Provider>
  );
};

<<<<<<< HEAD
// Hook-ul custom pe care îl imporți tu
=======
>>>>>>> ciolo
export const useUser = () => useContext(UserContext);