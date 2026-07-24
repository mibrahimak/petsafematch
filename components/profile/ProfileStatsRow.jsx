import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const STAT_KEYS = ['listings', 'favorites', 'pets'];

const ProfileStatsRow = ({ stats, onStatPress }) => {
  const { colors } = useTheme();

  const handlePress = useCallback(
    (key) => {
      onStatPress?.(key);
    },
    [onStatPress]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.uiBackground,
          borderColor: colors.borderColor,
        },
      ]}
    >
      {stats.map((stat, index) => (
        <Pressable
          key={stat.key}
          onPress={() => handlePress(stat.key)}
          style={({ pressed }) => [
            styles.statItem,
            index < stats.length - 1 && {
              borderRightWidth: 1,
              borderRightColor: colors.borderColor,
            },
            pressed && styles.pressed,
          ]}
        >
          <ThemedText style={styles.statValue} title>
            {stat.value}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.label }]}>
            {stat.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
};

export { STAT_KEYS };
export default memo(ProfileStatsRow);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
