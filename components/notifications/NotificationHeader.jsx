import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const NotificationHeader = ({
  unreadCount,
  hasNotifications,
  onBack,
  onMarkAllRead,
  onDeleteAll,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <Pressable
          style={[
            styles.iconButton,
            {
              backgroundColor: colors.uiBackground,
              borderColor: colors.borderColor,
            },
          ]}
          onPress={onBack}
        >
          <Ionicons name='arrow-back' size={18} color={colors.title} />
        </Pressable>

        <View>
          <ThemedText style={styles.title} title>
            Bildirimler
          </ThemedText>
          {unreadCount > 0 ? (
            <ThemedText style={[styles.subtitle, { color: colors.label }]}>
              {unreadCount} okunmamış
            </ThemedText>
          ) : null}
        </View>
      </View>

      <View style={styles.actions}>
        {unreadCount > 0 ? (
          <Pressable
            style={[
              styles.markAllButton,
              {
                backgroundColor: colors.primarySurface,
                borderColor: colors.primary + '33',
              },
            ]}
            onPress={onMarkAllRead}
          >
            <Ionicons name='checkmark-done' size={13} color={colors.primary} />
            <ThemedText style={[styles.markAllText, { color: colors.primary }]}>
              Tümünü oku
            </ThemedText>
          </Pressable>
        ) : null}

        {hasNotifications ? (
          <Pressable
            style={[
              styles.iconButton,
              {
                backgroundColor: colors.uiBackground,
                borderColor: colors.borderColor,
              },
            ]}
            onPress={onDeleteAll}
          >
            <Ionicons name='trash-outline' size={15} color={colors.label} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default memo(NotificationHeader);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
