import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const ProfileSection = ({ title, children }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText style={[styles.title, { color: colors.label }]}>
        {title}
      </ThemedText>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export default ProfileSection;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
