import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const MyListingsHeader = ({ totalCount, activeCount, onCreatePress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <ThemedText style={styles.title} title>
          İlanlarım
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.label }]}>
          {totalCount} ilan · {activeCount} aktif
        </ThemedText>
      </View>

      <Pressable
        onPress={onCreatePress}
        style={({ pressed }) => [
          styles.createButton,
          { backgroundColor: colors.primary },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons name='add' size={16} color={colors.onPrimary} />
        <ThemedText style={[styles.createButtonText, { color: colors.onPrimary }]}>
          Yeni İlan
        </ThemedText>
      </Pressable>
    </View>
  );
};

export default memo(MyListingsHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  textBlock: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
