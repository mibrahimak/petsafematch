import { Alert, Linking } from 'react-native';
import { SUPPORT_EMAIL } from '../constants/helpContent';

export const openSupportEmail = async ({ subject, body }) => {
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(
        'Hata',
        `E-posta uygulaması açılamadı. ${SUPPORT_EMAIL} adresine yazın.`
      );
      return;
    }

    await Linking.openURL(url);
  } catch (error) {
    console.error('[supportEmail] E-posta açılamadı:', error);
    Alert.alert(
      'Hata',
      `E-posta uygulaması açılamadı. ${SUPPORT_EMAIL} adresine yazın.`
    );
  }
};

export const buildSupportEmailBody = ({
  userEmail,
  appVersion,
  platform,
  content,
}) => {
  const lines = [
    content,
    '',
    '---',
    `Kullanıcı: ${userEmail || 'Bilinmiyor'}`,
    `Uygulama Sürümü: ${appVersion}`,
    `Platform: ${platform}`,
  ];

  return lines.join('\n');
};
