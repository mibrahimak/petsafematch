import { memo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';

const MatchesSection = ({ matches, onPressMatch }) => {
  const { colors } = useTheme();

  if (!matches || matches.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ThemedText style={[styles.label, { color: colors.label }]}>
        EŞLEŞMELER
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {matches.map((match) => {
          const petName = match.matchedPetName || 'Dost';
          const imageUrl =
            match.matchedPetImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(petName)}&background=5046e5&color=fff&size=150`;

          return (
            <Pressable
              key={match.matchId}
              style={styles.matchItem}
              onPress={() => onPressMatch(match)}
            >
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: imageUrl }} style={styles.avatar} />
                <View
                  style={[
                    styles.matchBadge,
                    { backgroundColor: colors.primary, borderColor: colors.background },
                  ]}
                >
                  <ThemedText style={styles.matchBadgeText}>♥</ThemedText>
                </View>
              </View>
              <ThemedText
                style={[styles.petName, { color: colors.text }]}
                numberOfLines={1}
              >
                {petName}
              </ThemedText>
              <ThemedText
                style={[styles.ownerName, { color: colors.label }]}
                numberOfLines={1}
              >
                {match.profile?.full_name?.split(' ')[0] || 'Kullanıcı'}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default memo(MatchesSection);

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  matchItem: {
    alignItems: 'center',
    width: 72,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  matchBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  petName: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  ownerName: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});
