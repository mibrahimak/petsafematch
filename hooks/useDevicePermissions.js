import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

const UNSUPPORTED = { status: 'unsupported', canAskAgain: false };

const normalizePermission = (result) => ({
  status: result?.status ?? 'undetermined',
  canAskAgain: result?.canAskAgain ?? true,
});

const ensureAndroidNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Varsayılan',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2B62E5',
  });
};

const INITIAL_PERMISSIONS = {
  location: { status: 'undetermined', canAskAgain: true },
  camera: { status: 'undetermined', canAskAgain: true },
  mediaLibrary: { status: 'undetermined', canAskAgain: true },
  microphone: { status: 'undetermined', canAskAgain: true },
  notifications: { status: 'undetermined', canAskAgain: true },
};

export const useDevicePermissions = () => {
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [refreshing, setRefreshing] = useState(false);

  const refreshPermissions = useCallback(async () => {
    setRefreshing(true);

    try {
      if (Platform.OS === 'web') {
        setPermissions({
          location: UNSUPPORTED,
          camera: UNSUPPORTED,
          mediaLibrary: UNSUPPORTED,
          microphone: UNSUPPORTED,
          notifications: UNSUPPORTED,
        });
        return;
      }

      const [
        locationResult,
        cameraResult,
        mediaLibraryResult,
        microphoneResult,
        notificationsResult,
      ] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
        Audio.getPermissionsAsync(),
        Notifications.getPermissionsAsync(),
      ]);

      setPermissions({
        location: normalizePermission(locationResult),
        camera: normalizePermission(cameraResult),
        mediaLibrary: normalizePermission(mediaLibraryResult),
        microphone: normalizePermission(microphoneResult),
        notifications: normalizePermission(notificationsResult),
      });
    } catch (error) {
      console.error('[useDevicePermissions] İzinler okunamadı:', error);
      throw error;
    } finally {
      setRefreshing(false);
    }
  }, []);

  const requestPermission = useCallback(
    async (key) => {
      if (Platform.OS === 'web') {
        return UNSUPPORTED;
      }

      try {
        let result = UNSUPPORTED;

        switch (key) {
          case 'location':
            result = normalizePermission(
              await Location.requestForegroundPermissionsAsync()
            );
            break;
          case 'camera':
            result = normalizePermission(
              await ImagePicker.requestCameraPermissionsAsync()
            );
            break;
          case 'mediaLibrary':
            result = normalizePermission(
              await ImagePicker.requestMediaLibraryPermissionsAsync()
            );
            break;
          case 'microphone':
            result = normalizePermission(await Audio.requestPermissionsAsync());
            break;
          case 'notifications':
            await ensureAndroidNotificationChannel();
            result = normalizePermission(
              await Notifications.requestPermissionsAsync()
            );
            break;
          default:
            throw new Error(`Bilinmeyen izin anahtarı: ${key}`);
        }

        setPermissions((prev) => ({ ...prev, [key]: result }));
        return result;
      } catch (error) {
        console.error(`[useDevicePermissions] ${key} izni istenemedi:`, error);
        throw error;
      }
    },
    []
  );

  return {
    permissions,
    refreshing,
    refreshPermissions,
    requestPermission,
  };
};
