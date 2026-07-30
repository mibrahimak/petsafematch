import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ProfileSection from '../../components/profile/ProfileSection';
import ProfileToggleItem from '../../components/profile/ProfileToggleItem';

export default function PrivacySettings() {
  const { profile, updatePrivacySettings } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const settings = useMemo(
    () => ({
      shareDistance: profile?.share_distance !== false,
      hideExactLocation: profile?.hide_exact_location === true,
      showOnlineStatus: profile?.show_online_status !== false,
    }),
    [
      profile?.share_distance,
      profile?.hide_exact_location,
      profile?.show_online_status,
    ]
  );

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggle = useCallback(
    async (key, value) => {
      const previous = localSettings;
      setLocalSettings((prev) => ({ ...prev, [key]: value }));

      try {
        if (key === 'shareDistance') {
          await updatePrivacySettings({ shareDistance: value });
        } else if (key === 'hideExactLocation') {
          await updatePrivacySettings({ hideExactLocation: value });
        } else if (key === 'showOnlineStatus') {
          await updatePrivacySettings({ showOnlineStatus: value });
        }
      } catch (error) {
        console.error('[privacy-settings] Ayar güncellenemedi:', error);
        setLocalSettings(previous);
        Alert.alert(
          'Hata',
          'Gizlilik ayarı kaydedilemedi. Lütfen tekrar deneyin.'
        );
      }
    },
    [localSettings, updatePrivacySettings]
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
          Gizlilik Ayarları
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.description, { color: colors.label }]}>
          Konum ve çevrimiçi durum bilgilerinizin diğer kullanıcılara nasıl
          görüneceğini yönetin.
        </ThemedText>

        <View style={styles.sections}>
          <ProfileSection title='Mesafe / Konum Gizliliği'>
            <ProfileToggleItem
              icon='navigate-outline'
              label='Mesafe Paylaşımı'
              value={localSettings.shareDistance}
              onValueChange={(value) => handleToggle('shareDistance', value)}
            />
            <ProfileToggleItem
              icon='location-outline'
              label='Tam Konum Gizleme'
              value={localSettings.hideExactLocation}
              onValueChange={(value) =>
                handleToggle('hideExactLocation', value)
              }
              isLast
            />
          </ProfileSection>

          <ThemedText style={[styles.hint, { color: colors.label }]}>
            Tam konum gizleme açıkken ilanlarınızda yalnızca il bilgisi
            gösterilir, ilçe gizlenir.
          </ThemedText>

          <ProfileSection title='Çevrimiçi Durumu'>
            <ProfileToggleItem
              icon='radio-button-on-outline'
              label='Son Görülme / Çevrimiçi Durumu'
              value={localSettings.showOnlineStatus}
              onValueChange={(value) => handleToggle('showOnlineStatus', value)}
              isLast
            />
          </ProfileSection>

          <ThemedText style={[styles.hint, { color: colors.label }]}>
            Kapalıyken diğer kullanıcılar çevrimiçi durumunuzu ve son görülme
            bilginizi göremez.
          </ThemedText>
        </View>
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
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
