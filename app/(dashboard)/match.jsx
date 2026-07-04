import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRefresh } from '../../hooks/useRefresh';

// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';

const Match = () => {
  const { refreshing, onRefresh } = useRefresh();
  return (
    <ThemedView style={styles.innerContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
          />
        }
      >
        <ThemedText style={styles.title} title={true}>
          Eşleştirme sayfası burada
        </ThemedText>
      </ScrollView>
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
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 30,
  },
});
