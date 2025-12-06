// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Creăm contextul
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // START cu 500 coins ca să aveți bani de teste la Hackathon!
  const [coins, setCoins] = useState(500); 

  // Funcția care încarcă banii salvați pe telefon (când redeschizi app)
  useEffect(() => {
    const loadCoins = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem('userCoins');
        if (storedCoins !== null) {
          setCoins(parseInt(storedCoins));
        }
      } catch (e) {
        console.error("Nu am putut încărca monedele", e);
      }
    };
    loadCoins();
  }, []);

  // Funcția care salvează banii
  const saveCoins = async (newAmount) => {
    setCoins(newAmount);
    await AsyncStorage.setItem('userCoins', newAmount.toString());
  };

  // Funcția de cheltuit (folosită în MarketScreen)
  const spendCoins = (amount) => {
    if (coins >= amount) {
      saveCoins(coins - amount);
      return true; // Tranzacție reușită
    }
    return false; // Fonduri insuficiente
  };

  // Funcția de câștigat (o vei folosi la task-uri)
  const earnCoins = (amount) => {
    saveCoins(coins + amount);
  };

  return (
    <UserContext.Provider value={{ coins, spendCoins, earnCoins }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook-ul custom pe care îl imporți tu
export const useUser = () => useContext(UserContext);