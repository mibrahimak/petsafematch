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
import React, { useCallback, useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import AppLogo from '../../components/AppLogo';
import AuthTextField from '../../components/auth/AuthTextField';
import AuthPhoneField from '../../components/auth/AuthPhoneField';
import GradientButton from '../../components/auth/GradientButton';
import { useTheme } from '../../hooks/useTheme';
import AuthDivider from '../../components/auth/AuthDivider';

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$/;

const registerSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(2, 'Ad soyad en az 2 karakter olmalı')
    .required('Ad soyad gerekli'),
  email: yup
    .string()
    .trim()
    .email('Geçerli bir e-posta adresi girin')
    .required('E-posta adresi gerekli'),
  phone: yup
    .string()
    .matches(/^5\d{9}$/, 'Geçerli bir telefon numarası girin (5XX XXX XX XX)')
    .required('Telefon numarası gerekli'),
  password: yup
    .string()
    .required('Şifre gerekli')
    .matches(
      PASSWORD_REGEX,
      'Şifre en az 8 karakter olmalı; büyük harf, küçük harf, rakam ve özel karakter içermelidir'
    ),
  confirmPassword: yup
    .string()
    .required('Şifre tekrarı gerekli')
    .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Devam etmek için şartları kabul etmelisiniz'),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  const { register } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setFormError(null);

      try {
        await register(
          values.email.trim(),
          values.password,
          values.fullName.trim(),
          values.phone
        );

        Alert.alert('Hesabınız oluşturuldu!', 'Giriş yapabilirsiniz.', [
          {
            text: 'Tamam',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]);
      } catch (error) {
        console.error('[Register] Kayıt hatası:', error);
        const message =
          error?.message === 'User already registered'
            ? 'Bu e-posta adresi zaten kayıtlı.'
            : 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.';
        setFormError(message);
        Alert.alert('Kayıt başarısız', message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const handleToggleTerms = useCallback(() => {
    const nextValue = !formik.values.acceptTerms;
    formik.setFieldValue('acceptTerms', nextValue);
    formik.setFieldTouched('acceptTerms', true);
  }, [formik.setFieldValue, formik.setFieldTouched, formik.values.acceptTerms]);

  const handleLinkToLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const termsError =
    formik.touched.acceptTerms && formik.errors.acceptTerms
      ? formik.errors.acceptTerms
      : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flexContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ThemedView style={styles.container} safe={true}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
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

            <ThemedText title style={styles.brandName}>
              PetSafe&Match
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Kaldığın yerden devam etmek için giriş yap.
            </ThemedText>

            <AuthTextField
              label='Ad Soyad'
              leftIcon='person-outline'
              placeholder='Adınız Soyadınız'
              autoCapitalize='words'
              value={formik.values.fullName}
              onChangeText={formik.handleChange('fullName')}
              onBlur={formik.handleBlur('fullName')}
              error={
                formik.touched.fullName && formik.errors.fullName
                  ? formik.errors.fullName
                  : undefined
              }
            />

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

            <AuthPhoneField
              value={formik.values.phone}
              onChangeText={formik.handleChange('phone')}
              onBlur={formik.handleBlur('phone')}
              error={
                formik.touched.phone && formik.errors.phone
                  ? formik.errors.phone
                  : undefined
              }
            />

            <AuthTextField
              label='Şifre'
              leftIcon='lock-closed-outline'
              rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={handleTogglePassword}
              placeholder='En az 8 karakter'
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

            <AuthTextField
              label='Şifre Tekrar'
              leftIcon='lock-closed-outline'
              rightIcon={
                showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
              }
              onRightIconPress={handleToggleConfirmPassword}
              placeholder='Şifrenizi tekrar girin'
              secureTextEntry={!showConfirmPassword}
              value={formik.values.confirmPassword}
              onChangeText={formik.handleChange('confirmPassword')}
              onBlur={formik.handleBlur('confirmPassword')}
              error={
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? formik.errors.confirmPassword
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

            <Pressable style={styles.termsRow} onPress={handleToggleTerms}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: formik.values.acceptTerms
                      ? colors.primary
                      : colors.borderColor,
                    backgroundColor: formik.values.acceptTerms
                      ? colors.primary
                      : 'transparent',
                  },
                ]}
              >
                {formik.values.acceptTerms ? (
                  <Ionicons
                    name='checkmark'
                    size={14}
                    color={colors.onPrimary}
                  />
                ) : null}
              </View>
              <ThemedText style={styles.termsText}>
                Hizmet{' '}
                <ThemedText style={{ color: colors.link }}>Şartları</ThemedText>{' '}
                ve{' '}
                <ThemedText style={{ color: colors.link }}>
                  Gizlilik Politikası
                </ThemedText>
                'nı kabul ediyorum
              </ThemedText>
            </Pressable>

            {termsError ? (
              <ThemedText
                style={[styles.termsError, { color: colors.errorText }]}
              >
                {termsError}
              </ThemedText>
            ) : null}

            <GradientButton
              label='Hesap Oluştur'
              onPress={formik.handleSubmit}
              disabled={formik.isSubmitting}
            />

            <AuthDivider />

            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Zaten hesabın var mı?{' '}
              </ThemedText>
              <Pressable onPress={handleLinkToLogin}>
                <ThemedText style={[styles.footerLink, { color: colors.link }]}>
                  Giriş yap
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  termsError: {
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
