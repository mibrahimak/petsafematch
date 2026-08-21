import { memo } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import ThemedButton from '../ThemedButton';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200';

const MatchCelebrationModal = ({
  visible,
  myPet,
  matchedPet,
  matchedUserId,
  onClose,
}) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleMessagePress = () => {
    if (!matchedUserId) return;

    onClose();
    router.push({
      pathname: '/messages/[id]',
      params: {
        id: matchedUserId,
        myPetId: myPet?.id ?? '',
        matchedPetId: matchedPet?.id ?? '',
      },
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.uiBackground, borderColor: colors.borderColor },
          ]}
        >
          <View style={styles.heartsRow}>
            <Ionicons name='heart' size={28} color='#EF4444' />
            <Ionicons name='heart' size={36} color='#EF4444' />
            <Ionicons name='heart' size={28} color='#EF4444' />
          </View>

          <ThemedText style={styles.title}>Eşleşme!</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.label }]}>
            {myPet?.name || 'Dostunuz'} ve {matchedPet?.name || 'karşı dost'}{' '}
            birbirinizi beğendi!
          </ThemedText>

          <View style={styles.petsRow}>
            <View style={styles.petColumn}>
              <Image
                source={{ uri: myPet?.image_url || PLACEHOLDER_IMAGE }}
                style={styles.petImage}
              />
              <ThemedText style={styles.petName} numberOfLines={1}>
                {myPet?.name || 'Dostunuz'}
              </ThemedText>
            </View>

            <View style={[styles.heartBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name='heart' size={22} color='#FFF' />
            </View>

            <View style={styles.petColumn}>
              <Image
                source={{ uri: matchedPet?.image_url || PLACEHOLDER_IMAGE }}
                style={styles.petImage}
              />
              <ThemedText style={styles.petName} numberOfLines={1}>
                {matchedPet?.name || 'Eşleşme'}
              </ThemedText>
            </View>
          </View>

          <ThemedButton style={styles.primaryButton} onPress={handleMessagePress}>
            <ThemedText style={styles.primaryButtonText}>Mesaj Gönder</ThemedText>
          </ThemedButton>

          <Pressable onPress={onClose} style={styles.secondaryButton}>
            <ThemedText style={[styles.secondaryButtonText, { color: colors.label }]}>
              Devam Et
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default memo(MatchCelebrationModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  heartsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  petsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  petColumn: {
    alignItems: 'center',
    width: 100,
  },
  petImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  petName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  heartBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
