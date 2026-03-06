import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';
import { profileApi } from '@/api/profile';

// Only update location if the user moved more than this distance (metres)
const MIN_DISTANCE_METRES = 5000; // 5 km

function haversineMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useLocationSync() {
  const lastKnown = useRef<{ lat: number; lon: number } | null>(null);

  const syncLocation = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return;

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      if (lastKnown.current) {
        const dist = haversineMetres(lastKnown.current.lat, lastKnown.current.lon, latitude, longitude);
        if (dist < MIN_DISTANCE_METRES) return; // Not far enough — skip the update
      }

      await profileApi.updateLocation({ latitude, longitude });
      lastKnown.current = { lat: latitude, lon: longitude };
    } catch (_) {
      // Fail silently — location sync is best effort
    }
  };

  useEffect(() => {
    // Sync on mount (app open)
    syncLocation();

    // Re-sync every time the app comes to the foreground
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        syncLocation();
      }
    });

    return () => sub.remove();
  }, []);
}
