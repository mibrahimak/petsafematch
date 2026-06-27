import { Stack, useLocalSearchParams } from 'expo-router';
import { useFavoriteStore } from '../../src/store/useFavoriteStore';
import { usePetStore } from '../../src/store/usePetStore';
import * as Linking from 'expo-linking';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const pets = usePetStore((state) => state.pets);

  const pet = pets.find((item) => String(item.id) === String(id));
  const isFavorite = favorites.includes(pet?.id);

  const contactOwner = async () => {
    const phoneUrl = 'tel: +905551112233';
    const whatsappUrl =
      'https://wa.me/905551112233?text=Merhaba%20ilaninizla%20ilgileniyorum.';
    const canOpenWhatsapp = await Linking.canOpenURL(whatsappUrl);
    await Linking.openURL(canOpenWhatsapp ? whatsappUrl : phoneUrl);
  };

  if (!pet) {
    return (
      <>
        <Stack.Screen options={{ title: 'İlan Detayı' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.title}>İlan bulunamadı...</Text>
          <Text style={styles.subtitle}>Bu ID ile eşleşen bir ilan yok!</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: pet.name,
          headerShown: true,
          headerBackTitle: ' ',
          headerBackButtonDisplayMode: 'minimal',
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Image source={{ uri: pet.image_url }} style={styles.image} />
        <View style={styles.titleRow}>
          <Text style={styles.title}>{pet.name}</Text>

          <Pressable
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(pet.id)}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={18}
              color='#EF4444'
            />
          </Pressable>
        </View>
        <Text style={styles.tag}>
          {pet.species} • {pet.gender} • {pet.age}
        </Text>
        <Text style={styles.location}>{pet.location}</Text>
        <Text style={styles.about}>Hakkında</Text>
        <Text style={styles.description}>{pet.description}</Text>

        <Pressable style={styles.contactButton} onPress={contactOwner}>
          <Text style={styles.contactButtonText}>Sahibiyle İletişime Geç</Text>
        </Pressable>
      </ScrollView>
    </>
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
    color: '#111827',
  },
  titleRow: {
    marignTop: 18,
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
    color: '#4B5563',
  },
  location: {
    marginTop: 6,
    fontSize: 15,
    color: '#6B7280',
  },
  about: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#6B7280',
  },
  contactButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
