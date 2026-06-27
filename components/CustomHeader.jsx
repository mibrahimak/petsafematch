import {
  Image,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import ThemedView from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import AppLogo from './AppLogo';

const CustomHeader = () => {
  const { colors } = useTheme();

  return (
    <ThemedView
      style={[styles.headerContainer, { borderColor: colors.borderColor }]}
      safe={true}
    >
      <View style={styles.topRow}>
        <Pressable onPress={() => console.log('Profil tıklandı')}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
            }}
            style={styles.avatar}
          />
        </Pressable>

        <View style={styles.logoContainer}>
          <AppLogo size={44} color={colors.title} />
        </View>

        <View style={styles.actionIcons}>
          <Pressable
            onPress={() => console.log('Bildirimler')}
            style={styles.iconButton}
          >
            <Ionicons
              name='notifications-outline'
              size={24}
              color={colors.title}
            />
          </Pressable>

          <Pressable
            onPress={() => console.log('Mesajlar')}
            style={styles.iconButton}
          >
            <Ionicons name='mail-outline' size={24} color={colors.title} />
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
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
});
