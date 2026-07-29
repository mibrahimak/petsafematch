import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ListingStickyCTA = ({ onPress }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: insets.bottom + 16,
          backgroundColor: colors.background,
          borderTopColor: colors.borderColor || 'rgba(0,0,0,0.05)',
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.buttonWrapper,
          { backgroundColor: colors.primary },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name='chatbubble-outline'
          size={18}
          color={colors.onPrimary}
        />
        <ThemedText style={[styles.label, { color: colors.onPrimary }]}>
          Sahibiyle İletişime Geç
        </ThemedText>
      </Pressable>
    </View>
  );
};

export default memo(ListingStickyCTA);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  buttonWrapper: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
