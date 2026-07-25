import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import { SUMMARY_ITEMS } from '../../constants/myListingsOptions';

const MyListingsSummaryRow = ({ counts }) => {
  const { colors } = useTheme();

  const getColor = (item) => {
    if (item.colorKey === 'primary') return colors.primary;
    if (item.colorKey === 'label') return colors.label;
    return item.color;
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
      {SUMMARY_ITEMS.map((item, index) => (
        <View
          key={item.key}
          style={[
            styles.statItem,
            index < SUMMARY_ITEMS.length - 1 && {
              borderRightWidth: 1,
              borderRightColor: colors.borderColor,
            },
          ]}
        >
          <ThemedText style={[styles.statValue, { color: getColor(item) }]}>
            {counts[item.key] ?? 0}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.label }]}>
            {item.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
};

export default memo(MyListingsSummaryRow);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
