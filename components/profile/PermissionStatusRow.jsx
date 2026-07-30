import React, { memo, useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import {
  canRequestPermission,
  getPermissionStatusColor,
  getPermissionStatusLabel,
  shouldOpenSettings,
} from '../../utils/permissionLabels';
import { openAppSettings } from '../../utils/openAppSettings';

const PermissionStatusRow = ({
  icon,
  title,
  description,
  permission,
  permissionKey,
  onRequest,
  isLast = false,
  requesting = false,
}) => {
  const { colors } = useTheme();

  const statusColor = getPermissionStatusColor(permission?.status);
  const statusLabel = getPermissionStatusLabel(permission?.status);
  const showRequestButton = canRequestPermission(permission);
  const showSettingsButton = shouldOpenSettings(permission);
  const isGranted = permission?.status === 'granted';

  const handleActionPress = useCallback(async () => {
    if (showSettingsButton) {
      await openAppSettings();
      return;
    }

    if (showRequestButton) {
      await onRequest(permissionKey);
    }
  }, [onRequest, permissionKey, showRequestButton, showSettingsButton]);

  return (
    <View
      style={[
        styles.container,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.primarySurface }]}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>

        <View style={styles.textBlock}>
          <ThemedText style={styles.title} title>
            {title}
          </ThemedText>
          <ThemedText style={[styles.description, { color: colors.label }]}>
            {description}
          </ThemedText>
        </View>

        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <ThemedText style={[styles.badgeText, { color: statusColor }]}>
            {statusLabel}
          </ThemedText>
        </View>
      </View>

      {!isGranted && (showRequestButton || showSettingsButton) ? (
        <Pressable
          onPress={handleActionPress}
          disabled={requesting}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: showSettingsButton
                ? colors.uiBackground
                : colors.primary,
              borderColor: showSettingsButton ? colors.borderColor : colors.primary,
            },
            pressed && styles.pressed,
            requesting && styles.disabled,
          ]}
        >
          {requesting ? (
            <ActivityIndicator
              size='small'
              color={showSettingsButton ? colors.primary : '#FFFFFF'}
            />
          ) : (
            <ThemedText
              style={[
                styles.actionText,
                {
                  color: showSettingsButton ? colors.primary : '#FFFFFF',
                },
              ]}
            >
              {showSettingsButton ? 'Sistem Ayarlarına Git' : 'İzin Ver'}
            </ThemedText>
          )}
        </Pressable>
      ) : null}
    </View>
  );
};

export default memo(PermissionStatusRow);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionButton: {
    marginTop: 12,
    marginLeft: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.6,
  },
});
