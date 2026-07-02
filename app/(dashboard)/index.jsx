import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from 'react';
import {
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Text,
  ScrollView,
} from 'react-native';
import { useFavoriteStore } from '../../src/store/useFavoriteStore';
import { ScrollContext } from '../../contexts/ScrollContext';
import { usePetStore } from '../../src/store/usePetStore';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

import CreateListingModal from '../../components/CreateListingModal';
import ThemedView from '../../components/ThemedView';
import PetCard from '../../src/components/petCard';

const CATEGORIES = ['Hepsi', 'Kedi', 'Köpek', 'Kuş', 'Diğer'];

const normalizeText = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

const CategoryChip = React.memo(function CategoryChip({
  label,
  isActive,
  onPress,
}) {
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

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState('Hepsi');
  const [searchQuery, setSearchQuery] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const { colors } = useTheme();

  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const pets = usePetStore((state) => state.pets);
  const fetchPets = usePetStore((state) => state.fetchPets);

  const router = useRouter();

  useEffect(() => {
    fetchPets();
  }, []);

  const displayData = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery?.trim());
    const sourceData =
      activeCategory === 'Hepsi'
        ? pets
        : pets.filter((pet) => {
            const type = normalizeText(pet.type || pet.species || '');
            const normalizedCategory = normalizeText(activeCategory);
            if (normalizedCategory === 'diğer') {
              return !['Kedi', 'Köpek', 'Kuş'].includes(type);
            }
            return type === normalizedCategory;
          });

    if (!normalizedSearch) return sourceData;

    return sourceData.filter((pet) => {
      const searchable = normalizeText(
        `${pet.name || ''} ${pet.species || ''} ${pet.type || ''} ${pet.description || ''}`
      );
      return searchable.includes(normalizedSearch);
    });
  }, [activeCategory, pets, searchQuery]);

  const handleCategoryChange = useCallback(
    (category) => setActiveCategory(category),
    []
  );

  const handleFavoritePress = useCallback((petId) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(petId)) {
        return prevFavorites.filter((id) => id !== petId);
      } else {
        return [...prevFavorites, petId];
      }
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.categoryContent}
        showsHorizontalScrollIndicator={false}
        alwaysBounceHorizontal={false}
        style={{ flexGrow: 0, maxHeight: 65 }}
      >
        {CATEGORIES.map((category) => (
          <CategoryChip
            key={category}
            label={category}
            isActive={activeCategory === category}
            onPress={() => handleCategoryChange(category)}
          />
        ))}
      </ScrollView>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder='Irk, isim veya açıklama ara...'
        placeholderTextColor='#9CA3AF'
        style={styles.searchInput}
      />

      <FlatList
        data={displayData}
        renderItem={({ item }) => {
          const isCardFavorite = favorites.includes(item.id);

          return (
            <PetCard
              pet={item}
              isFavorite={isCardFavorite}
              onFavoritePress={() => toggleFavorite(item.id)}
              onPress={() =>
                router.push({ pathname: '/ilan/[id]', params: { id: item.id } })
              }
            />
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      />

      <Pressable
        style={[styles.floatingButton, { backgroundColor: '#2563EB' }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name='add' size={30} color='#FFF' />
      </Pressable>
      <CreateListingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onRefreshListings={fetchPets}
      />
    </ThemedView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
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
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
  },
  listContainer: {
    padding: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
