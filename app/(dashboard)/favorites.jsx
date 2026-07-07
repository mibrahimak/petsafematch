import {
  FlatList,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { usePetStore } from '../../src/store/usePetStore';
import { useFavoriteStore } from '../../src/store/useFavoriteStore';
import { useRefresh } from '../../hooks/useRefresh';
import PetCard from '../../src/components/petCard';
import LottieView from 'lottie-react-native';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';

const Favorites = () => {
  const router = useRouter();

  const { refreshing, onRefresh } = useRefresh();

  const pets = usePetStore((state) => state.pets);
  const favoriteIds = useFavoriteStore((state) => state.favorites);
  const favorites = pets.filter((item) => favoriteIds.includes(item.id));

  const renderItem = useCallback(
    ({ item }) => (
      <ThemedView style={styles.cardContainer}>
        <PetCard
          isFavorite={true}
          pet={item}
          onPress={() =>
            router.push({ pathname: '/ilan/[id]', params: { id: item.id } })
          }
        />
      </ThemedView>
    ),
    [router]
  );
  return (
    <ThemedView style={styles.container} safe={true}>
      {favorites.length === 0 ? (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2563eb']}
              />
            }
          >
            <ThemedText style={styles.title} title={true}>
              Favoriler
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Henüz favoriniz yok. Bir dost seçmeye ne dersiniz?
            </ThemedText>
            <LottieView
              source={{
                uri: 'https://assets7.lottiefiles.com/packages/lf20_jz2wa00k.json',
              }}
              autoPlay
              loop
              style={styles.emptyAnimation}
            />
          </ScrollView>
        </>
      ) : (
        <FlatList
          key='favorites-grid'
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStlye={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563EB']}
            />
          }
        />
      )}
    </ThemedView>
  );
};

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingVertical: 8,
    gap: 14,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
  },
  emptyAnimation: {
    width: 200,
    height: 200,
    marginBottom: 4,
  },
});
