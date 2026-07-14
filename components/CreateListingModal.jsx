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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../libs/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFormik } from 'formik';
import { usePetStore } from '../src/store/usePetStore';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as yup from 'yup';

import ThemedView from './ThemedView';
import ThemedText from './ThemedText';
import ThemedButton from './ThemedButton';

const CATEGORIES = ['Kedi', 'Köpek', 'Kuş', 'Diğer'];
const GENDERS = ['Erkek', 'Dişi'];
const AGE_GROUPS = [
  'Yavru (0-1 Yaş)',
  'Genç (1-3 Yaş)',
  'Yetişkin (3-7 Yaş)',
  'Kıdemli (7+ Yaş)',
];

const formSchema = yup.object({
  name: yup.string().trim().required('Lütfen bu alanı doldurun'),
  description: yup.string().trim().required('Lütfen bu alanı doldurun'),
  imageUri: yup.string().required('Lütfen bir fotoğraf ekleyin'),
  age: yup.string().oneOf(AGE_GROUPS).required('Lütfen yaş grubunu seçin'),
  location: yup.string().trim().required('Lütfen bu alanı doldurun'),
  gender: yup.string().oneOf(GENDERS).required('Lütfen cinsiyet seçin'),
  species: yup.string().trim().required('Lütfen bu alanı doldurun'),
  category: yup
    .string()
    .oneOf(CATEGORIES)
    .required('Lütfen bir kategori seçin'),
});

