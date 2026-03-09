import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#101010', borderTopColor: '#1E1E1E', height: 60 },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#989898',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alpha-h-box" color={color} size={size + 4} />
          ),
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
