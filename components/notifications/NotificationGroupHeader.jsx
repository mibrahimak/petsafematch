import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const NotificationGroupHeader = ({ label, count }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: colors.label }]}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <ThemedText style={[styles.badgeText, { color: colors.label }]}>
          {count}
        </ThemedText>
      </View>
    </View>
  );
};

export default memo(NotificationGroupHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