export default function CreateListingModal({
  visible,
  onClose,
  onRefreshListings,
}) {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const addPetToStore = usePetStore((state) => state.addPetToStore);

  const uploadImageAsync = async ({ uri, fileName, mimeType }) => {
    try {
      const fileExt =
        mimeType?.split('/').pop() || fileName?.split('.').pop() || 'jpg';
      const safeMimeType =
        mimeType || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const uploadFileName =
        fileName || `${user?.id || 'anon'}-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id || 'anon'}/${uploadFileName}`;

      const imageFile = new File(uri);
      const bytes = await imageFile.bytes();

      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, bytes, {
          contentType: safeMimeType,
          upsert: false,
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
      imageFileName: '',
      imageMimeType: '',
      age: 'Yavru (0-1 Yaş)',
      location: '',
      gender: 'Erkek',
      species: '',
      category: 'Kedi',
    },
    validationSchema: formSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const publicImageUrl = await uploadImageAsync({
          uri: values.imageUri,
          fileName: values.imageFileName,
          mimeType: values.imageMimeType,
        });

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
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      formik.setFieldValue('imageUri', asset.uri);
      formik.setFieldValue('imageFileName', asset.fileName || 'pet-photo.jpg');
      formik.setFieldValue('imageMimeType', asset.mimeType || 'image/jpeg');
    }
  };

  return (
    <Modal visible={visible} animationType='slide' transparent={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>
                Yeni İlan Oluştur
              </ThemedText>

              <Pressable onPress={onClose}>
                <Ionicons name='close' size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
            >
              {/* MyPets stilinde şık fotoğraf alanı */}
              <Pressable
                style={[
                  styles.imageSelectArea,
                  {
                    borderColor:
                      formik.errors.imageUri && formik.touched.imageUri
                        ? '#EF4444'
                        : colors.borderColor,
                  },
                ]}
                onPress={pickImage}
              >
                {formik.values.imageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: formik.values.imageUri }}
                      style={styles.selectedImage}
                    />
                    <Pressable
                      style={styles.removeImageButton}
                      onPress={() => {
                        formik.setFieldValue('imageUri', '');
                        formik.setFieldValue('imageFileName', '');
                        formik.setFieldValue('imageMimeType', '');
                      }}
                    >
                      <Ionicons name='trash-outline' size={16} color='#FFF' />
                    </Pressable>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons
                      name='camera-outline'
                      size={36}
                      color={
                        formik.errors.imageUri && formik.touched.imageUri
                          ? '#EF4444'
                          : '#9CA3AF'
                      }
                    />
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color:
                          formik.errors.imageUri && formik.touched.imageUri
                            ? '#EF4444'
                            : '#9CA3AF',
                        marginTop: 4,
                      }}
                    >
                      Fotoğraf Seç *
                    </ThemedText>
                  </View>
                )}
              </Pressable>
              {formik.errors.imageUri && formik.touched.imageUri && (
                <Text
                  style={[
                    styles.errorText,
                    { textAlign: 'center', marginBottom: 10 },
                  ]}
                >
                  {formik.errors.imageUri}
                </Text>
              )}

              <ThemedText style={styles.label}>Evcil Hayvan Adı *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.borderColor, color: colors.text },
                ]}
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                onBlur={formik.handleBlur('name')}
                placeholder='Örn: Pamuk'
                placeholderTextColor='#9CA3AF'
              />
              {formik.errors.name && formik.touched.name && (
                <Text style={styles.errorText}>{formik.errors.name}</Text>
              )}

              {/* Kategori Seçim Alanı (Chips) */}
              <ThemedText style={styles.label}>Kategori *</ThemedText>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.chip,
                      formik.values.category === cat && {
                        backgroundColor: '#2563EB',
                      },
                    ]}
                    onPress={() => formik.setFieldValue('category', cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formik.values.category === cat && { color: '#FFF' },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {formik.errors.category && formik.touched.category && (
                <Text style={styles.errorText}>{formik.errors.category}</Text>
              )}

              <ThemedText style={styles.label}>Türü / Irkı *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.borderColor, color: colors.text },
                ]}
                value={formik.values.species}
                onChangeText={formik.handleChange('species')}
                onBlur={formik.handleBlur('species')}
                placeholder='Örn: Tekir, Siyam, Golden'
                placeholderTextColor='#9CA3AF'
              />
              {formik.errors.species && formik.touched.species && (
                <Text style={styles.errorText}>{formik.errors.species}</Text>
              )}

              {/* Cinsiyet Seçim Alanı (Chips) */}
              <ThemedText style={styles.label}>Cinsiyet *</ThemedText>
              <View style={styles.chipRow}>
                {GENDERS.map((gen) => (
                  <Pressable
                    key={gen}
                    style={[
                      styles.chip,
                      formik.values.gender === gen && {
                        backgroundColor: '#2563EB',
                      },
                    ]}
                    onPress={() => formik.setFieldValue('gender', gen)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formik.values.gender === gen && { color: '#FFF' },
                      ]}
                    >
                      {gen}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {formik.errors.gender && formik.touched.gender && (
                <Text style={styles.errorText}>{formik.errors.gender}</Text>
              )}

              {/* Yaş Seçim Alanı (Chips) */}
              <ThemedText style={styles.label}>Yaşı *</ThemedText>
              <View style={styles.chipRowVertical}>
                {AGE_GROUPS.map((ageGroup) => (
                  <Pressable
                    key={ageGroup}
                    style={[
                      styles.chipLong,
                      formik.values.age === ageGroup && {
                        backgroundColor: '#2563EB',
                      },
                    ]}
                    onPress={() => formik.setFieldValue('age', ageGroup)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formik.values.age === ageGroup && { color: '#FFF' },
                      ]}
                    >
                      {ageGroup}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {formik.errors.age && formik.touched.age && (
                <Text style={styles.errorText}>{formik.errors.age}</Text>
              )}

              <ThemedText style={styles.label}>Konum *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.borderColor, color: colors.text },
                ]}
                value={formik.values.location}
                onChangeText={formik.handleChange('location')}
                onBlur={formik.handleBlur('location')}
                placeholder='Örn: Samsun, Atakum'
                placeholderTextColor='#9CA3AF'
              />
              {formik.errors.location && formik.touched.location && (
                <Text style={styles.errorText}>{formik.errors.location}</Text>
              )}

              <ThemedText style={styles.label}>Açıklama *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { borderColor: colors.borderColor, color: colors.text },
                ]}
                value={formik.values.description}
                onChangeText={formik.handleChange('description')}
                onBlur={formik.handleBlur('description')}
                placeholder='İlan detayları...'
                placeholderTextColor='#9CA3AF'
                multiline
                numberOfLines={4}
              />
              {formik.errors.description && formik.touched.description && (
                <Text style={styles.errorText}>
                  {formik.errors.description}
                </Text>
              )}

              <View style={styles.submitButtonWrapper}>
                <ThemedButton
                  style={[
                    styles.submitButton,
                    { opacity: formik.isSubmitting ? 0.6 : 1 },
                  ]}
                  onPress={formik.handleSubmit}
                  disabled={formik.isSubmitting}
                >
                  <ThemedText style={styles.buttonText}>
                    {formik.isSubmitting ? 'Yayınlanıyor...' : 'Yayınla'}
                  </ThemedText>
                </ThemedButton>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
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
    marginBottom: 8,
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
  imageSelectArea: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 10,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 6,
    borderRadius: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 5,
  },
  chipRowVertical: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 5,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipLong: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  submitButtonWrapper: {
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 30,
    borderRadius: 25,
    paddingVertical: 12,
    width: '90%',
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
