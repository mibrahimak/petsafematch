import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteStore } from '../../src/store/useFavoriteStore';
import { usePetStore } from '../../src/store/usePetStore';
import { useTheme } from '../../hooks/useTheme';
import { AuthContext } from '../../contexts/AuthContext';
import { useListingOwner } from '../../hooks/useListingOwner';
import { supabase } from '../../libs/supabase';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ListingHero from '../../components/listing/ListingHero';
import ListingChip from '../../components/listing/ListingChip';
import ListingStatsRow from '../../components/listing/ListingStatsRow';
import ListingTabBar from '../../components/listing/ListingTabBar';
import ListingAboutTab from '../../components/listing/ListingAboutTab';
import ListingHealthTab from '../../components/listing/ListingHealthTab';
import ListingOwnerTab from '../../components/listing/ListingOwnerTab';
import ListingStickyCTA from '../../components/listing/ListingStickyCTA';
import { formatLocation } from '../../utils/formatLocation';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const pets = usePetStore((state) => state.pets);
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('about');
  const [listing, setListing] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);
  const viewIncrementedRef = useRef(false);

  const storePet = pets.find((item) => String(item.id) === String(id));
  const pet = storePet || listing;
  const isFavorite = favorites.includes(pet?.id);
  const { owner, loading: ownerLoading } = useListingOwner(pet?.userId);

  const traits = Array.isArray(pet?.traits) ? pet.traits : [];
  const healthStatus = pet?.health_status ?? {};

  useEffect(() => {
    if (!id || storePet) return;

    const fetchListing = async () => {
      setListingLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (error) {
        console.error('[ListingDetail] İlan yüklenemedi:', error);
        setListing(null);
      } finally {
        setListingLoading(false);
      }
    };

    fetchListing();
  }, [id, storePet]);

  useEffect(() => {
    if (!pet?.id || viewIncrementedRef.current) return;

    viewIncrementedRef.current = true;

    const incrementViewCount = async () => {
      try {
        const { error } = await supabase
          .from('listings')
          .update({ view_count: (pet.view_count ?? 0) + 1 })
          .eq('id', pet.id);

        if (error) throw error;
      } catch (error) {
        console.error(
          '[ListingDetail] Görüntüleme sayacı artırılamadı:',
          error
        );
      }
    };

    incrementViewCount();
  }, [pet?.id, pet?.view_count]);

  const handleFavoritePress = useCallback(() => {
    if (!user?.id) {
      Alert.alert(
        'Giriş gerekli',
        'Favorilere eklemek için giriş yapmalısınız.'
      );
      router.push('/(auth)/login');
      return;
    }
    toggleFavorite(pet.id, user.id);
  }, [user?.id, pet?.id, toggleFavorite, router]);

  const handleContactOwner = useCallback(() => {
    if (!user?.id) {
      Alert.alert('Giriş gerekli', 'Mesaj göndermek için giriş yapmalısınız.');
      router.push('/(auth)/login');
      return;
    }
    if (!pet?.userId) {
      Alert.alert('Hata', 'İlan sahibi bilgisi bulunamadı.');
      return;
    }
    if (pet.userId === user.id) {
      Alert.alert('Uyarı', 'Kendi ilanınıza mesaj gönderemezsiniz.');
      return;
    }
    router.push(`/messages/${pet.userId}?listingId=${pet.id}`);
  }, [user?.id, pet?.userId, router]);

  const handleShare = useCallback(async () => {
    if (!pet) return;

    try {
      await Share.share({
        message: `${pet.name} - ${pet.species || pet.category}\n${pet.description || ''}`,
      });
    } catch (error) {
      console.error('[ListingDetail] Paylaşım hatası:', error);
    }
  }, [pet]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (listingLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'İlan Detayı' }} />
        <ThemedText>Yükleniyor...</ThemedText>
      </ThemedView>
    );
  }

  if (!pet) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'İlan Detayı' }} />
        <ThemedText style={styles.notFoundTitle} title>
          İlan bulunamadı...
        </ThemedText>
        <ThemedText style={styles.notFoundSubtitle}>
          Bu ID ile eşleşen bir ilan yok!
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container} safe={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ListingHero
          imageUrl={pet.image_url}
          isFavorite={isFavorite}
          onBack={handleBack}
          onShare={handleShare}
          onFavoritePress={handleFavoritePress}
        />

        <View style={styles.content}>
          <ThemedText style={styles.name} title>
            {pet.name}
          </ThemedText>

          <View style={styles.chipRow}>
            <ListingChip label={pet.category} icon='paw-outline' accent />
            <ListingChip label={pet.gender} />
            <ListingChip label={pet.age} />
            {pet.species ? <ListingChip label={pet.species} /> : null}
          </View>

          <View style={styles.locationRow}>
            <Ionicons name='location-outline' size={14} color={colors.link} />
            <ThemedText style={styles.locationText}>
              {formatLocation(pet)}
            </ThemedText>
          </View>

          <ListingStatsRow
            weight={pet.weight}
            color={pet.color}
            createdAt={pet.created_at}
          />

          <ListingTabBar activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'about' ? (
            <ListingAboutTab description={pet.description} traits={traits} />
          ) : null}

          {activeTab === 'health' ? (
            <ListingHealthTab health={healthStatus} />
          ) : null}

          {activeTab === 'owner' ? (
            <ListingOwnerTab
              owner={owner}
              loading={ownerLoading}
              onMessagePress={handleContactOwner}
            />
          ) : null}
        </View>
      </ScrollView>

      <ListingStickyCTA onPress={handleContactOwner} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  notFoundSubtitle: {
    marginTop: 8,
    fontSize: 15,
  },
});
