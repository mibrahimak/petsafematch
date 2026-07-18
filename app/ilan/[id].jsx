import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext } from 'react';
import { useFavoriteStore } from '../../src/store/useFavoriteStore';
import { usePetStore } from '../../src/store/usePetStore';
import { Alert, Pressable, StyleSheet, View, ScrollView, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { AuthContext } from '../../contexts/AuthContext';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const pets = usePetStore((state) => state.pets);

  const { colors } = useTheme();

  const pet = pets.find((item) => String(item.id) === String(id));
  const isFavorite = favorites.includes(pet?.id);

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
    router.push(`/messages/${pet.userId}`);
  }, [user?.id, pet?.userId, router]);

  if (!pet) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'İlan Detayı' }} />
        <ThemedText style={styles.title}>İlan bulunamadı...</ThemedText>
        <ThemedText style={styles.subtitle}>
          Bu ID ile eşleşen bir ilan yok!
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: pet.name,
          headerShown: true,
          headerBackTitle: ' ',
          headerBackButtonDisplayMode: 'minimal',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: pet.image_url }} style={styles.image} />

        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>{pet.name}</ThemedText>

          <Pressable style={styles.favoriteButton} onPress={handleFavoritePress}>
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={18}
              color='#EF4444'
            />
          </Pressable>
        </View>

        <ThemedText style={[styles.tag, { color: colors.text + '99' }]}>
          {pet.species} • {pet.gender} • {pet.age}
        </ThemedText>

        <ThemedText style={[styles.location, { color: colors.te + 'B3' }]}>
          {pet.location}
        </ThemedText>

        <ThemedText style={styles.about}>Hakkında</ThemedText>

        <ThemedText style={[styles.description, { color: colors.text }]}>
          {pet.description}
        </ThemedText>

        <ThemedButton style={styles.contactButton} onPress={handleContactOwner}>
          <ThemedText style={styles.contactButtonText}>
            Sahibiyle İletişime Geç
          </ThemedText>
        </ThemedButton>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: '100%',
    height: 260,
    borderRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  titleRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    marginTop: 8,
    fontSize: 14,
  },
  location: {
    marginTop: 6,
    fontSize: 15,
  },
  about: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
  },
  contactButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
