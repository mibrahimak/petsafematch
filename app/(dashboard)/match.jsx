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
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useRouter } from 'expo-router';
import { supabase } from '../../libs/supabase';
import Swiper from 'react-native-deck-swiper';

// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import ThemedButton from '../../components/ThemedButton';

const { width, height } = Dimensions.get('window');

const Match = () => {
  const { refreshing, onRefresh } = useRefresh();
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();
  const swiperRef = useRef(null);

  const [myPets, setMyPets] = useState([]);
  const [selectedMyPet, setSelectedMyPet] = useState(null);
  const [matchCandidates, setMatchCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPetsAndCandidates = useCallback(async () => {
    if (!user?.id) return setLoading(true);

    try {
      const { data: petsData, error: petsError } = await supabase
        .from('user_pets')
        .select('*')
        .eq('userId', user.id);

      if (petsError) throw petsError;
      setMyPets(petsData || []);

      if (petsData && petsData.length > 0) {
        const activePet = selectedMyPet || petsData[0];
        setSelectedMyPet(activePet);

        await fetchCandidates(activePet);
      } else {
        setMatchCandidates([]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Veriler yüklenirken hata:', error);
      Alert.alert('Hata', 'Bilgiler yüklenirken bir sorun oluştu.');
      setLoading(false);
    }
  }, [user?.id, selectedMyPet]);

  const fetchCandidates = async (myPet) => {
    try {
      const targetGender = myPet.gender === 'Erkek' ? 'Dişi' : 'Erkek';

      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('category', myPet.category)
        .eq('gender', targetGender)
        .eq('is_active', true)
        .or(`userId.neq."${user.id}",userId.is.null`);

      if (listingsError) throw listingsError;
      setMatchCandidates(listingsData || []);
    } catch (err) {
      console.error('Adaylar gelirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPetsAndCandidates();
  }, []);

  const handleMyPetChange = async (pet) => {
    setSelectedMyPet(pet);
    setLoading(true);
    await fetchCandidates(pet);
  };

  const handleSwipedRight = async (cardIndex) => {
    const candidate = matchCandidates[cardIndex];
    console.log(`💚 ${selectedMyPet.name}, ${candidate.name} ilanını beğendi!`);
  };

  const handleSwipedLeft = (cardIndex) => {
    console.log(`❌ Pas geçildi: ${matchCandidates[cardIndex].name}`);
  };

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
                      {card.species} • {card.age} • {card.location}
                    </ThemedText>
                    <View style={styles.descriptionRow}>
                      <ThemedText style={styles.cardLocation}>
                        {card.description}
                      </ThemedText>
                    </View>
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
              {selectedMyPet?.category} ilanı bulunmuyor. Yeni ilanlar için daha
              sonra tekrar kontrol edebilirsin!
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
