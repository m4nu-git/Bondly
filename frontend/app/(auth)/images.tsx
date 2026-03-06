import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ActionSheetIOS, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useRegistration } from '@/context/RegistrationContext';

const MAX_PHOTOS = 6;

export default function ImagesScreen() {
  const router = useRouter();
  const { update } = useRegistration();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const launchLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const pickImage = () => {
    if (photos.length >= MAX_PHOTOS) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take a Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) launchCamera();
          if (index === 2) launchLibrary();
        }
      );
    } else {
      Alert.alert('Add Photo', 'Choose an option', [
        { text: 'Take a Photo', onPress: launchCamera },
        { text: 'Choose from Library', onPress: launchLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onNext = () => {
    if (photos.length < 2) return;
    update({ photos });
    router.push('/(auth)/prompts');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add your photos</Text>
      <Text style={styles.subtitle}>Add at least 2 photos. Your first photo is your profile photo.</Text>

      <View style={styles.grid}>
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={styles.photoSlot}
            onPress={photos[i] ? () => removePhoto(i) : pickImage}
          >
            {photos[i] ? (
              <>
                <Image source={{ uri: photos[i] }} style={styles.photo} />
                <View style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </View>
              </>
            ) : (
              <Text style={styles.addText}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>{photos.length}/{MAX_PHOTOS} photos added</Text>

      <TouchableOpacity
        style={[styles.button, photos.length < 2 && styles.disabled]}
        onPress={onNext}
        disabled={photos.length < 2 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101010', padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#989898', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoSlot: {
    width: '31%',
    aspectRatio: 4 / 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#FFFFFF', fontSize: 12 },
  addText: { color: '#555', fontSize: 32 },
  hint: { color: '#555', fontSize: 13, textAlign: 'center', marginTop: 16, marginBottom: 8 },
  button: { backgroundColor: '#E85D75', borderRadius: 30, padding: 16, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
