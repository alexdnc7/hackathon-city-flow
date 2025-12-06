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
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);