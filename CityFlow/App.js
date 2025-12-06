import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { UserProvider } from "./src/context/UserContext"; // <--- IMPORT NOU
import RootNavigator from "./src/navigation/RootNavigator";
import 'react-native-gesture-handler';

export default function App() {
  return (
    <AuthProvider>
      {/* UserProvider trebuie să fie înauntru ca să meargă banca */}
      <UserProvider> 
        <RootNavigator />
      </UserProvider>
    </AuthProvider>
  );
}