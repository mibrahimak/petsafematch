import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const MessagesEmptyState = ({ isSearchResult = false, searchQuery = '' }) => {
  const { colors } = useTheme();

  if (isSearchResult) {
    return (
      <View style={styles.container}>
        <Ionicons name='search' size={28} color={colors.label} />
        <ThemedText style={[styles.title, { color: colors.title }]}>
          Sonuç bulunamadı
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.label }]}>
          "{searchQuery}" için eşleşme yok
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons
        name='chatbubble-ellipses-outline'
        size={64}
        color={colors.label}
      />
      <ThemedText style={[styles.title, { color: colors.title }]}>
        Henüz bir mesajınız yok
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: colors.label }]}>
        İlanlardan mesaj göndererek konuşmaya başlayın
      </ThemedText>
    </View>
  );
};

export default memo(MessagesEmptyState);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
