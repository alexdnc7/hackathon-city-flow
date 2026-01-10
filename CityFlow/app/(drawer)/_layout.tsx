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
          drawerLabelStyle: { marginLeft: 0, fontWeight: '600' },
          drawerItemStyle: { borderRadius: 10, marginHorizontal: 10 },
        }}
      >
        {/* CHATUL ESTE ACUM "index" */}
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Chat',
            title: 'City Chat',
            drawerIcon: ({ color }) => <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />,
          }}
        />

        {/* MARKETUL ESTE "market" */}
        <Drawer.Screen
          name="market"
          options={{
            drawerLabel: 'Rewards Market',
            title: 'Rewards',
            drawerIcon: ({ color }) => <Ionicons name="gift-outline" size={24} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}