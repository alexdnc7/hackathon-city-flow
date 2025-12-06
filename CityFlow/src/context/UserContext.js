import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [coins, setCoins] = useState(500); 
  const [chatHistory, setChatHistory] = useState([]); 

  useEffect(() => {
    const loadCoins = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem('userCoins');
        if (storedCoins !== null) {
          setCoins(parseInt(storedCoins));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCoins();
  }, []);

  const updateBalance = (newAmount) => {
    setCoins(newAmount);
    AsyncStorage.setItem('userCoins', newAmount.toString());
  };

  const addCoins = (amount) => {
    updateBalance(coins + amount);
  };

  const spendCoins = (amount) => {
    if (coins >= amount) {
      updateBalance(coins - amount);
      return true; 
    }
    return false; 
  };

  const addToHistory = (title) => {
    const newEntry = { id: Date.now(), title: title, date: new Date().toLocaleDateString() };
    setChatHistory(prev => [newEntry, ...prev]); 
  };

  return (
    <UserContext.Provider value={{ 
      coins, 
      addCoins,    
      spendCoins,  
      chatHistory, 
      addToHistory 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);