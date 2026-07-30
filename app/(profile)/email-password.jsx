import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import AuthTextField from '../../components/auth/AuthTextField';

const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$/;

const emailSchema = Yup.object().shape({
  newEmail: Yup.string()
    .trim()
    .email('Geçerli bir e-posta adresi girin')
    .required('Yeni e-posta adresi gerekli'),
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Mevcut şifre gerekli'),
  newPassword: Yup.string()
    .required('Yeni şifre gerekli')
    .matches(
      PASSWORD_REGEX,
      'Şifre en az 8 karakter olmalı; büyük harf, küçük harf, rakam ve özel karakter içermelidir'
    ),
  confirmPassword: Yup.string()
    .required('Şifre tekrarı gerekli')
    .oneOf([Yup.ref('newPassword')], 'Şifreler eşleşmiyor'),
});

const hasEmailPasswordIdentity = (user) =>
  user?.identities?.some((identity) => identity.provider === 'email') ?? false;

export default function EmailPassword() {
  const { user, changeEmail, changePassword } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentEmail = user?.email || '';
  const pendingEmail = user?.new_email || null;
  const canChangePassword = useMemo(
    () => hasEmailPasswordIdentity(user),
    [user]
  );

  const emailInitialValues = useMemo(
    () => ({
      newEmail: '',
    }),
    []
  );

  const passwordInitialValues = useMemo(
    () => ({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }),
    []
  );

  const handleEmailSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      const trimmedEmail = values.newEmail.trim();

      if (trimmedEmail.toLowerCase() === currentEmail.toLowerCase()) {
        Alert.alert('Hata', 'Yeni e-posta adresi mevcut adresinizle aynı olamaz.');
        setSubmitting(false);
        return;
      }

      try {
        await changeEmail({ newEmail: trimmedEmail });
        resetForm();
        Alert.alert(
          'Onay Gerekli',
          'Yeni e-posta adresinize bir onay bağlantısı gönderildi. E-postanızı onayladıktan sonra adresiniz güncellenecektir.'
        );
      } catch (error) {
        console.error('[email-password] E-posta değiştirilemedi:', error);
        const message =
          error?.message === 'Email address is invalid'
            ? 'Geçersiz e-posta adresi.'
            : error?.message === 'User already registered'
              ? 'Bu e-posta adresi zaten kullanılıyor.'
              : 'E-posta güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
        Alert.alert('Hata', message);
      } finally {
        setSubmitting(false);
      }
    },
    [changeEmail, currentEmail]
  );

  const handlePasswordSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        resetForm();
        Alert.alert('Başarılı', 'Şifreniz güncellendi.');
      } catch (error) {
        console.error('[email-password] Şifre değiştirilemedi:', error);
        const message =
          error?.code === 'invalid_current_password'
            ? 'Mevcut şifre hatalı.'
            : 'Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.';
        Alert.alert('Hata', message);
      } finally {
        setSubmitting(false);
      }
    },
    [changePassword]
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Ionicons name='arrow-back' size={24} color={colors.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle} title>
          E-posta & Şifre
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>E-posta</ThemedText>

            <AuthTextField
              label='Mevcut E-posta'
              leftIcon='mail-outline'
              value={currentEmail}
              editable={false}
            />

            {pendingEmail ? (
              <View
                style={[
                  styles.pendingBanner,
                  {
                    backgroundColor: colors.primarySurface,
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name='information-circle-outline'
                  size={18}
                  color={colors.primary}
                />
                <ThemedText
                  style={[styles.pendingText, { color: colors.primary }]}
                >
                  Onay bekleyen adres: {pendingEmail}
                </ThemedText>
              </View>
            ) : null}

            <Formik
              initialValues={emailInitialValues}
              validationSchema={emailSchema}
              onSubmit={handleEmailSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <>
                  <AuthTextField
                    label='Yeni E-posta'
                    leftIcon='mail-outline'
                    value={values.newEmail}
                    onChangeText={handleChange('newEmail')}
                    onBlur={handleBlur('newEmail')}
                    placeholder='yeni@eposta.com'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    error={touched.newEmail ? errors.newEmail : undefined}
                  />

                  <ThemedButton
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    style={styles.actionButton}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      {isSubmitting ? 'Gönderiliyor...' : 'Onay E-postası Gönder'}
                    </ThemedText>
                  </ThemedButton>
                </>
              )}
            </Formik>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Şifre</ThemedText>

            {canChangePassword ? (
              <Formik
                initialValues={passwordInitialValues}
                validationSchema={passwordSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                }) => (
                  <>
                    <AuthTextField
                      label='Mevcut Şifre'
                      leftIcon='lock-closed-outline'
                      value={values.currentPassword}
                      onChangeText={handleChange('currentPassword')}
                      onBlur={handleBlur('currentPassword')}
                      placeholder='Mevcut şifreniz'
                      secureTextEntry={!showCurrentPassword}
                      rightIcon={
                        showCurrentPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      onRightIconPress={() =>
                        setShowCurrentPassword((prev) => !prev)
                      }
                      error={
                        touched.currentPassword
                          ? errors.currentPassword
                          : undefined
                      }
                    />

                    <AuthTextField
                      label='Yeni Şifre'
                      leftIcon='lock-closed-outline'
                      value={values.newPassword}
                      onChangeText={handleChange('newPassword')}
                      onBlur={handleBlur('newPassword')}
                      placeholder='Yeni şifreniz'
                      secureTextEntry={!showNewPassword}
                      rightIcon={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      onRightIconPress={() => setShowNewPassword((prev) => !prev)}
                      error={touched.newPassword ? errors.newPassword : undefined}
                    />

                    <AuthTextField
                      label='Yeni Şifre Tekrar'
                      leftIcon='lock-closed-outline'
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      placeholder='Yeni şifrenizi tekrar girin'
                      secureTextEntry={!showConfirmPassword}
                      rightIcon={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      onRightIconPress={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      error={
                        touched.confirmPassword
                          ? errors.confirmPassword
                          : undefined
                      }
                    />

                    <ThemedButton
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                      style={styles.actionButton}
                    >
                      <ThemedText style={styles.actionButtonText}>
                        {isSubmitting ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                      </ThemedText>
                    </ThemedButton>
                  </>
                )}
              </Formik>
            ) : (
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: colors.uiBackground,
                    borderColor: colors.borderColor,
                  },
                ]}
              >
                <Ionicons
                  name='information-circle-outline'
                  size={20}
                  color={colors.label}
                />
                <ThemedText style={[styles.infoText, { color: colors.label }]}>
                  Hesabınız Google veya Apple ile giriş yaptığı için şifre
                  değiştirme bu ekranda kullanılamaz.
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 8,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  pendingText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 24,
  },
  actionButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.8,
  },
});
