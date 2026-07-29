import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const MessageDateSeparator = ({ label }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <ThemedText style={[styles.label, { color: colors.label }]}>
          {label}
        </ThemedText>
      </View>
    </View>
  );
};

export default memo(MessageDateSeparator);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
  },
});
