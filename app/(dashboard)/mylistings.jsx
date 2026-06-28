import { StyleSheet } from 'react-native';

// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';

const MyListings = () => {
  return (
    <ThemedView style={styles.innerContainer}>
      <ThemedText style={styles.title} title={true}>
        İlanlarım burada!
      </ThemedText>
    </ThemedView>
  );
};

export default MyListings;

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
