import { StyleSheet } from 'react-native';

// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';

const Match = () => {
  return (
    <ThemedView style={styles.innerContainer}>
      <ThemedText style={styles.title} title={true}>
        Eşleştirme sayfası burada
      </ThemedText>
    </ThemedView>
  );
};

export default Match;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 30,
  },
});
