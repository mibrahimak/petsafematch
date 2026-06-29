import { Stack, useLocalSearchParams } from 'expo-router';
import { useFavoriteStore } from '../../src/store/useFavoriteStore';
import { usePetStore } from '../../src/store/usePetStore';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, View, ScrollView, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const pets = usePetStore((state) => state.pets);

  const { colors } = useTheme();

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

        <ThemedButton style={styles.contactButton} onPress={contactOwner}>
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
