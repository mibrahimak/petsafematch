import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useRefresh } from '../../hooks/useRefresh';
import { useProfileStats } from '../../hooks/useProfileStats';
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences';
import { getAppVersionLabel } from '../../utils/appVersion';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStatsRow from '../../components/profile/ProfileStatsRow';
import ProfileSection from '../../components/profile/ProfileSection';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import ProfileToggleItem from '../../components/profile/ProfileToggleItem';
import AppVersionFooter from '../../components/profile/AppVersionFooter';

const Profile = () => {
  const { logout, isLoggedIn, profile, user, isLoading, refreshProfile } =
    useContext(AuthContext);

  const { colors, theme, toggleTheme } = useTheme();
  const router = useRouter();

  const isDark = theme === 'dark';

  const { stats, refreshStats } = useProfileStats(user?.id);
  const { preferences, updatePreference } = useNotificationPreferences();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshProfile(), refreshStats()]);
  }, [refreshProfile, refreshStats]);

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, isLoading, router]);

  const fullName = profile?.full_name || 'Kullanıcı Adı';
  const email = user?.email || 'eposta@adresiniz.com';

  const avatarUrl =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;

  const listingsBadge = useMemo(() => {
    const listingStat = stats.find((stat) => stat.key === 'listings');
    return listingStat ? Number(listingStat.value) : 0;
  }, [stats]);

  const handleEditProfile = useCallback(() => {
    router.push('/(profile)/edit-profile');
  }, [router]);

  const handleEmailPassword = useCallback(() => {
    router.push('/(profile)/email-password');
  }, [router]);

  const handlePrivacySettings = useCallback(() => {
    router.push('/(profile)/privacy-settings');
  }, [router]);

  const handleDevicePermissions = useCallback(() => {
    router.push('/(profile)/device-permissions');
  }, [router]);

  const handleComingSoon = useCallback((feature) => {
    Alert.alert('Yakında', `${feature} özelliği yakında eklenecek.`);
  }, []);

  const handleStatPress = useCallback(
    (key) => {
      if (key === 'listings') {
        router.push('/mylistings');
        return;
      }
      if (key === 'favorites') {
        router.push('/favorites');
        return;
      }
      if (key === 'pets') {
        router.push('/(profile)/my-pets');
      }
    },
    [router]
  );

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Bilgi',
              'Hesap silme isteğiniz alındı. Bu özellik yakında aktif olacak.'
            );
          },
        },
      ]
    );
  }, []);

  if (isLoading) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ThemedText>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <ProfileHeader
          fullName={fullName}
          email={email}
          avatarUrl={avatarUrl}
          onEditPress={handleEditProfile}
        />

        <ProfileStatsRow stats={stats} onStatPress={handleStatPress} />

        <View style={styles.sections}>
          <ProfileSection title='Hesap'>
            <ProfileMenuItem
              icon='create-outline'
              label='Profili Düzenle'
              onPress={handleEditProfile}
            />
            <ProfileMenuItem
              icon='mail-outline'
              label='E-posta & Şifre'
              onPress={handleEmailPassword}
            />
            <ProfileMenuItem
              icon='star-outline'
              label='Premium Üyelik'
              value='Ücretsiz'
              chevron={false}
              onPress={() => handleComingSoon('Premium üyelik')}
            />
            <ProfileMenuItem
              icon='list-outline'
              label='İlanlarım'
              badge={listingsBadge}
              isLast
              onPress={() => router.push('/mylistings')}
            />
          </ProfileSection>

          <ProfileSection title='Bildirimler'>
            <ProfileToggleItem
              icon='notifications-outline'
              label='Push Bildirimleri'
              value={preferences.push}
              onValueChange={(value) => updatePreference('push', value)}
            />
            <ProfileToggleItem
              icon='heart-outline'
              label='Eşleşme Bildirimleri'
              value={preferences.match}
              onValueChange={(value) => updatePreference('match', value)}
            />
            <ProfileToggleItem
              icon='chatbubble-outline'
              label='Mesaj Bildirimleri'
              value={preferences.message}
              onValueChange={(value) => updatePreference('message', value)}
            />
            <ProfileToggleItem
              icon='volume-high-outline'
              label='Bildirim Sesi'
              value={preferences.sound}
              onValueChange={(value) => updatePreference('sound', value)}
            />
            <ProfileToggleItem
              icon='mail-outline'
              label='E-posta Bildirimleri'
              value={preferences.email}
              onValueChange={(value) => updatePreference('email', value)}
              isLast
            />
          </ProfileSection>

          <ProfileSection title='Uygulama'>
            <ProfileToggleItem
              icon={isDark ? 'moon-outline' : 'sunny-outline'}
              label='Karanlık Mod'
              value={isDark}
              onValueChange={(value) => {
                if (value !== isDark) toggleTheme();
              }}
            />
            <ProfileMenuItem
              icon='heart-outline'
              label='Favorilerim'
              onPress={() => router.push('/favorites')}
            />
            <ProfileMenuItem
              icon='paw-outline'
              label='Patili Dostlarım'
              onPress={() => router.push('/(profile)/my-pets')}
            />
          </ProfileSection>

          <ProfileSection title='Gizlilik & Destek'>
            <ProfileMenuItem
              icon='shield-outline'
              label='Gizlilik Ayarları'
              onPress={handlePrivacySettings}
            />
            <ProfileMenuItem
              icon='phone-portrait-outline'
              label='Cihaz İzinleri'
              onPress={handleDevicePermissions}
            />
            <ProfileMenuItem
              icon='help-circle-outline'
              label='Yardım & Destek'
              onPress={() => router.push('/(profile)/help-support')}
              isLast
            />
          </ProfileSection>

          <ProfileSection title='Uygulama Hakkında & Yasal'>
            <ProfileMenuItem
              icon='pricetag-outline'
              label='Versiyon'
              value={getAppVersionLabel()}
              chevron={false}
            />
            <ProfileMenuItem
              icon='document-text-outline'
              label='Kullanım Koşulları'
              onPress={() => router.push('/(profile)/terms-of-service')}
            />
            <ProfileMenuItem
              icon='shield-checkmark-outline'
              label='Gizlilik Politikası'
              onPress={() => router.push('/(profile)/privacy-policy')}
              isLast
            />
          </ProfileSection>

          <ProfileSection title='Çıkış Yap & Hesabı Sil'>
            <ProfileMenuItem
              icon='trash-outline'
              label='Hesabı Sil'
              onPress={handleDeleteAccount}
              danger={true}
            />
            <ProfileMenuItem
              icon='log-out-outline'
              label='Çıkış Yap'
              onPress={logout}
              danger={true}
            />
          </ProfileSection>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sections: {
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
