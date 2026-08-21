import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ChatPetContextBanner = ({
  petName,
  myPetName,
  matchedPetName,
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
          borderColor: colors.primary + '2E',
        },
      ]}
    >
      <Ionicons name='paw' size={14} color={colors.primary} />
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
    </View>
  );
};

export default memo(ChatPetContextBanner);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
});
