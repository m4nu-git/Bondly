import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#66295B" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TokenProvider>
          <RegistrationProvider>
            <AuthGuard />
          </RegistrationProvider>
        </TokenProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
