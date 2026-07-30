import { Alert, Linking } from 'react-native';

export const openAppSettings = async () => {
  try {
    await Linking.openSettings();
  } catch (error) {
    console.error('[openAppSettings] Ayarlar açılamadı:', error);
    Alert.alert('Hata', 'Ayarlar açılamadı.');
  }
};
