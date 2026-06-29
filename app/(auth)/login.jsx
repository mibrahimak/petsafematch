import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext';
import ThemedView from '../../components/ThemedView';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';
import ThemedText from '../../components/ThemedText';
import AppLogo from '../../components/AppLogo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isLoggedIn, isLoading } = useContext(AuthContext);

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/(dashboard)');
    }
  }, [isLoading, isLoggedIn, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!email || !password) {
      Alert.alert('Hata! Lütfen tüm alanları doldurun.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      console.log('Giriş hatası:', err);
      setError(err.message);
      Alert.alert('Giriş başarısız...', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkToRegisterScreen = () => {
    router.push('/(auth)/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <AppLogo size={120} />
          <ThemedText style={styles.petsafematchText}>PetSafe&Match</ThemedText>

          <ThemedTextInput
            style={styles.inputStyle}
            placeholder='Email'
            keyboardType='email-address'
            onChangeText={setEmail}
            value={email}
          />

          <ThemedTextInput
            style={styles.inputStyle}
            placeholder='Password'
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View
            style={{
              width: '80%',
              alignItems: 'flex-end',
              marginBottom: 12,
            }}
          >
            <ThemedText style={{ fontWeight: 'bold' }}>
              Şifremi Unuttum...
            </ThemedText>
          </View>

          <View style={styles.loginButtonWrapper}>
            <ThemedButton onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </ThemedButton>
            <ThemedButton onPress={linkToRegisterScreen}>
              <Text style={styles.buttonText}>Yeni hesap oluştur</Text>
            </ThemedButton>
          </View>
        </ThemedView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 30,
  },
  inputStyle: {
    width: '80%',
    marginBottom: 20,
  },
  loginButtonWrapper: {
    flexDirection: 'column',
    gap: 10,
    justifyContent: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#f2f2f2',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  error: {
    color: '#e05260',
    backgroundColor: '#f5c1c8',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    width: '80%',
    textAlign: 'center',
    borderColor: '#e05260',
  },
  petsafematchText: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'center',
  },
});
