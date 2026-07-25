import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const MyListingsFilterTabs = ({ tabs, activeFilter, counts, onFilterChange }) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onFilterChange(tab.id)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.uiBackground,
                borderColor: isActive ? colors.primary : colors.borderColor,
              },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText
              style={[
                styles.chipLabel,
                { color: isActive ? colors.onPrimary : colors.label },
              ]}
            >
              {tab.label}
            </ThemedText>
            {count > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActive
                      ? 'rgba(255,255,255,0.2)'
                      : colors.background,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.badgeText,
                    { color: isActive ? colors.onPrimary : colors.text },
                  ]}
                >
                  {count}
                </ThemedText>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default memo(MyListingsFilterTabs);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
