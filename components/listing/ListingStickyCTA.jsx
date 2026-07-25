import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
          backgroundColor: colors.background + '00',
        },
      ]}
    >
      <LinearGradient
        colors={[colors.background + '00', colors.background]}
        style={styles.fade}
        pointerEvents='none'
      />

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.buttonWrapper, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Ionicons name='chatbubble-outline' size={18} color={colors.onPrimary} />
          <ThemedText style={[styles.label, { color: colors.onPrimary }]}>
            Sahibiyle İletişime Geç
          </ThemedText>
        </LinearGradient>
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
  fade: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 40,
  },
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button: {
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
  },
});
