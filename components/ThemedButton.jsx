import { Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

const ThemedButton = ({ style, disabled = false, ...props }) => {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
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
    backgroundColor: Colors.primary,
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
