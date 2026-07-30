import React, { memo, useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import {
  getAvatarColor,
  getInitials,
  LISTING_STATUS,
  STATUS_CONFIG,
} from '../../constants/myListingsOptions';
import { formatLocation } from '../../utils/formatLocation';

const ListingAvatar = memo(function ListingAvatar({ imageUrl, name }) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        {
          backgroundColor: color + '33',
          borderColor: color + '44',
        },
      ]}
    >
      <ThemedText style={[styles.avatarInitials, { color }]}>{initials}</ThemedText>
    </View>
  );
});

const StatPill = memo(function StatPill({ icon, value, label }) {
  const { colors } = useTheme();

  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={12} color={colors.label} />
      <ThemedText style={[styles.statValue, { color: colors.text }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.label }]}>
        {label}
      </ThemedText>
    </View>
  );
});

const MyListingCard = ({ listing, onDelete }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const statusConfig =
    STATUS_CONFIG[listing.status] || STATUS_CONFIG[LISTING_STATUS.ACTIVE];

  const handleEdit = useCallback(() => {
    setMenuOpen(false);
    Alert.alert('Bilgi', 'İlan düzenleme özelliği yakında eklenecek.');
  }, []);

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    onDelete?.(listing.id);
  }, [listing.id, onDelete]);

  const handleDetailPress = useCallback(() => {
    router.push({ pathname: '/ilan/[id]', params: { id: listing.id } });
  }, [listing.id, router]);

  const handleCardPress = useCallback(() => {
    handleDetailPress();
  }, [handleDetailPress]);

  return (
    <Pressable
      onPress={handleCardPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.uiBackground,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.row}>
        <ListingAvatar imageUrl={listing.image_url} name={listing.name} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <ThemedText style={styles.name} numberOfLines={1} title>
                {listing.name}
              </ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bg },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon}
                  size={11}
                  color={statusConfig.color}
                />
                <ThemedText
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {statusConfig.label}
                </ThemedText>
              </View>
            </View>

            <Pressable
              onPress={() => setMenuOpen(true)}
              style={styles.menuButton}
              hitSlop={8}
            >
              <Ionicons
                name='ellipsis-vertical'
                size={16}
                color={colors.iconColor}
              />
            </Pressable>
          </View>

          <ThemedText style={[styles.meta, { color: colors.text }]}>
            {listing.species || 'Belirtilmemiş'} · {listing.age || 'Belirtilmemiş'}
          </ThemedText>

          <View style={styles.locationRow}>
            <View style={styles.locationBlock}>
              <Ionicons name='location-outline' size={11} color={colors.label} />
              <ThemedText style={[styles.locationText, { color: colors.label }]}>
                {formatLocation(listing)}
              </ThemedText>
            </View>
            <View style={styles.timeBlock}>
              <Ionicons name='time-outline' size={10} color={colors.label} />
              <ThemedText style={[styles.timeText, { color: colors.label }]}>
                {formatDaysAgo(listing.created_at)}
              </ThemedText>
            </View>
          </View>

          <View
            style={[styles.statsRow, { borderTopColor: colors.borderColor }]}
          >
            <StatPill
              icon='eye-outline'
              value={listing.view_count ?? 0}
              label='görüntüleme'
            />
            <StatPill
              icon='heart-outline'
              value={listing.favoriteCount ?? 0}
              label='favori'
            />
            <Pressable
              onPress={handleDetailPress}
              style={styles.detailButton}
              hitSlop={8}
            >
              <ThemedText style={[styles.detailText, { color: colors.primary }]}>
                Detay
              </ThemedText>
              <Ionicons name='chevron-forward' size={12} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType='fade'
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuOpen(false)}>
          <View
            style={[
              styles.menu,
              {
                backgroundColor: colors.uiBackground,
                borderColor: colors.borderColor,
              },
            ]}
          >
            <Pressable
              onPress={handleEdit}
              style={[
                styles.menuItem,
                { borderBottomColor: colors.borderColor },
              ]}
            >
              <Ionicons name='create-outline' size={14} color={colors.primary} />
              <ThemedText style={styles.menuItemText} title>Düzenle</ThemedText>
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.menuItem}>
              <Ionicons name='trash-outline' size={14} color={colors.warning} />
              <ThemedText style={[styles.menuItemText, { color: colors.warning }]}>
                Sil
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </Pressable>
  );
};

export default memo(MyListingCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  menuButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  meta: {
    fontSize: 12,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menu: {
    width: 180,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
