import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ANIMATION_DURATION = 280;
const COLLAPSED_MAX_HEIGHT = 220;

const CategoryChip = memo(function CategoryChip({ label, isActive, onPress }) {
  return (
    <Pressable
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
});

const HomeFiltersPanel = ({
  uiVisible,
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  resultCount,
  viewMode,
}) => {
  const { colors } = useTheme();
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_MAX_HEIGHT)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const [contentHeight, setContentHeight] = useState(COLLAPSED_MAX_HEIGHT);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: uiVisible ? contentHeight : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: uiVisible ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  }, [uiVisible, contentHeight, animatedHeight, animatedOpacity]);

  const viewModeLabel =
    viewMode === 'large' ? 'Liste görünümü' : 'Izgara görünümü';

  return (
    <Animated.View
      style={[
        styles.collapsible,
        {
          maxHeight: animatedHeight,
          opacity: animatedOpacity,
          borderBottomColor: colors.borderColor,
        },
      ]}
    >
      <View
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height;
          if (nextHeight > 0 && nextHeight !== contentHeight) {
            setContentHeight(nextHeight);
          }
        }}
      >
        <ScrollView
          horizontal
          contentContainerStyle={styles.categoryContent}
          showsHorizontalScrollIndicator={false}
          alwaysBounceHorizontal={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              isActive={activeCategory === category}
              onPress={() => onCategoryChange(category)}
            />
          ))}
        </ScrollView>

        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder='Irk, isim veya açıklama ara...'
          placeholderTextColor={colors.label}
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.uiBackground,
              borderColor: colors.borderColor,
              color: colors.title,
            },
          ]}
        />

        <View style={styles.resultRow}>
          <ThemedText style={[styles.resultCount, { color: colors.label }]}>
            <ThemedText
              style={[styles.resultCountValue, { color: colors.title }]}
            >
              {resultCount}
            </ThemedText>
            {' '}
            ilan bulundu
          </ThemedText>
          <ThemedText style={[styles.viewModeLabel, { color: colors.label }]}>
            {viewModeLabel}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
};

export default memo(HomeFiltersPanel);

const styles = StyleSheet.create({
  collapsible: {
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  categoryScroll: {
    flexGrow: 0,
    maxHeight: 65,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
    height: 65,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    height: 36,
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultCount: {
    fontSize: 12,
  },
  resultCountValue: {
    fontWeight: '600',
  },
  viewModeLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
