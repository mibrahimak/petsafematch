import { useCallback, useContext } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { SUPPORT_EMAIL } from '../../constants/helpContent';
import {
  buildSupportEmailBody,
  openSupportEmail,
} from '../../utils/supportEmail';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import AuthTextField from '../../components/auth/AuthTextField';
import HelpScreenHeader from '../../components/help/HelpScreenHeader';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const validationSchema = Yup.object().shape({
  subject: Yup.string().trim().required('Konu gerekli'),
  message: Yup.string()
    .trim()
    .min(10, 'Mesaj en az 10 karakter olmalı')
    .required('Mesaj gerekli'),
});

const initialValues = {
  subject: '',
  message: '',
};

export default function ContactSupport() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const handleDirectEmail = useCallback(async () => {
    await openSupportEmail({
      subject: 'PetSafeMatch Destek',
      body: '',
    });
  }, []);

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        const body = buildSupportEmailBody({
          userEmail: user?.email,
          appVersion: APP_VERSION,
          platform: Platform.OS,
          content: values.message.trim(),
        });

        await openSupportEmail({
          subject: values.subject.trim(),
          body,
        });
      } catch (error) {
        console.error('[contact-support] Form gönderilemedi:', error);
      } finally {
        setSubmitting(false);
      }
    },
    [user?.email]
  );

  return (
    <ThemedView style={styles.container}>
      <HelpScreenHeader title='Bize Ulaşın' />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: submitForm,
          isSubmitting,
        }) => (
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
            >
              <ThemedText style={[styles.description, { color: colors.label }]}>
                Destek talebinizi form üzerinden iletebilir veya doğrudan{' '}
                {SUPPORT_EMAIL} adresine e-posta gönderebilirsiniz.
              </ThemedText>

              <View style={styles.form}>
                <AuthTextField
                  label='KONU'
                  placeholder='Destek talebinizin konusu'
                  value={values.subject}
                  onChangeText={handleChange('subject')}
                  onBlur={handleBlur('subject')}
                  error={touched.subject && errors.subject}
                />

                <AuthTextField
                  label='MESAJ'
                  placeholder='Sorunuzu veya talebinizi yazın'
                  value={values.message}
                  onChangeText={handleChange('message')}
                  onBlur={handleBlur('message')}
                  error={touched.message && errors.message}
                  multiline
                  numberOfLines={5}
                  style={styles.multilineInput}
                  textAlignVertical='top'
                />

                <ThemedButton
                  onPress={submitForm}
                  disabled={isSubmitting}
                  style={styles.submitButton}
                >
                  <ThemedText style={styles.submitButtonText}>
                    {isSubmitting ? 'Gönderiliyor...' : 'Destek Talebi Gönder'}
                  </ThemedText>
                </ThemedButton>

                <Pressable
                  onPress={handleDirectEmail}
                  style={({ pressed }) => [
                    styles.emailButton,
                    {
                      borderColor: colors.borderColor,
                      backgroundColor: colors.uiBackground,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText style={[styles.emailButtonText, { color: colors.primary }]}>
                    Doğrudan E-posta Gönder ({SUPPORT_EMAIL})
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Formik>
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
  scrollContent: {
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  form: {
    paddingHorizontal: 16,
  },
  multilineInput: {
    alignItems: 'flex-start',
    minHeight: 120,
    paddingVertical: 14,
  },
  submitButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emailButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
