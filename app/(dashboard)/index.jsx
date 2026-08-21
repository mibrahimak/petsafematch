import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import {
  StyleSheet,
  TextInput,
  Pressable,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  View,
} from 'react-native';
import { useFavoriteStore } from '../../src/store/useFavoriteStore';
import { usePetStore } from '../../src/store/usePetStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRefresh } from '../../hooks/useRefresh';
import { AuthContext } from '../../contexts/AuthContext';
import { FlashList } from '@shopify/flash-list';

import CreateListingModal from '../../components/CreateListingModal';
import ThemedView from '../../components/ThemedView';
import PetCard from '../../src/components/petCard';
import { useTheme } from '../../hooks/useTheme';

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
  const [viewMode, setViewMode] = useState('large');

  const { user } = useContext(AuthContext);
  const { refreshing, onRefresh } = useRefresh();

  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const pets = usePetStore((state) => state.pets);
  const fetchPets = usePetStore((state) => state.fetchPets);

  const router = useRouter();

  const isCompactView = viewMode === 'compact';

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

  const handleFavoritePress = useCallback(
    (petId) => {
      if (!user?.id) {
        Alert.alert(
          'Giriş gerekli',
          'Favorilere eklemek için giriş yapmalısınız.'
        );
        router.push('/(auth)/login');
        return;
      }
      toggleFavorite(petId, user.id);
    },
    [user?.id, toggleFavorite, router]
  );

  const handleViewModeToggle = useCallback(() => {
    setViewMode((current) => (current === 'large' ? 'compact' : 'large'));
  }, []);

  const handlePetPress = useCallback(
    (petId) => {
      router.push({ pathname: '/ilan/[id]', params: { id: petId } });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }) => {
      const isCardFavorite = favorites.includes(item.id);
      const card = (
        <PetCard
          pet={item}
          variant={viewMode}
          isFavorite={isCardFavorite}
          onFavoritePress={() => handleFavoritePress(item.id)}
          onPress={() => handlePetPress(item.id)}
        />
      );

      if (isCompactView) {
        return <View style={styles.compactCardWrapper}>{card}</View>;
      }

      return card;
    },
    [favorites, viewMode, isCompactView, handleFavoritePress, handlePetPress]
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.categoryContent}
        showsHorizontalScrollIndicator={false}
        alwaysBounceHorizontal={false}
        style={styles.categoryScroll}
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

      <View style={styles.searchRow}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='Irk, isim veya açıklama ara...'
          placeholderTextColor='#9CA3AF'
          style={styles.searchInput}
        />
        <Pressable
          style={styles.viewToggleButton}
          onPress={handleViewModeToggle}
          accessibilityLabel={
            isCompactView ? 'Büyük görünüm' : 'Kompakt görünüm'
          }
        >
          <Ionicons
            name={isCompactView ? 'list-outline' : 'grid-outline'}
            size={22}
            color='#374151'
          />
        </Pressable>
      </View>

      <FlashList
        key={viewMode}
        data={displayData}
        renderItem={renderItem}
        numColumns={isCompactView ? 2 : 1}
        estimatedItemSize={isCompactView ? 210 : 340}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
          />
        }
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111827',
  },
  viewToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  compactCardWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 56,
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    hadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 10,
  },
});
