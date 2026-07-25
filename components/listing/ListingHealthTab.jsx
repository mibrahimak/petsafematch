import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import { HEALTH_OPTIONS } from '../../constants/listingOptions';
import { formatVetVisitDate } from '../../utils/formatListingDate';

const HealthBadge = ({ label, done }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: done ? 'rgba(16,185,129,0.08)' : colors.uiBackground,
          borderColor: done ? 'rgba(16,185,129,0.25)' : colors.borderColor,
        },
      ]}
    >
      <Ionicons
        name={done ? 'checkmark-circle' : 'shield-outline'}
        size={15}
        color={done ? '#10b981' : colors.label}
      />
      <ThemedText
        style={[styles.badgeLabel, { color: done ? '#10b981' : colors.label }]}
      >
        {label}
      </ThemedText>
    </View>
  );
};

const ListingHealthTab = ({ health = {} }) => {
  const { colors } = useTheme();
  const safeHealth = health ?? {};
  const vetDate = formatVetVisitDate(safeHealth.last_vet_visit);
  const vetClinic = safeHealth.last_vet_clinic;
  const hasVetInfo = Boolean(vetDate || vetClinic);

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.sectionTitle, { color: colors.label }]}>
        Sağlık Durumu
      </ThemedText>

      <View style={styles.badgeGrid}>
        {HEALTH_OPTIONS.map((option) => (
          <HealthBadge
            key={option.key}
            label={option.label}
            done={Boolean(safeHealth[option.key])}
          />
        ))}
      </View>

      {hasVetInfo ? (
        <View
          style={[
            styles.vetCard,
            {
              backgroundColor: colors.primarySurface,
              borderColor: colors.primary + '33',
            },
          ]}
        >
          <Ionicons name='medkit-outline' size={18} color={colors.link} />
          <View style={styles.vetInfo}>
            <ThemedText style={styles.vetTitle} title>
              Son veteriner ziyareti
            </ThemedText>
            <ThemedText style={[styles.vetSubtitle, { color: colors.label }]}>
              {[vetDate, vetClinic].filter(Boolean).join(' · ')}
            </ThemedText>
          </View>
        </View>
      ) : (
        <ThemedText style={[styles.emptyText, { color: colors.label }]}>
          Veteriner ziyareti bilgisi eklenmemiş.
        </ThemedText>
      )}
    </View>
  );
};

export default memo(ListingHealthTab);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    width: '48%',
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  vetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  vetInfo: {
    flex: 1,
  },
  vetTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  vetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
  },
});
