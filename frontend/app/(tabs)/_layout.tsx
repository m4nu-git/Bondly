import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#101010', borderTopColor: '#1E1E1E', height: 60 },
        tabBarActiveTintColor: '#E85D75',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarIcon: ({ color, size }) => <Ionicons name="star-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
