import { useCallback, useContext } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
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
const BUG_SUBJECT = '[Hata Bildirimi] PetSafeMatch';

const validationSchema = Yup.object().shape({
  description: Yup.string()
    .trim()
    .min(10, 'Açıklama en az 10 karakter olmalı')
    .required('Hata açıklaması gerekli'),
  steps: Yup.string().trim(),
});

const initialValues = {
  description: '',
  steps: '',
};

export default function ReportBug() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        const contentLines = [
          'Ne oldu?',
          values.description.trim(),
          '',
          values.steps.trim() ? 'Adımlar:' : null,
          values.steps.trim() || null,
        ].filter(Boolean);

        const body = buildSupportEmailBody({
          userEmail: user?.email,
          appVersion: APP_VERSION,
          platform: Platform.OS,
          content: contentLines.join('\n'),
        });

        await openSupportEmail({
          subject: BUG_SUBJECT,
          body,
        });
      } catch (error) {
        console.error('[report-bug] Form gönderilemedi:', error);
      } finally {
        setSubmitting(false);
      }
    },
    [user?.email]
  );

  return (
    <ThemedView style={styles.container}>
      <HelpScreenHeader title='Hata Bildir' />

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
                Karşılaştığınız teknik sorunu aşağıdaki form ile bize iletin.
                Mümkün olduğunca detaylı açıklama yapmanız çözümü hızlandırır.
              </ThemedText>

              <View style={styles.form}>
                <AuthTextField
                  label='NE OLDU?'
                  placeholder='Karşılaştığınız hatayı açıklayın'
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  error={touched.description && errors.description}
                  multiline
                  numberOfLines={5}
                  style={styles.multilineInput}
                  textAlignVertical='top'
                />

                <AuthTextField
                  label='ADIMLAR (OPSİYONEL)'
                  placeholder='Hatayı tekrar oluşturmak için adımlar'
                  value={values.steps}
                  onChangeText={handleChange('steps')}
                  onBlur={handleBlur('steps')}
                  error={touched.steps && errors.steps}
                  multiline
                  numberOfLines={4}
                  style={styles.multilineInput}
                  textAlignVertical='top'
                />

                <ThemedButton
                  onPress={submitForm}
                  disabled={isSubmitting}
                  style={styles.submitButton}
                >
                  <ThemedText style={styles.submitButtonText}>
                    {isSubmitting ? 'Gönderiliyor...' : 'Hata Bildirimi Gönder'}
                  </ThemedText>
                </ThemedButton>
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
});
