import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useRegistration } from '@/context/RegistrationContext';
import { useToken } from '@/context/TokenContext';
import { authApi } from '@/api/auth';
import { profileApi } from '@/api/profile';
import { api } from '@/api/client';

type Step = 'registering' | 'profile' | 'location' | 'preferences' | 'photos' | 'prompts' | 'done' | 'error';

const STEP_LABELS: Record<Step, string> = {
  registering: 'Creating your account...',
  profile: 'Saving your profile...',
  location: 'Setting your location...',
  preferences: 'Saving preferences...',
  photos: 'Uploading your photos...',
  prompts: 'Saving your prompts...',
  done: 'All done!',
  error: 'Something went wrong',
};

export default function FinalScreen() {
  const router = useRouter();
  const { data, reset } = useRegistration();
  const { setToken, setUserId } = useToken();
  const [step, setStep] = useState<Step>('registering');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    run();
  }, []);

  const run = async () => {
    try {
      // Step 1: Register
      setStep('registering');
      const { accessToken, refreshToken, userId } = await authApi.register({
        email: data.email!,
        phone: data.phone!,
        password: data.password!,
      });

      await SecureStore.setItemAsync('token', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('userId', userId);
      setToken(accessToken);
      setUserId(userId);

      // Set auth header for subsequent calls
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Step 2: Profile
      setStep('profile');
      await profileApi.update({
        name: `${data.firstName} ${data.lastName}`.trim(),
        dob: data.dob!,
        gender: data.gender!,
        bio: data.bio ?? undefined,
        hometown: data.hometown ?? undefined,
        religion: data.religion ?? undefined,
        occupation: data.occupation ?? undefined,
        datingType: data.datingType ?? undefined,
      });

      // Step 3: Location
      if (data.latitude != null && data.longitude != null) {
        setStep('location');
        await profileApi.updateLocation({ latitude: data.latitude, longitude: data.longitude });
      }

      // Step 4: Preferences
      setStep('preferences');
      await profileApi.upsertPreferences({
        gender: data.preferredGender ?? 'any',
        minAge: 18,
        maxAge: 50,
        maxDistance: 50,
      });

      // Step 5: Photos — upload directly to Cloudinary, backend saves the URL
      if (data.photos && data.photos.length > 0) {
        setStep('photos');
        for (const localUri of data.photos) {
          try {
            await profileApi.uploadPhotoViaCloudinary(localUri);
          } catch {
            // Photo upload failure is non-fatal — user can add photos from profile later
          }
        }
      }

      // Step 6: Prompts
      if (data.prompts && data.prompts.length > 0) {
        setStep('prompts');
        await profileApi.savePrompts(data.prompts);
      }

      setStep('done');
      reset();

      // Navigate to main app
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 800);
    } catch (err: any) {
      setStep('error');
      const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        err?.message ??
        'Unknown error';
      setErrorMsg(msg);
    }
  };

  if (step === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Registration failed</Text>
        <Text style={styles.errorMsg}>{errorMsg}</Text>
        <Text style={styles.hint}>Please go back and try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E85D75" style={styles.spinner} />
      <Text style={styles.label}>{STEP_LABELS[step]}</Text>
      {step === 'done' && <Text style={styles.sub}>Redirecting you to Bondly...</Text>}
    </View>
  );
}

// ── S3 helper (kept for future use) ─────────────────────────────────────────
// async function uriToBlob(uri: string): Promise<Blob> {
//   const response = await fetch(uri);
//   return response.blob();
// }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center', padding: 24 },
  spinner: { marginBottom: 24 },
  label: { fontSize: 18, color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
  sub: { fontSize: 14, color: '#989898', marginTop: 8 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#FF4444', marginBottom: 16 },
  errorMsg: { fontSize: 15, color: '#989898', textAlign: 'center', marginBottom: 12 },
  hint: { fontSize: 13, color: '#555', textAlign: 'center' },
});
