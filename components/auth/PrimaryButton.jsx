import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
  showArrow = true,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        { backgroundColor: colors.primary },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <ThemedText style={[styles.label, { color: colors.onPrimary }]}>
        {label}
      </ThemedText>
      {showArrow && (
        <View style={styles.arrow}>
          <Ionicons name='arrow-forward' size={20} color={colors.onPrimary} />
        </View>
      )}
    </Pressable>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
