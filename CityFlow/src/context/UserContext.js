import React, { createContext, useState, useContext, useEffect } from "react";
// Importăm librăria colegului pentru salvare (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);