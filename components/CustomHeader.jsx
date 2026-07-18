import {
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useContext } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import AppLogo from './AppLogo';
import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import NotificationBadge from './NotificationBadge';
import MessageBadge from './MessageBadge';
import { AuthContext } from '../contexts/AuthContext';

const CustomHeader = () => {
  const { profile } = useContext(AuthContext);

  const { colors } = useTheme();
  const router = useRouter();

  const fullName = profile?.full_name || 'Kullanıcı Adı';
  const avatarUrl =
    profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;

  return (
    <ThemedView
      style={[styles.headerContainer, { borderColor: colors.borderColor }]}
      safe={true}
    >
      <View style={styles.topRow}>
        <Pressable onPress={() => router.push('/profile')}>
          <Image
            source={{
              uri: avatarUrl
                ? avatarUrl
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`,
            }}
            style={styles.avatar}
          />
        </Pressable>

        <View style={styles.logoContainer} pointerEvents='box-none'>
          <Pressable onPress={() => router.push('/(dashboard)')}>
            <AppLogo size={32} />
          </Pressable>
        </View>

        <View style={styles.actionIcons}>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={styles.iconButton}
          >
            <View>
              <Ionicons
                name='notifications-outline'
                size={26}
                color={colors.title}
              />
              <NotificationBadge />
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/messages/my-messages')}
            style={styles.iconButton}
          >
            <View>
              <Feather name='message-circle' size={26} color={colors.title} />
              <MessageBadge />
            </View>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 1,
    height: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
    top: 0,
    bottom: 0,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
});
