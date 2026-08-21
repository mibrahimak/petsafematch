import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import {
  StyleSheet,
  Pressable,
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
import { useHomeScreen } from '../../contexts/HomeScreenContext';
import { useScrollHideUi } from '../../hooks/useScrollHideUi';
import { FlashList } from '@shopify/flash-list';

import CreateListingModal from '../../components/CreateListingModal';
import ThemedView from '../../components/ThemedView';
import HomeFiltersPanel from '../../components/home/HomeFiltersPanel';
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

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState('Hepsi');
  const [searchQuery, setSearchQuery] = useState();
  const [modalVisible, setModalVisible] = useState(false);

  const { user } = useContext(AuthContext);
  const { viewMode, isCompactView, uiVisible, setUiVisible } = useHomeScreen();
  const { refreshing, onRefresh } = useRefresh();

  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const pets = usePetStore((state) => state.pets);
  const fetchPets = usePetStore((state) => state.fetchPets);

  const router = useRouter();
  const handleScroll = useScrollHideUi(setUiVisible);

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
      <HomeFiltersPanel
        uiVisible={uiVisible}
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={displayData.length}
        viewMode={viewMode}
      />

      <FlashList
        key={viewMode}
        data={displayData}
        renderItem={renderItem}
        numColumns={isCompactView ? 2 : 1}
        estimatedItemSize={isCompactView ? 210 : 340}
        onScroll={handleScroll}
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
