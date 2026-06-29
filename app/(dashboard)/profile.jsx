import {
  Platform,
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';

const Profile = () => {
  const { logout, isLoggedIn, profile, user, isLoading } =
    useContext(AuthContext);
  const { colors, theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, isLoading, router]);

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

  const fullName = profile?.full_name || 'Kullanıcı Adı';
  const email = user?.email || 'eposta@adresiniz.com';

  const avatarUrl =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;

  // const handleEditPress = () => {
  //   setNameInput(fullName);
  //   setIsEditing(true);
  // };

  // const handleSaveProfile = async () => {
  //   if (!nameInput.trim()) {
  //     Alert.alert('Uyarı', 'İsim alanı boş bırakılamaz!');
  //     return;
  //   }

  //   try {
  //     await updateProfile(nameInput.trim());
  //     setIsEditing(false);
  //     Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
  //   } catch (error) {
  //     Alert.alert('Hata', error.message);
  //   }
  // };

  const menuItems = [
    {
      id: 'my-listings',
      title: 'İlanlarım',
      icon: 'paw-outline',
      action: () => router.push('/mylistings'),
    },
    {
      id: 'favorites',
      title: 'Favorilerim',
      icon: 'heart-outline',
      action: () => router.push('/favorites'),
    },
    {
      id: 'edit-profile',
      title: 'Profili Düzenle',
      icon: 'person-outline',
      action: () => console.log('Profil Düzenle'),
    },
    {
      id: 'settings',
      title: 'Uygulama Ayarları',
      icon: 'settings-outline',
      action: () => console.log('Ayarlar'),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </View>
          <ThemedText style={styles.fullName}>{fullName}</ThemedText>
          <ThemedText style={styles.email}>{email}</ThemedText>
        </View>

        <View
          style={[styles.menuContainer, { borderColor: colors.borderColor }]}
        >
          <Pressable
            style={[
              styles.menuItem,
              styles.menuItemBorder,
              { borderColor: colors.borderColor },
            ]}
            onPress={toggleTheme}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={isDark ? 'sunny-outline' : 'moon-outline'}
                size={22}
                color={colors.textColor}
                style={styles.menuIcon}
              />
              <ThemedText style={styles.menuItemText}>
                {isDark ? 'Karanlık Mod' : 'Aydınlık Mod'}
              </ThemedText>
            </View>

            <ThemedText style={styles.themeStatusText}>
              {isDark ? 'Açık' : 'Açık'}
            </ThemedText>
          </Pressable>

          {menuItems.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && [
                  styles.menuItemBorder,
                  { borderColor: colors.borderColor },
                ],
              ]}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={colors.textColor}
                  style={styles.menuIcon}
                />
                <ThemedText style={styles.menuItemText}>
                  {item.title}
                </ThemedText>
              </View>
              <Ionicons name='chevron-forward' size={18} color='#9CA3AF' />
            </Pressable>
          ))}
        </View>

        <View style={styles.logoutWrapper}>
          <ThemedButton style={styles.buttonContainer} onPress={logout}>
            <ThemedText style={styles.buttonText}>Çıkış Yap</ThemedText>
          </ThemedButton>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 25,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  // editAvatarButton: {
  //   position: 'absolute',
  //   bottom: 0,
  //   right: 0,
  //   width: 32,
  //   height: 32,
  //   borderRadius: 16,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   borderWidth: 3,
  //   borderColor: 'transparent',
  // },
  fullName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  menuContainer: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeStatusText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutWrapper: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  // inputContainer: {
  //   width: '100%',
  //   alignItems: 'center',
  //   paddingHorizontal: 20,
  // },
  // nameInput: {
  //   width: '100%',
  //   borderWidth: 1,
  //   borderRadius: 8,
  //   paddingHorizontal: 12,
  //   paddingVertical: 8,
  //   fontSize: 16,
  //   textAlign: 'center',
  //   marginBottom: 10,
  // },
  // actionRow: {
  //   flexDirection: 'row',
  //   gap: 20,
  // },
  // cancelButton: {
  //   padding: 8,
  // },
  // saveButton: {
  //   padding: 8,
  // },
});
