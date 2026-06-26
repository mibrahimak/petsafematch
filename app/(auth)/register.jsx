import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';

import { AuthContext } from '../../contexts/AuthContext';

// Themed Components
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedButton from '../../components/ThemedButton';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useContext(AuthContext);

  const router = useRouter();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!email || !password || !fullName) {
      Alert.alert('Hata! Lütfen tüm alanları doldurun.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Hata! Şifre en az 8 karakter olmalıdır.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await register(email, password, fullName);

      Alert.alert('Hesabınız başarıyla oluşturuldu!', '', [
        {
          text: 'Tamam',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (err) {
      setError(err.message);
      Alert.alert('Kayıt hatası:', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkToLoginScreen = () => {
    router.push('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.title} title={true}>
            Kaydol
          </ThemedText>

          <ThemedTextInput
            style={styles.inputStyle}
            placeholder="Fullname"
            onChangeText={setFullName}
            value={fullName}
          />

          <ThemedTextInput
            style={styles.inputStyle}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
          />

          <ThemedTextInput
            style={styles.inputStyle}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.registerButtonWrapper}>
            <ThemedButton onPress={handleSubmit} disabled={isSubmitting}>
              <Text style={styles.buttonText}>Kaydol</Text>
            </ThemedButton>
            <ThemedButton onPress={linkToLoginScreen}>
              <Text style={styles.buttonText}>Zaten hesabın mı var?</Text>
            </ThemedButton>
          </View>

          <ThemedText
            style={{
              marginTop: 30,
              fontSize: 18,
              fontWeight: 'bold',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            PetSafe&Match
          </ThemedText>
        </ThemedView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Register;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center', // Üst alan ile alt alanı ekranın iki ucuna yaslar
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  registerButtonWrapper: {
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
});
