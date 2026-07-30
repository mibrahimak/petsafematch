import React, { useCallback, useContext, useMemo } from 'react';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../libs/supabase';
import { useTheme } from '../../hooks/useTheme';
import { getCityOptions } from '../../constants/turkeyLocations';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';
import AuthTextField from '../../components/auth/AuthTextField';
import FormSelect from '../../components/forms/FormSelect';

const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .trim()
    .min(2, 'Ad soyad en az 2 karakter olmalı')
    .required('Ad soyad gerekli'),
  city: Yup.string().nullable(),
});

const getAvatarFallback = (fullName) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;

const extractAvatarStoragePath = (avatarUrl) => {
  if (!avatarUrl || avatarUrl.includes('ui-avatars.com')) {
    return null;
  }

  const marker = '/public/avatars/';
  const index = avatarUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return avatarUrl.slice(index + marker.length);
};

const uploadAvatarAsync = async ({ userId, image }) => {
  const filePath = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, decode(image.base64), { contentType: 'image/jpeg' });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(filePath);

  return publicUrl;
};

const removeAvatarFromStorage = async (avatarUrl) => {
  const storagePath = extractAvatarStoragePath(avatarUrl);
  if (!storagePath) {
    return;
  }

  const { error } = await supabase.storage.from('avatars').remove([storagePath]);
  if (error) {
    console.error('[edit-profile] Eski avatar silinemedi:', error);
  }
};

export default function EditProfile() {
  const { profile, user, updateUserProfile } = useContext(AuthContext);
  const { colors } = useTheme();
  const router = useRouter();

  const cityOptions = useMemo(() => getCityOptions(), []);

  const initialValues = useMemo(
    () => ({
      fullName: profile?.full_name || '',
      city: profile?.city || '',
      avatarImage: null,
    }),
    [profile?.full_name, profile?.city]
  );

  const currentAvatarUrl = useMemo(() => {
    const fullName = profile?.full_name || 'Kullanıcı';
    return profile?.avatar_url || getAvatarFallback(fullName);
  }, [profile?.avatar_url, profile?.full_name]);

  const handlePickAvatar = useCallback(async (setFieldValue) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri izni vermelisiniz.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setFieldValue('avatarImage', result.assets[0]);
    }
  }, []);

  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        let nextAvatarUrl = profile?.avatar_url || null;

        if (values.avatarImage) {
          nextAvatarUrl = await uploadAvatarAsync({
            userId: user.id,
            image: values.avatarImage,
          });

          if (profile?.avatar_url) {
            await removeAvatarFromStorage(profile.avatar_url);
          }
        }

        await updateUserProfile({
          fullName: values.fullName,
          avatarUrl: nextAvatarUrl,
          city: values.city,
        });

        Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
          { text: 'Tamam', onPress: () => router.back() },
        ]);
      } catch (error) {
        console.error('[edit-profile] Profil kaydedilemedi:', error);
        Alert.alert(
          'Hata',
          'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [profile?.avatar_url, router, updateUserProfile, user?.id]
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
          Profili Düzenle
        </ThemedText>
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit: submitForm,
          setFieldValue,
          isSubmitting,
        }) => {
          const previewAvatarUrl = values.avatarImage?.uri || currentAvatarUrl;

          return (
            <KeyboardAvoidingView
              style={styles.flex}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.avatarSection}>
                  <Pressable
                    onPress={() => handlePickAvatar(setFieldValue)}
                    style={({ pressed }) => [
                      styles.avatarWrapper,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Image
                      source={{ uri: previewAvatarUrl }}
                      style={[styles.avatar, { borderColor: colors.primary }]}
                    />
                    <View
                      style={[
                        styles.avatarEditBadge,
                        {
                          backgroundColor: colors.primary,
                          borderColor: colors.background,
                        },
                      ]}
                    >
                      <Ionicons
                        name='camera-outline'
                        size={14}
                        color={colors.onPrimary}
                      />
                    </View>
                  </Pressable>
                  <ThemedText style={[styles.avatarHint, { color: colors.label }]}>
                    Fotoğrafı değiştirmek için dokunun
                  </ThemedText>
                </View>

                <AuthTextField
                  label='Ad Soyad'
                  leftIcon='person-outline'
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  placeholder='Adınızı ve soyadınızı girin'
                  autoCapitalize='words'
                  error={touched.fullName ? errors.fullName : undefined}
                />

                <FormSelect
                  label='Şehir'
                  value={values.city}
                  options={cityOptions}
                  onSelect={(option) => setFieldValue('city', option)}
                  placeholder='Şehir seçin'
                  searchable
                  error={touched.city ? errors.city : undefined}
                  onBlur={() => handleBlur('city')}
                />

                <ThemedButton
                  onPress={submitForm}
                  disabled={isSubmitting}
                  style={styles.saveButton}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                  </ThemedText>
                </ThemedButton>
              </ScrollView>
            </KeyboardAvoidingView>
          );
        }}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: 13,
  },
  saveButton: {
    marginTop: 28,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
