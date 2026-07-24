import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ProfileHeader = ({ fullName, email, avatarUrl, onEditPress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { borderColor: colors.primary }]}
        />
        <Pressable
          onPress={onEditPress}
          style={({ pressed }) => [
            styles.editButton,
            {
              backgroundColor: colors.primary,
              borderColor: colors.background,
            },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name='create-outline' size={12} color={colors.onPrimary} />
        </Pressable>
      </View>

      <ThemedText style={styles.name} title>
        {fullName}
      </ThemedText>
      <ThemedText style={[styles.email, { color: colors.label }]}>
        {email}
      </ThemedText>
    </View>
  );
};

export default memo(ProfileHeader);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginBottom: 4,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
  },
});
