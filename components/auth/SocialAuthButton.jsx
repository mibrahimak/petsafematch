import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const PROVIDER_CONFIG = {
  google: { label: 'Google', icon: 'logo-google', iconColor: null },
  apple: { label: 'Apple', icon: 'logo-apple', iconColor: null },
};

const SocialAuthButton = ({ provider, onPress, disabled = false }) => {
  const { colors } = useTheme();
  const config = PROVIDER_CONFIG[provider];

  if (!config) {
    return null;
  }

  const iconColor = config.iconColor ?? colors.title;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.socialButtonBg,
          borderColor: colors.borderColor,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Ionicons name={config.icon} size={20} color={iconColor} />
      <ThemedText style={[styles.label, { color: colors.title }]}>
        {config.label}
      </ThemedText>
    </Pressable>
  );
};

export default SocialAuthButton;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
