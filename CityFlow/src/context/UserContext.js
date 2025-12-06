import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [coins, setCoins] = useState(0); 

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

  return (
    <UserContext.Provider value={{ coins, addCoins, spendCoins }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);