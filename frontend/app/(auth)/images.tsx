import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActionSheetIOS, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRegistration } from '@/context/RegistrationContext';
import NextButton from '@/components/NextButton';
import { C } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const MAX_PHOTOS = 6;

export default function ImagesScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [photos, setPhotos] = useState<string[]>([]);

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Please allow camera access.'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 5], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotos((p) => [...p, result.assets[0].uri]);
  };

  const launchLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Please allow photo library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 5], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotos((p) => [...p, result.assets[0].uri]);
  };

  const pickImage = () => {
    if (photos.length >= MAX_PHOTOS) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take a Photo', 'Choose from Library'], cancelButtonIndex: 0 },
        (i) => { if (i === 1) launchCamera(); if (i === 2) launchLibrary(); }
      );
    } else {
      Alert.alert('Add Photo', '', [
        { text: 'Take a Photo', onPress: launchCamera },
        { text: 'Choose from Library', onPress: launchLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  const onNext = () => {
    if (photos.length < 2) return;
    update({ photos });
    router.push('/(auth)/select-prompt');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconCircle}><Text style={styles.iconText}>📸</Text></View>
      <Text style={styles.title}>Add your photos</Text>
      <Text style={styles.sub}>Add at least 2 photos. Your first photo is your profile photo.</Text>

      <View style={styles.grid}>
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
          <TouchableOpacity key={i} style={styles.slot} onPress={photos[i] ? () => removePhoto(i) : pickImage}>
            {photos[i] ? (
              <>
                <Image source={{ uri: photos[i] }} style={styles.photo} />
                <View style={styles.removeBtn}><Text style={styles.removeBtnText}>✕</Text></View>
              </>
            ) : (
              <Ionicons name="add" size={30} color={C.disabled} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>{photos.length}/{MAX_PHOTOS} photos</Text>
      <NextButton onPress={onNext} disabled={photos.length < 2} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.authBg, paddingHorizontal: 25, paddingTop: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  iconText: { fontSize: 18 },
  title: { fontSize: 28, fontWeight: '800', color: C.textPrimary, marginBottom: 6 },
  sub: { fontSize: 13, color: C.textMuted, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: {
    width: '31%', aspectRatio: 4 / 5, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 11 },
  hint: { color: C.textMuted, fontSize: 13, textAlign: 'center', marginTop: 12 },
});
