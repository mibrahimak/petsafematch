import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ProfileMenuItem = ({
  icon,
  label,
  value,
  badge,
  chevron = true,
  danger = false,
  isLast = false,
  onPress,
}) => {
  const { colors } = useTheme();

  const iconBackground = danger ? colors.warningSurface : colors.primarySurface;
  const iconColor = danger ? colors.warning : colors.primary;
  const labelColor = danger ? colors.warning : colors.title;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        },

        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
        <Ionicons name={icon} size={15} color={iconColor} />
      </View>

      <ThemedText style={[styles.label, { color: labelColor }]} title={!danger}>
        {label}
      </ThemedText>

      {badge !== undefined && badge > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.warning }]}>
          <ThemedText style={styles.badgeText}>{badge}</ThemedText>
        </View>
      ) : null}

      {value ? (
        <ThemedText style={[styles.value, { color: colors.label }]}>
          {value}
        </ThemedText>
      ) : null}

      {chevron && !value ? (
        <Ionicons name='chevron-forward' size={16} color={colors.iconColor} />
      ) : null}
    </Pressable>
  );
};

export default memo(ProfileMenuItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
  },
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
