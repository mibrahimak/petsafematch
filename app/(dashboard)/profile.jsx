import { Platform, View, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';

const Profile = () => {
  const { logout, isLoggedIn } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, router]);

  return (
    <ThemedView style={styles.innerContainer}>
      <View style={styles.logoutButtonWrapper}>
        <ThemedText style={styles.title} title={true}>
          Profil sayfası burada!
        </ThemedText>
        <ThemedButton style={styles.buttonContainer} onPress={logout}>
          <ThemedText style={styles.buttonText}>Çıkış Yap</ThemedText>
        </ThemedButton>
      </View>
    </ThemedView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 40 : 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 30,
  },
  buttonContainer: {
    width: '80%',
  },
  buttonText: {
    color: '#f2f2f2',
    textAlign: 'center',
  },
  logoutButtonWrapper: {
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
});
