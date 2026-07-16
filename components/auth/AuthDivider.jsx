import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const AuthDivider = ({ text = 'veya şununla devam et' }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.borderColor }]} />
      <ThemedText style={[styles.text, { color: colors.text }]}>{text}</ThemedText>
      <View style={[styles.line, { backgroundColor: colors.borderColor }]} />
    </View>
  );
};

export default AuthDivider;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    fontSize: 13,
    marginHorizontal: 12,
  },
});
