import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TokenProvider, useToken } from '@/context/TokenContext';
import { RegistrationProvider } from '@/context/RegistrationContext';

function AuthGuard() {
  const { token, loading } = useToken();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';
    if (!token && inTabs) router.replace('/(auth)');
    if (token && inAuth) router.replace('/(tabs)');
  }, [token, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#E85D75" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TokenProvider>
        <RegistrationProvider>
          <AuthGuard />
        </RegistrationProvider>
      </TokenProvider>
    </GestureHandlerRootView>
  );
}
