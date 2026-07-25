import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import ListingChip from './ListingChip';
import { getTraitIcon } from '../../constants/listingOptions';

const ListingAboutTab = ({ description, traits = [] }) => {
  const { colors } = useTheme();
  const safeTraits = Array.isArray(traits) ? traits : [];

  return (
    <View style={styles.container}>
      <ThemedText style={styles.description}>{description}</ThemedText>

      <ThemedText style={[styles.sectionTitle, { color: colors.label }]}>
        Karakter Özellikleri
      </ThemedText>

      {safeTraits.length > 0 ? (
        <View style={styles.chipRow}>
          {safeTraits.map((trait) => (
            <ListingChip
              key={trait}
              label={trait}
              icon={getTraitIcon(trait)}
              accent
            />
          ))}
        </View>
      ) : (
        <ThemedText style={[styles.emptyText, { color: colors.label }]}>
          Karakter özelliği eklenmemiş.
        </ThemedText>
      )}
    </View>
  );
};

export default memo(ListingAboutTab);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
});
