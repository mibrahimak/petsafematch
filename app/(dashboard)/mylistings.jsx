import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  View,
  Alert,
  Pressable,
  Image,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../libs/supabase';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePetStore } from '../../src/store/usePetStore';
import { useRefresh } from '../../hooks/useRefresh';

import CreateListingModal from '../../components/CreateListingModal';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';

export default function MyListings() {
  const { user } = useContext(AuthContext);

  const { colors } = useTheme();
  const { refreshing, onRefresh } = useRefresh();

  const router = useRouter();

  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const removePetFromStore = usePetStore((state) => state.removePetFromStore);
  const fetchPets = usePetStore((state) => state.fetchPets);

  const fetchMyListings = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('userId', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyListings(data || []);
    } catch (error) {
      Alert.alert('Hata', 'İlanlarınız yüklenirken bir sorun oluştu.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleDeleteListing = (id) => {
    Alert.alert(
      'İlanı Sil',
      'Bu ilanı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', id);

              if (error) throw error;

              setMyListings((prev) => prev.filter((item) => item.id !== id));
              removePetFromStore(id);
              Alert.alert('Başarılı', 'İlan başarıyla kaldırıldı.');
            } catch (error) {
              Alert.alert('Hata', 'İlan silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size='large' color={'#2563EB'} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={myListings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name='folder-open-outline' size={64} color='#9CA3AF' />
            <ThemedText style={styles.emptyText}>
              Henüz bir ilan yayınlamadınız.
            </ThemedText>
            <ThemedButton
              style={styles.emptyButton}
              onPress={() => router.push('/(dashboard)')}
            >
              <ThemedText style={styles.emptyButtonText}>
                Hemen İlan Oluştur
              </ThemedText>
            </ThemedButton>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.borderColor,
              },
            ]}
            onPress={() =>
              router.push({ pathname: '/ilan/[id]', params: { id: item.id } })
            }
          >
            <Image
              source={{
                uri: item.image_url || 'https://via.placeholder.com/150',
              }}
              style={styles.image}
            />

            <View style={styles.infoContainer}>
              <ThemedText style={styles.title} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={styles.subtitle} numberOfLines={1}>
                {item.species} • {item.age}
              </ThemedText>
              <View style={styles.locationContainer}>
                <Ionicons name='location-outline' size={14} color='#9CA3AF' />
                <ThemedText style={styles.locationText}>
                  {item.location}
                </ThemedText>
              </View>
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeleteListing(item.id)}
            >
              <Ionicons name='trash-outline' size={22} color='#EF4444' />
            </Pressable>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
