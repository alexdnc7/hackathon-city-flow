import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '../../src/components/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: '#333',
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: '#333',
          drawerLabelStyle: { marginLeft: 0, fontWeight: '600', fontSize: 15 },
          drawerItemStyle: { borderRadius: 10, marginHorizontal: 10 },
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Chat',
            title: 'Chat',
            drawerIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />,
          }}
        />
        {/* AICI ESTE SCHIMBAREA IMPORTANTĂ: */}
        <Drawer.Screen
          name="market"
          options={{
            drawerLabel: 'Rewards Market', // Numele care apare în meniu
            title: 'Rewards',
            drawerIcon: ({ color }) => <Ionicons name="gift-outline" size={24} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}