import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Colors } from '../../constants/colors';

const SEGMENTS = [
  { mode: 'large', icon: 'list-outline', label: 'Liste görünümü' },
  { mode: 'compact', icon: 'grid-outline', label: 'Izgara görünümü' },
];

const ViewToggle = ({ viewMode, onViewModeChange }) => {
  const { colors } = useTheme();

  const handlePress = useCallback(
    (mode) => {
      if (mode !== viewMode) {
        onViewModeChange(mode);
      }
    },
    [viewMode, onViewModeChange]
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
      {SEGMENTS.map(({ mode, icon, label }) => {
        const isActive = viewMode === mode;

        return (
          <Pressable
            key={mode}
            style={[
              styles.segment,
              isActive && { backgroundColor: colors.primary },
            ]}
            onPress={() => handlePress(mode)}
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
          >
            <Ionicons
              name={icon}
              size={15}
              color={isActive ? Colors.onPrimary : colors.iconColor}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default memo(ViewToggle);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
  },
  segment: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
