import React, { memo } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ListingOwnerTab = ({ owner, loading, onMessagePress }) => {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='small' color={colors.primary} />
      </View>
    );
  }

  if (!owner) {
    return (
      <ThemedText style={[styles.emptyText, { color: colors.label }]}>
        Sahip bilgisi bulunamadı.
      </ThemedText>
    );
  }

  const fullName = owner.full_name || 'Kullanıcı';
  const avatarUrl =
    owner.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5046e5&color=fff&size=150`;

  const handleCallPress = () => {
    if (!owner.phone) return;
    Linking.openURL(`tel:${owner.phone}`);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.ownerCard,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.ownerInfo}>
          <ThemedText style={styles.ownerName} title>
            {fullName}
          </ThemedText>
          {owner.city ? (
            <ThemedText style={[styles.ownerMeta, { color: colors.label }]}>
              {owner.city}
            </ThemedText>
          ) : null}
          <ThemedText style={[styles.ownerMeta, { color: colors.label }]}>
            {owner.listingsCount ?? 0} ilan
            {owner.joinedYear ? ` · ${owner.joinedYear}'den beri` : ''}
          </ThemedText>
        </View>
        <Ionicons name='chevron-forward' size={16} color={colors.label} />
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.uiBackground,
              borderColor: colors.borderColor,
              opacity: owner.phone ? 1 : 0.5,
            },
          ]}
          onPress={handleCallPress}
          disabled={!owner.phone}
        >
          <Ionicons name='call-outline' size={16} color={colors.link} />
          <ThemedText style={styles.actionLabel} title>
            Ara
          </ThemedText>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.uiBackground,
              borderColor: colors.borderColor,
            },
          ]}
          onPress={onMessagePress}
        >
          <Ionicons name='chatbubble-outline' size={16} color={colors.link} />
          <ThemedText style={styles.actionLabel} title>
            Mesaj At
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

export default memo(ListingOwnerTab);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    marginBottom: 16,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ownerMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
