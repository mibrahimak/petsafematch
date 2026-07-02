import React, { useContext } from 'react';
import {
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  View,
  Pressable,
  Image,
  Text,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../libs/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFormik } from 'formik';
import { usePetStore } from '../src/store/usePetStore';
import * as ImagePicker from 'expo-image-picker';
import * as yup from 'yup';

import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import ThemedButton from './ThemedButton';

const formSchema = yup.object({
  name: yup.string().trim().required('Lütfen bu alanı doldurun'),
  description: yup.string().trim().required('Lütfen bu alanı doldurun'),
  imageUri: yup.string().required('Lütfen bir fotoğraf ekleyin'),
  age: yup.string().trim().required('Lütfen bu alanı doldurun'),
  location: yup.string().trim().required('Lütfen bu alanı doldurun'),
  gender: yup.string().trim().required('Lütfen bu alanı doldurun'),
  species: yup.string().trim().required('Lütfen bu alanı doldurun'),
  category: yup.string().trim().required('Lütfen bu alanı doldurun'),
});

export default function CreateListingModal({
  visible,
  onClose,
  onRefreshListings,
}) {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const addPetToStore = usePetStore((state) => state.addPetToStore);

  const uploadImageAsync = async (uri) => {
    try {
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user?.id || 'anon'}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      throw new Error('Fotoğraf sunucuya yüklenirken bir hata oluştu.');
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      imageUri: '',
      age: '',
      location: '',
      gender: '',
      species: '',
      category: '',
    },
    validationSchema: formSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const publicImageUrl = await uploadImageAsync(values.imageUri);

        const { data, error } = await supabase
          .from('listings')
          .insert([
            {
              name: values.name,
              species: values.species,
              gender: values.gender,
              age: values.age,
              location: values.location,
              category: values.category,
              description: values.description,
              image_url: publicImageUrl,
              userId: user?.id,
              is_active: true,
            },
          ])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          addPetToStore(data[0]);
        }

        Alert.alert('Başarılı', 'İlanınız başarıyla oluşturuldu!');
        resetForm();
        if (onRefreshListings) onRefreshListings();
        onClose();
      } catch (error) {
        Alert.alert('Hata', error.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        'İzin gerekli',
        'Galeriden resim seçmek için izin vermelisiniz.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      formik.setFieldValue('imageUri', result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} animationType='slide' transparent={false}>
      <ThemedView style={styles.modalContainer}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Ionicons name='close' size={24} color={colors.textColor} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Yeni İlan Oluştur</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={styles.label}>Fotoğraf Ekle *</ThemedText>
          {formik.values.imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: formik.values.imageUri }}
                style={styles.imagePreview}
              />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => formik.setFieldValue('imageUri', '')}
              >
                <Ionicons name='trash-outline' size={18} color='#FFF' />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={[
                styles.imagePickerPlaceholder,
                {
                  borderColor:
                    formik.errors.imageUri && formik.touched.imageUri
                      ? '#EF4444'
                      : colors.borderColor,
                  backgroundColor: colors.cardBg,
                },
              ]}
              onPress={pickImage}
            >
              <Ionicons name='camera-outline' size={36} color='#9CA3AF' />
              <Text style={styles.placeholderText}>
                Fotoğraf Seçmek İçin Dokunun
              </Text>
            </Pressable>
          )}
          {formik.errors.imageUri && formik.touched.imageUri && (
            <Text style={styles.errorText}>{formik.errors.imageUri}</Text>
          )}

          <ThemedText style={styles.label}>Evcil Hayvan Adı *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.borderColor, color: colors.textColor },
            ]}
            value={formik.values.name}
            onChangeText={formik.handleChange('name')}
            onBlur={formik.handleBlur('name')}
            placeholder='Örn: Pamuk'
          />
          {formik.errors.name && formik.touched.name && (
            <Text style={styles.errorText}>{formik.errors.name}</Text>
          )}

          <ThemedText style={styles.label}>Türü / Irkı *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.borderColor, color: colors.textColor },
            ]}
            value={formik.values.species}
            onChangeText={formik.handleChange('species')}
            onBlur={formik.handleBlur('species')}
            placeholder='Örn: Tekir'
          />
          {formik.errors.species && formik.touched.species && (
            <Text style={styles.errorText}>{formik.errors.species}</Text>
          )}

          <ThemedText style={styles.label}>Cinsiyet *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.borderColor, color: colors.textColor },
            ]}
            value={formik.values.gender}
            onChangeText={formik.handleChange('gender')}
            onBlur={formik.handleBlur('gender')}
            placeholder='Erkek / Dişi'
          />
          {formik.errors.gender && formik.touched.gender && (
            <Text style={styles.errorText}>{formik.errors.gender}</Text>
          )}

          <ThemedText style={styles.label}>Yaşı *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.borderColor, color: colors.textColor },
            ]}
            value={formik.values.age}
            onChangeText={formik.handleChange('age')}
            onBlur={formik.handleBlur('age')}
            placeholder='Örn: 2 Yaşında'
          />
          {formik.errors.age && formik.touched.age && (
            <Text style={styles.errorText}>{formik.errors.age}</Text>
          )}

          <ThemedText style={styles.label}>Konum *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.borderColor, color: colors.textColor },
            ]}
            value={formik.values.location}
            onChangeText={formik.handleChange('location')}
            onBlur={formik.handleBlur('location')}
            placeholder='Örn: Samsun, Atakum'
          />
          {formik.errors.location && formik.touched.location && (
            <Text style={styles.errorText}>{formik.errors.location}</Text>
          )}

          <ThemedText style={styles.label}>Kategori *</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.borderColor, color: colors.textColor },
            ]}
            value={formik.values.category}
            onChangeText={formik.handleChange('category')}
            onBlur={formik.handleBlur('category')}
            placeholder='Kedi / Köpek vs...'
          />
          {formik.errors.category && formik.touched.category && (
            <Text style={styles.errorText}>{formik.errors.category}</Text>
          )}

          <ThemedText style={styles.label}>Açıklama *</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { borderColor: colors.borderColor, color: colors.textColor },
            ]}
            value={formik.values.description}
            onChangeText={formik.handleChange('description')}
            onBlur={formik.handleBlur('description')}
            placeholder='İlan detayları...'
            multiline
            numberOfLines={4}
          />
          {formik.errors.description && formik.touched.description && (
            <Text style={styles.errorText}>{formik.errors.description}</Text>
          )}

          <ThemedButton
            style={[
              styles.submitButton,
              { opacity: formik.isSubmitting ? 0.6 : 1 },
            ]}
            onPress={formik.handleSubmit}
            disabled={formik.isSubmitting}
          >
            <ThemedText style={styles.buttonText}>
              {formik.isSubmitting
                ? 'Fotoğraf Yükleniyor ve İlan Oluşturuluyor...'
                : 'Yayınla'}
            </ThemedText>
          </ThemedButton>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 30,
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  imagePickerPlaceholder: {
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  placeholderText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 5,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 8,
    borderRadius: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
