import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [coins, setCoins] = useState(0); 
  const [chatHistory, setChatHistory] = useState([]); // Aici ținem istoricul

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
  };

  const spendCoins = (amount) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true; 
    }
    return false; 
  };

  // Funcție nouă: Salvează o discuție în istoric
  const addToHistory = (title) => {
    const newEntry = { id: Date.now(), title: title, date: new Date().toLocaleDateString() };
    setChatHistory(prev => [newEntry, ...prev]); // Adăugăm la începutul listei
  };

  return (
    <UserContext.Provider value={{ coins, addCoins, spendCoins, chatHistory, addToHistory }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);