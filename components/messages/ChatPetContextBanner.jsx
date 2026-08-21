import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ChatPetContextBanner = ({
  petName,
  myPetName,
  matchedPetName,
  listingCity,
}) => {
  const { colors } = useTheme();

  const isMatchContext = myPetName && matchedPetName;

  if (!petName && !isMatchContext) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primarySurface,
          borderColor: colors.primary + '28',
        },
      ]}
    >
      <Ionicons name='paw' size={13} color={colors.primary} />
      <ThemedText style={[styles.text, { color: colors.text }]}>
        {isMatchContext ? (
          <>
            <ThemedText style={[styles.petName, { color: colors.title }]}>
              {myPetName}
            </ThemedText>
            {' ve '}
            <ThemedText style={[styles.petName, { color: colors.title }]}>
              {matchedPetName}
            </ThemedText>
            {' birbirinizi beğendi! Sohbete başlayın.'}
          </>
        ) : (
          <>
            <ThemedText style={[styles.petName, { color: colors.title }]}>
              {petName}
            </ThemedText>{' '}
            ilanı hakkında konuşuyorsunuz
          </>
        )}
      </ThemedText>
      {listingCity ? (
        <View style={styles.locationRow}>
          <Ionicons name='location-outline' size={11} color={colors.label} />
          <ThemedText style={[styles.cityText, { color: colors.label }]}>
            {listingCity}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
};

export default memo(ChatPetContextBanner);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  petName: {
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  cityText: {
    fontSize: 10,
  },
});
