import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import { formatListingDate } from '../../utils/formatListingDate';

const STAT_ITEMS = [
  { key: 'weight', label: 'Ağırlık', icon: 'barbell-outline' },
  { key: 'color', label: 'Renk', icon: 'color-palette-outline' },
  { key: 'date', label: 'Tarih', icon: 'calendar-outline' },
];

const ListingStatsRow = ({ weight, color, createdAt }) => {
  const { colors } = useTheme();

  const values = {
    weight: weight || 'Belirtilmemiş',
    color: color || 'Belirtilmemiş',
    date: formatListingDate(createdAt),
  };

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
      {STAT_ITEMS.map((item, index) => (
        <View
          key={item.key}
          style={[
            styles.statItem,
            index < STAT_ITEMS.length - 1 && {
              borderRightWidth: 1,
              borderRightColor: colors.borderColor,
            },
          ]}
        >
          <Ionicons name={item.icon} size={15} color={colors.link} />
          <ThemedText style={styles.value} title>
            {values[item.key]}
          </ThemedText>
          <ThemedText style={[styles.label, { color: colors.label }]}>
            {item.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
};

export default memo(ListingStatsRow);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
  },
});
