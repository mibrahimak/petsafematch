import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

const ThemedButton = ({ style, disabled = false, ...props }) => {
  const { colors } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: colors.primary },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    />
  );
};

export default ThemedButton;

const styles = StyleSheet.create({
  btn: {
    padding: 10,
    borderRadius: 25,
    marginVertical: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
