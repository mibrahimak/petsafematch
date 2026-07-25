import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ListingChip = ({ label, icon, accent = false }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: accent ? colors.primarySurface : colors.uiBackground,
          borderColor: accent ? colors.primary + '44' : colors.borderColor,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={12}
          color={accent ? colors.link : colors.text}
          style={styles.icon}
        />
      ) : null}
      <ThemedText
        style={[
          styles.label,
          { color: accent ? colors.link : colors.text },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
};

export default memo(ListingChip);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
