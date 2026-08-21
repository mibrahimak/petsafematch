import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';

const UNSUPPORTED = { status: 'unsupported', canAskAgain: false };

const isNotificationsUnavailable =
  Platform.OS === 'android' && isRunningInExpoGo();

const getNotificationsModule = () => {
  if (isNotificationsUnavailable) return null;
  return require('expo-notifications');
};

const normalizePermission = (result) => ({
  status: result?.status ?? 'undetermined',
  canAskAgain: result?.canAskAgain ?? true,
});

const ensureAndroidNotificationChannel = async () => {
  const Notifications = getNotificationsModule();
  if (!Notifications || Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Varsayılan',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2B62E5',
  });
};

const getNotificationPermissionsAsync = async () => {
  const Notifications = getNotificationsModule();
  if (!Notifications) return UNSUPPORTED;
  return normalizePermission(await Notifications.getPermissionsAsync());
};

const requestNotificationPermissionsAsync = async () => {
  const Notifications = getNotificationsModule();
  if (!Notifications) return UNSUPPORTED;
  await ensureAndroidNotificationChannel();
  return normalizePermission(await Notifications.requestPermissionsAsync());
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
        getRecordingPermissionsAsync(),
        getNotificationPermissionsAsync(),
      ]);

      setPermissions({
        location: normalizePermission(locationResult),
        camera: normalizePermission(cameraResult),
        mediaLibrary: normalizePermission(mediaLibraryResult),
        microphone: normalizePermission(microphoneResult),
        notifications: notificationsResult,
      });
    } catch (error) {
      console.error('[useDevicePermissions] İzinler okunamadı:', error);
      throw error;
    } finally {
      setRefreshing(false);
    }
  }, []);

  const requestPermission = useCallback(async (key) => {
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
          result = normalizePermission(
            await requestRecordingPermissionsAsync()
          );
          break;
        case 'notifications':
          result = await requestNotificationPermissionsAsync();
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
  }, []);

  return {
    permissions,
    refreshing,
    refreshPermissions,
    requestPermission,
  };
};
