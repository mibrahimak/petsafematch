import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useDevicePermissions } from '../../hooks/useDevicePermissions';
import { useTheme } from '../../hooks/useTheme';
import { openAppSettings } from '../../utils/openAppSettings';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import ProfileSection from '../../components/profile/ProfileSection';
import PermissionStatusRow from '../../components/profile/PermissionStatusRow';

export default function DevicePermissions() {
  const { colors } = useTheme();
  const router = useRouter();
  const { permissions, refreshing, refreshPermissions, requestPermission } =
    useDevicePermissions();
  const [requestingKey, setRequestingKey] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshPermissions().catch((error) => {
        console.error('[device-permissions] İzinler yenilenemedi:', error);
      });
    }, [refreshPermissions])
  );

  const handleRequestPermission = useCallback(
    async (key) => {
      setRequestingKey(key);
      try {
        await requestPermission(key);
        await refreshPermissions();
      } catch (error) {
        Alert.alert('Hata', 'İzin isteği gönderilemedi. Lütfen tekrar deneyin.');
      } finally {
        setRequestingKey(null);
      }
    },
    [refreshPermissions, requestPermission]
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Ionicons name='arrow-back' size={24} color={colors.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle} title>
          Cihaz İzinleri
        </ThemedText>
        {refreshing ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.description, { color: colors.label }]}>
          İzinleri buradan kontrol edebilirsiniz. Kalıcı olarak reddedilen
          izinler için sistem ayarlarına yönlendirilirsiniz.
        </ThemedText>

        <View style={styles.sections}>
          <ProfileSection title='Konum'>
            <PermissionStatusRow
              icon='location-outline'
              title='Konum İzni'
              description='Yakındaki evcil hayvanları ve ilanları bulmak için kullanılır.'
              permission={permissions.location}
              permissionKey='location'
              onRequest={handleRequestPermission}
              requesting={requestingKey === 'location'}
              isLast
            />
          </ProfileSection>

          <ProfileSection title='Kamera & Galeri'>
            <PermissionStatusRow
              icon='camera-outline'
              title='Kamera'
              description='Evcil hayvan fotoğrafı çekmek veya mesajlaşmada fotoğraf atmak için.'
              permission={permissions.camera}
              permissionKey='camera'
              onRequest={handleRequestPermission}
              requesting={requestingKey === 'camera'}
            />
            <PermissionStatusRow
              icon='images-outline'
              title='Galeri'
              description='Galeriden fotoğraf seçmek için gerekir.'
              permission={permissions.mediaLibrary}
              permissionKey='mediaLibrary'
              onRequest={handleRequestPermission}
              requesting={requestingKey === 'mediaLibrary'}
            />
            <PermissionStatusRow
              icon='mic-outline'
              title='Mikrofon'
              description='İleride sesli mesaj özelliği için kullanılacaktır.'
              permission={permissions.microphone}
              permissionKey='microphone'
              onRequest={handleRequestPermission}
              requesting={requestingKey === 'microphone'}
              isLast
            />
          </ProfileSection>

          <ProfileSection title='Bildirimler'>
            <PermissionStatusRow
              icon='notifications-outline'
              title='Push Bildirimleri'
              description='Eşleşme ve mesaj bildirimlerini almak için gerekir.'
              permission={permissions.notifications}
              permissionKey='notifications'
              onRequest={handleRequestPermission}
              requesting={requestingKey === 'notifications'}
              isLast
            />
          </ProfileSection>
        </View>

        <ThemedButton onPress={openAppSettings} style={styles.settingsButton}>
          <ThemedText style={styles.settingsButtonText}>Tüm Ayarları Aç</ThemedText>
        </ThemedButton>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 8,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sections: {
    paddingHorizontal: 16,
  },
  settingsButton: {
    marginTop: 24,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
