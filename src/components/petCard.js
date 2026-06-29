import React, { memo } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../../components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';

const FavoriteButton = memo(function FavoriteButton({ isFavorite, onPress }) {
  return (
    <Pressable style={styles.favoriteButton} onPress={onPress}>
      <FontAwesome
        name={isFavorite ? 'heart' : 'heart-o'}
        size={18}
        color={isFavorite ? '#EF4444' : '#374151'}
      />
    </Pressable>
  );
});

const PetCard = ({ pet, onPress, isFavorite, onFavoritePress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.uiBackground }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image source={{ uri: pet.image_url }} style={styles.petImage} />

      <FavoriteButton
        isFavorite={isFavorite}
        onPress={(e) => {
          e.preventDefault();
          if (typeof onFavoritePress === 'function') {
            onFavoritePress();
          }
        }}
      />

      <View style={styles.cardDetails}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.petName} title={true}>
            {pet.name}
          </ThemedText>

          <View
            style={[
              styles.genderBadge,
              {
                backgroundColor: pet.gender === 'Dişi' ? '#fdf2f8' : '#eff6ff',
              },
            ]}
          >
            <ThemedText
              style={[
                styles.genderText,
                { color: pet.gender === 'Dişi' ? '#db2777' : '#2563eb' },
              ]}
            >
              {pet.gender}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.petMeta}>
          {pet.category} • {pet.age} • {pet.location}
        </ThemedText>

        <ThemedText style={styles.description} numberOfLines={2}>
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
  petImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardDetails: {
    padding: 16,
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
  },
  genderBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  petMeta: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
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
});
