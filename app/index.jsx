import { ActivityIndicator, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';

// Themed Components
import ThemedView from '../components/ThemedView';

const Home = () => {
  const { isLoading, isLoggedIn } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        {
          /* Giriş yapılmışsa direkt sekmelerin olduğu dashboard'a fırlat */
        }
        router.replace('/(dashboard)');
      } else {
        {
          /* Giriş yapılmamışsa tam sayfa login'e fırlat */
        }
        router.replace('/login');
      }
    }
  }, [isLoading, isLoggedIn, router]);

  // Splash sonrası loading animasyonu
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size='large' />
    </ThemedView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
    marginTop: 0,
  },
});
