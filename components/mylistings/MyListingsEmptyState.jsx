import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import { EMPTY_MESSAGES } from '../../constants/myListingsOptions';

const MyListingsEmptyState = ({ filter, onCreatePress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <Ionicons name='paw' size={28} color={colors.iconColor} />
      </View>

      <ThemedText style={styles.title} title>
        {EMPTY_MESSAGES[filter] || EMPTY_MESSAGES.all}
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: colors.label }]}>
        Patili dostunuzu sahiplendirecek birini bulmak için ilan ekleyin.
      </ThemedText>

      {filter === 'all' && (
        <Pressable
          onPress={onCreatePress}
          style={({ pressed }) => [
            styles.ctaButton,
            { backgroundColor: colors.primary },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name='add' size={16} color={colors.onPrimary} />
          <ThemedText style={[styles.ctaText, { color: colors.onPrimary }]}>
            Yeni İlan
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
};

export default memo(MyListingsEmptyState);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
