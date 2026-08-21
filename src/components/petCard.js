import React, { memo } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FontAwesome } from '@expo/vector-icons';
import { formatLocation } from '../../utils/formatLocation';
import ThemedText from '../../components/ThemedText';

const FavoriteButton = memo(function FavoriteButton({
  isFavorite,
  onPress,
  compact,
}) {
  return (
    <Pressable
      style={[styles.favoriteButton, compact && styles.favoriteButtonCompact]}
      onPress={onPress}
    >
      <FontAwesome
        name={isFavorite ? 'heart' : 'heart-o'}
        size={compact ? 14 : 18}
        color={isFavorite ? '#EF4444' : '#374151'}
      />
    </Pressable>
  );
});

const PetCard = ({
  pet,
  onPress,
  isFavorite,
  onFavoritePress,
  variant = 'large',
}) => {
  const { colors } = useTheme();
  const isCompact = variant === 'compact';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompact && styles.cardCompact,
        { backgroundColor: colors.uiBackground },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image
        source={{ uri: pet.image_url }}
        style={[styles.petImage, isCompact && styles.petImageCompact]}
      />

      <FavoriteButton
        isFavorite={isFavorite}
        compact={isCompact}
        onPress={(e) => {
          e.preventDefault();
          if (typeof onFavoritePress === 'function') {
            onFavoritePress();
          }
        }}
      />

      <View style={[styles.cardDetails, isCompact && styles.cardDetailsCompact]}>
        <View style={styles.headerRow}>
          <ThemedText
            style={[styles.petName, isCompact && styles.petNameCompact]}
            title={true}
          >
            {pet.name}
          </ThemedText>

          <View
            style={[
              styles.genderBadge,
              isCompact && styles.genderBadgeCompact,
              {
                backgroundColor: pet.gender === 'Dişi' ? '#fdf2f8' : '#eff6ff',
              },
            ]}
          >
            <ThemedText
              style={[
                styles.genderText,
                isCompact && styles.genderTextCompact,
                { color: pet.gender === 'Dişi' ? '#db2777' : '#2563eb' },
              ]}
            >
              {pet.gender}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.petMeta, isCompact && styles.petMetaCompact]}>
          {pet.category} • {pet.age} •{' '}
          {formatLocation({
            city: pet.city,
            district: pet.district,
            hideExactLocation: pet.profiles?.hide_exact_location === true,
          })}
        </ThemedText>

        <ThemedText
          style={[styles.description, isCompact && styles.descriptionCompact]}
          numberOfLines={isCompact ? 1 : 2}
        >
          {pet.description}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default memo(PetCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompact: {
    borderRadius: 12,
    marginBottom: 10,
  },
  petImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  petImageCompact: {
    height: 110,
  },
  cardDetails: {
    padding: 16,
  },
  cardDetailsCompact: {
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  petNameCompact: {
    fontSize: 15,
  },
  genderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderBadgeCompact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  genderTextCompact: {
    fontSize: 10,
  },
  petMeta: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  petMetaCompact: {
    fontSize: 11,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  descriptionCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  favoriteButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  favoriteButtonCompact: {
    right: 8,
    top: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
