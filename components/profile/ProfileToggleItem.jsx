import React, { memo } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ProfileToggleItem = ({
  icon,
  label,
  value,
  onValueChange,
  isLast = false,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <View
        style={[styles.iconBox, { backgroundColor: colors.primarySurface }]}
      >
        <Ionicons name={icon} size={15} color={colors.primary} />
      </View>

      <ThemedText style={styles.label} title>
        {label}
      </ThemedText>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.borderColor,
          true: colors.primary,
        }}
        thumbColor='#ffffff'
      />
    </View>
  );
};

export default memo(ProfileToggleItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
});
