import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import AppLogo from '../../components/AppLogo';
import AuthTextField from '../../components/auth/AuthTextField';
import GradientButton from '../../components/auth/GradientButton';
import SocialAuthButton from '../../components/auth/SocialAuthButton';
import AuthDivider from '../../components/auth/AuthDivider';
import { useTheme } from '../../hooks/useTheme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const REMEMBER_EMAIL_KEY = '@auth/remember_email';

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('Geçerli bir e-posta adresi girin')
    .required('E-posta adresi gerekli'),
  password: yup
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .required('Şifre gerekli'),
});

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const { login, signInWithProvider, resetPassword, isLoggedIn, isLoading } =
    useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setFormError(null);
      try {
        await login(values.email.trim(), values.password);
        if (rememberMe) {
          await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, values.email.trim());
        } else {
          await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch (error) {
        console.error('[Login] Giriş hatası:', error);
        const message =
          error?.message === 'Invalid login credentials'
            ? 'E-posta veya şifre hatalı.'
            : 'Giriş yapılamadı. Lütfen tekrar deneyin.';
        setFormError(message);
        Alert.alert('Giriş başarısız', message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/(dashboard)');
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
          formik.setFieldValue('email', savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('[Login] Kayıtlı e-posta yüklenemedi:', error);
      }
    };
    loadRememberedEmail();
  }, []);

  const handleToggleRememberMe = useCallback(() => {
    setRememberMe((prev) => !prev);
  }, []);

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleForgotPassword = useCallback(async () => {
    const email = formik.values.email.trim();
    if (!email) {
      Alert.alert('Hata', 'Lütfen önce e-posta adresinizi girin.');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        'E-posta gönderildi',
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
      );
    } catch (error) {
      console.error('[Login] Şifre sıfırlama hatası:', error);
      Alert.alert(
        'Hata',
        'Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.'
      );
    }
  }, [formik.values.email, resetPassword]);

  const handleSocialSignIn = useCallback(
    async (provider) => {
      if (isOAuthLoading || formik.isSubmitting) return;

      setIsOAuthLoading(true);
      setFormError(null);

      try {
        const session = await signInWithProvider(provider);
        if (!session) {
          return;
        }
      } catch (error) {
        console.error(`[Login] ${provider} OAuth hatası:`, error);
        Alert.alert(
          'Giriş başarısız',
          'Sosyal medya ile giriş yapılamadı. Lütfen tekrar deneyin.'
        );
      } finally {
        setIsOAuthLoading(false);
      }
    },
    [formik.isSubmitting, isOAuthLoading, signInWithProvider]
  );

  const handleLinkToRegister = useCallback(() => {
    router.push('/(auth)/register');
  }, [router]);

  const isBusy = formik.isSubmitting || isOAuthLoading;

  return (
    <ThemedView style={styles.container} safe={true}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: colors.uiBackground,
              shadowColor: colors.logoGlow,
            },
          ]}
        >
          <AppLogo size={56} />
        </View>

        <ThemedText title style={styles.headline}>
          Tekrar hoş geldin
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Kaldığın yerden devam etmek için giriş yap.
        </ThemedText>

        <AuthTextField
          label='E-posta'
          leftIcon='mail-outline'
          placeholder='ornek@email.com'
          keyboardType='email-address'
          autoCapitalize='none'
          autoCorrect={false}
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          error={
            formik.touched.email && formik.errors.email
              ? formik.errors.email
              : undefined
          }
        />

        <AuthTextField
          label='Şifre'
          leftIcon='lock-closed-outline'
          rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={handleTogglePassword}
          placeholder='Şifreniz'
          secureTextEntry={!showPassword}
          value={formik.values.password}
          onChangeText={formik.handleChange('password')}
          onBlur={formik.handleBlur('password')}
          error={
            formik.touched.password && formik.errors.password
              ? formik.errors.password
              : undefined
          }
        />

        {formError ? (
          <View
            style={[
              styles.formError,
              {
                backgroundColor: colors.errorBg,
                borderColor: colors.errorText,
              },
            ]}
          >
            <ThemedText style={{ color: colors.errorText }}>
              {formError}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.optionsRow}>
          <Pressable
            style={styles.rememberRow}
            onPress={handleToggleRememberMe}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: rememberMe ? colors.primary : colors.borderColor,
                  backgroundColor: rememberMe ? colors.primary : 'transparent',
                },
              ]}
            >
              {rememberMe ? (
                <Ionicons name='checkmark' size={14} color={colors.onPrimary} />
              ) : null}
            </View>
            <ThemedText style={styles.rememberText}>Beni hatırla</ThemedText>
          </Pressable>

          <Pressable onPress={handleForgotPassword}>
            <ThemedText style={[styles.forgotText, { color: colors.link }]}>
              Şifremi unuttum?
            </ThemedText>
          </Pressable>
        </View>

        <GradientButton
          label='Giriş Yap'
          onPress={formik.handleSubmit}
          disabled={isBusy}
        />

        <AuthDivider />

        <View style={styles.socialRow}>
          <SocialAuthButton
            provider='google'
            onPress={() => handleSocialSignIn('google')}
            disabled={isBusy}
          />
          <SocialAuthButton
            provider='apple'
            onPress={() => handleSocialSignIn('apple')}
            disabled={isBusy}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Hesabın yok mu? </ThemedText>
          <Pressable onPress={handleLinkToRegister} hitSlop={20}>
            <ThemedText style={[styles.footerLink, { color: colors.link }]}>
              Hesap oluştur
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoContainer: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  formError: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    height: 80,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
