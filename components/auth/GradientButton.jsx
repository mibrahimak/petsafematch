import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const GradientButton = ({
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
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <ThemedText style={[styles.label, { color: colors.onPrimary }]}>
          {label}
        </ThemedText>
        {showArrow ? (
          <View style={styles.arrow}>
            <Ionicons name='arrow-forward' size={20} color={colors.onPrimary} />
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
};

export default GradientButton;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    marginVertical: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
