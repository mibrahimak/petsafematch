import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { colors } from '../../constants/colors';

const ListingHero = ({
  imageUrl,
  isFavorite,
  onBack,
  onShare,
  onFavoritePress,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <LinearGradient
        colors={['transparent', colors.background]}
        style={styles.bottomGradient}
      />

      <View style={[styles.navRow, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={[
            styles.navButton,
            {
              borderColor: colors.borderColor,
              backgroundColor: colors.navBackground,
            },
          ]}
          onPress={onBack}
        >
          <Ionicons name='arrow-back' size={20} color={colors.title} />
        </Pressable>

        <View style={styles.navActions}>
          <Pressable
            style={[
              styles.navButton,
              {
                borderColor: colors.borderColor,
                backgroundColor: colors.navBackground,
              },
            ]}
            onPress={onShare}
          >
            <Ionicons name='share-outline' size={18} color={colors.title} />
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              {
                borderColor: isFavorite
                  ? colors.warning + '55'
                  : colors.borderColor,
                backgroundColor: isFavorite
                  ? colors.warningSurface
                  : 'rgba(15,23,42,0.65)',
              },
            ]}
            onPress={onFavoritePress}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.warning : colors.title}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

export default memo(ListingHero);

const styles = StyleSheet.create({
  container: {
    height: 310,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  navRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,

    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
});
