import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
  ActivityIndicator,
  View,
  Pressable,
  Image,
  Text,
} from 'react-native';
import { useRefresh } from '../../hooks/useRefresh';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../libs/supabase';
import {
  checkIsMutualMatch,
  fetchExcludedTargetPetIds,
  recordPetImpression,
  recordPetSwipe,
} from '../../libs/matchUtils';
import { getHiddenPetIds as getCachedHiddenPetIds } from '../../libs/matchDeckCache';
import { useMatchCelebration } from '../../contexts/MatchCelebrationContext';
import { useMatchDeckStore } from '../../src/store/useMatchDeckStore';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';

const { width, height } = Dimensions.get('window');

const mapCandidateRow = (row) => ({
  id: row.user_pets.id,
  match_mypet_id: row.id,
  userId: row.userId,
  name: row.user_pets.name,
  species: row.user_pets.species,
  age: row.user_pets.age,
  gender: row.user_pets.gender,
  category: row.user_pets.category,
  image_url: row.user_pets.image_url,
  location: row.profiles?.city ?? '',
  description: '',
});

const Match = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();
  const { showCelebration } = useMatchCelebration();
  const hidePet = useMatchDeckStore((state) => state.hidePet);
  const unhidePet = useMatchDeckStore((state) => state.unhidePet);
  const getStoreHiddenPetIds = useMatchDeckStore((state) => state.getHiddenPetIds);
  const mergeHiddenFromCache = useMatchDeckStore(
    (state) => state.mergeHiddenFromCache
  );

  const swiperRef = useRef(null);
  const matchCandidatesRef = useRef([]);
  const selectedMyPetRef = useRef(null);

  const [myPets, setMyPets] = useState([]);
  const [selectedMyPet, setSelectedMyPet] = useState(null);
  const [matchCandidates, setMatchCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    matchCandidatesRef.current = matchCandidates;
  }, [matchCandidates]);

  useEffect(() => {
    selectedMyPetRef.current = selectedMyPet;
  }, [selectedMyPet]);

  const fetchCandidates = useCallback(
    async (myPet) => {
      if (!user?.id || !myPet?.id) return;

      try {
        const targetGender = myPet.gender === 'Erkek' ? 'Dişi' : 'Erkek';

        const { data, error } = await supabase
          .from('match_mypet')
          .select(
            `
            id,
            userId,
            pet_id,
            user_pets!inner (
              id, name, category, species, gender, age, image_url
            ),
            profiles!userId ( city )
          `
          )
          .eq('is_active', true)
          .eq('user_pets.category', myPet.category)
          .eq('user_pets.gender', targetGender)
          .neq('userId', user.id);

        if (error) throw error;

        const cachedHidden = await getCachedHiddenPetIds(myPet.id);
        mergeHiddenFromCache(myPet.id, cachedHidden);

        const [excludedIds, storeHidden] = await Promise.all([
          fetchExcludedTargetPetIds(supabase, myPet.id, user.id),
          Promise.resolve(getStoreHiddenPetIds(myPet.id)),
        ]);

        const hiddenSet = new Set([...excludedIds, ...storeHidden, ...cachedHidden]);

        const candidates = (data ?? [])
          .filter((row) => !hiddenSet.has(row.user_pets.id))
          .map(mapCandidateRow);

        setMatchCandidates(candidates);
      } catch (err) {
        console.error('[fetchCandidates] Adaylar gelirken hata:', err);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, getStoreHiddenPetIds, mergeHiddenFromCache]
  );

  const fetchMyPetsAndCandidates = useCallback(async () => {
    if (!user?.id) {
      setLoading(true);
      return;
    }

    setLoading(true);

    try {
      const { data: petsData, error: petsError } = await supabase
        .from('user_pets')
        .select('*')
        .eq('userId', user.id);

      if (petsError) throw petsError;
      setMyPets(petsData || []);

      if (petsData && petsData.length > 0) {
        const activePet = selectedMyPetRef.current || petsData[0];
        setSelectedMyPet(activePet);
        await fetchCandidates(activePet);
      } else {
        setMatchCandidates([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('[fetchMyPetsAndCandidates] Veriler yüklenirken hata:', err);
      Alert.alert('Hata', 'Bilgiler yüklenirken bir sorun oluştu.');
      setLoading(false);
    }
  }, [user?.id, fetchCandidates]);

  const { refreshing, onRefresh } = useRefresh(fetchMyPetsAndCandidates);

  useFocusEffect(
    useCallback(() => {
      fetchMyPetsAndCandidates();

      return () => {
        const topCard = matchCandidatesRef.current[0];
        const activePet = selectedMyPetRef.current;

        if (!topCard || !activePet || !user?.id) return;

        hidePet(activePet.id, topCard.id);

        recordPetImpression(supabase, {
          swiperUserId: user.id,
          swiperPetId: activePet.id,
          targetPetId: topCard.id,
          targetUserId: topCard.userId,
        }).catch((error) => {
          console.error('[match blur] Görüntülenme kaydedilirken hata:', error);
        });
      };
    }, [user?.id, fetchMyPetsAndCandidates, hidePet])
  );

  const handleMyPetChange = async (pet) => {
    setSelectedMyPet(pet);
    selectedMyPetRef.current = pet;
    setLoading(true);
    await fetchCandidates(pet);
  };

  const handleSwipe = async (cardIndex, direction) => {
    if (!user?.id || !selectedMyPet) return;

    const candidate = matchCandidatesRef.current[cardIndex];
    if (!candidate) return;

    hidePet(selectedMyPet.id, candidate.id);

    try {
      await recordPetSwipe(supabase, {
        swiperUserId: user.id,
        swiperPetId: selectedMyPet.id,
        targetPetId: candidate.id,
        targetUserId: candidate.userId,
        direction,
      });

      if (direction === 'like') {
        const isMutual = await checkIsMutualMatch(
          supabase,
          selectedMyPet.id,
          candidate.id
        );

        if (isMutual) {
          showCelebration({
            myPet: selectedMyPet,
            matchedPet: {
              id: candidate.id,
              name: candidate.name,
              image_url: candidate.image_url,
            },
            matchedUserId: candidate.userId,
          });
        }
      }
    } catch (err) {
      console.error('[handleSwipe] Swipe kaydedilirken hata:', err);
      unhidePet(selectedMyPet.id, candidate.id);
      Alert.alert('Hata', 'İşlem kaydedilemedi. Lütfen tekrar deneyin.');
      await fetchCandidates(selectedMyPet);
    }
  };

  const handleSwipedRight = (cardIndex) => handleSwipe(cardIndex, 'like');

  const handleSwipedLeft = (cardIndex) => handleSwipe(cardIndex, 'pass');

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </ThemedView>
    );
  }

  if (myPets.length === 0) {
    return (
      <ThemedView style={styles.centerContainer} safe={true}>
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
          <Ionicons name='paw-outline' size={80} color='#9CA3AF' />
          <ThemedText style={styles.noPetTitle}>
            Kayıtlı Dostunuz Yok
          </ThemedText>
          <ThemedText style={styles.noPetSubtitle}>
            Eşleşme modunu kullanabilmek için önce kendi evcil hayvanınızı
            profilinizdeki 'Patili Dostlarım' alanından kaydedebilirsiniz.
          </ThemedText>
          <ThemedButton
            style={styles.redirectButton}
            onPress={() => router.push('/profile')}
          >
            <ThemedText style={styles.redirectButtonText}>
              Profilime Git
            </ThemedText>
          </ThemedButton>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.petSelectorWrapper}>
        <ThemedText style={styles.selectorLabel}>
          Kimin İçin Eş Arıyorsunuz?
        </ThemedText>
        <View style={styles.petChipsRow}>
          {myPets.map((pet) => (
            <Pressable
              key={pet.id}
              style={[
                styles.petChip,
                selectedMyPet?.id === pet.id && {
                  backgroundColor: colors.primary || '#2563EB',
                },
              ]}
              onPress={() => handleMyPetChange(pet)}
            >
              <ThemedText
                style={[
                  styles.petChipText,
                  selectedMyPet?.id === pet.id && {
                    color: '#FFF',
                    fontWeight: '700',
                  },
                ]}
              >
                🐾 {pet.name} ({pet.gender === 'Erkek' ? '♂️' : '♀️'})
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.swiperContainer}>
        {matchCandidates.length > 0 ? (
          <Swiper
            ref={swiperRef}
            cards={matchCandidates}
            cardIndex={0}
            renderCard={(card) => {
              if (!card) return null;
              return (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.uiBackground,
                      borderColor: colors.borderColor,
                    },
                  ]}
                >
                  <Image
                    source={{
                      uri: card.image_url || 'https://via.placeholder.com/400',
                    }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardDetails}>
                    <View style={styles.nameRow}>
                      <ThemedText style={styles.cardName}>
                        {card.name}
                      </ThemedText>
                      <Text style={styles.cardGender}>
                        {card.gender === 'Erkek' ? '♂️' : '♀️'}
                      </Text>
                    </View>
                    <ThemedText style={styles.cardMeta}>
                      {[card.species, card.age, card.location]
                        .filter(Boolean)
                        .join(' • ')}
                    </ThemedText>
                    {card.description ? (
                      <View style={styles.descriptionRow}>
                        <ThemedText style={styles.cardLocation}>
                          {card.description}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            }}
            onSwipedLeft={handleSwipedLeft}
            onSwipedRight={handleSwipedRight}
            onSwipedAll={() => setMatchCandidates([])}
            stackSize={3}
            stackScale={8}
            stackSeparation={14}
            disableTopSwipe
            disableBottomSwipe
            animateCardOpacity
            backgroundColor={'transparent'}
            overlayLabels={{
              left: {
                title: 'PAS',
                style: {
                  label: styles.overlayLabelLeft,
                  wrapper: styles.overlayWrapperLeft,
                },
              },
              right: {
                title: 'BEĞEN',
                style: {
                  label: styles.overlayLabelRight,
                  wrapper: styles.overlayWrapperRight,
                },
              },
            }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name='sparkles-outline' size={64} color='#9CA3AF' />
            <ThemedText style={styles.emptyTitle}>Adaylar Tükendi!</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              {selectedMyPet?.name} için şu an çevrede başka uygun karşı cins{' '}
              {selectedMyPet?.category} eşleştirmeye katılan dost bulunmuyor.
              Yeni katılımlar için daha sonra tekrar kontrol edebilirsin!
            </ThemedText>
            <ThemedButton
              style={styles.refreshButton}
              onPress={fetchMyPetsAndCandidates}
            >
              <ThemedText style={styles.refreshButtonText}>
                Yeniden Tara
              </ThemedText>
            </ThemedButton>
          </View>
        )}
      </View>

      {matchCandidates.length > 0 && (
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, styles.closeButton]}
            onPress={() => swiperRef.current?.swipeLeft()}
          >
            <Ionicons name='close' size={28} color='#EF4444' />
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.heartButton]}
            onPress={() => swiperRef.current?.swipeRight()}
          >
            <Ionicons name='heart' size={28} color='#10B981' />
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
};

export default Match;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  petSelectorWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  selectorLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  petChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  petChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  petChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  swiperContainer: {
    flex: 1,
    marginTop: -10,
  },
  card: {
    height: height * 0.53,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  cardDetails: {
    padding: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardGender: {
    fontSize: 18,
  },
  cardMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 25,
    paddingTop: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    borderColor: '#FEE2E2',
    borderWidth: 1,
  },
  heartButton: {
    borderColor: '#D1FAE5',
    borderWidth: 1,
  },
  noPetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  noPetSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  redirectButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    borderRadius: 12,
    paddingVertical: 14,
  },
  redirectButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  refreshButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: -20,
  },
  overlayLabelLeft: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    padding: 10,
    borderRadius: 5,
    transform: [{ rotate: '15deg' }],
  },
  overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 20,
  },
  overlayLabelRight: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    padding: 10,
    borderRadius: 5,
    transform: [{ rotate: '-15deg' }],
  },
});
