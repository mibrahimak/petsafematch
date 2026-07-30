import React, { useCallback, useContext, useMemo } from 'react';
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
import FormSelect from './forms/FormSelect';
import {
  HEALTH_OPTIONS,
  LISTING_TRAITS,
  TRAIT_LABELS,
  PET_WEIGHT_OPTIONS,
  PET_COLOR_OPTIONS,
  VET_VISIT_OPTIONS,
  getBreedsForCategory,
} from '../constants/listingOptions';
import {
  getCityOptions,
  getDistrictOptions,
} from '../constants/turkeyLocations';

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
  city: yup.string().required('Lütfen şehir seçin'),
  district: yup.string().required('Lütfen ilçe seçin'),
  gender: yup.string().oneOf(GENDERS).required('Lütfen cinsiyet seçin'),
  species: yup.string().required('Lütfen ırk seçin'),
  category: yup
    .string()
    .oneOf(CATEGORIES)
    .required('Lütfen bir kategori seçin'),
  traits: yup.array().of(yup.string().oneOf(TRAIT_LABELS)),
  weight: yup.string().nullable(),
  color: yup.string().nullable(),
  last_vet_visit: yup.string().nullable(),
});

const ACCENT_COLOR = '#2563EB';

const ChipOption = React.memo(function ChipOption({
  label,
  isActive,
  onPress,
  colors,
  long = false,
}) {
  return (
    <Pressable
      style={[
        long ? styles.chipLong : styles.chip,
        { backgroundColor: colors.uiBackground },
        isActive && { backgroundColor: ACCENT_COLOR },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          { color: colors.text },
          isActive && { color: '#FFFFFF' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
});

export default function CreateListingModal({
  visible,
  onClose,
  onRefreshListings,
}) {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const addPetToStore = usePetStore((state) => state.addPetToStore);
  const cityOptions = useMemo(() => getCityOptions(), []);

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
      console.error('[CreateListingModal] Görsel yükleme hatası:', error);
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
      city: '',
      district: '',
      gender: 'Erkek',
      species: '',
      category: 'Kedi',
      traits: [],
      weight: '',
      color: '',
      vaccines: false,
      neutered: false,
      nail_trim: false,
      microchip: false,
      last_vet_visit: '',
    },
    validationSchema: formSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const publicImageUrl = await uploadImageAsync({
          uri: values.imageUri,
          fileName: values.imageFileName,
          mimeType: values.imageMimeType,
        });

        const healthStatus = {
          vaccines: values.vaccines,
          neutered: values.neutered,
          nail_trim: values.nail_trim,
          microchip: values.microchip,
          last_vet_visit: values.last_vet_visit || null,
        };

        const { data, error } = await supabase
          .from('listings')
          .insert([
            {
              name: values.name,
              species: values.species,
              gender: values.gender,
              age: values.age,
              city: values.city,
              district: values.district,
              category: values.category,
              description: values.description,
              image_url: publicImageUrl,
              userId: user?.id,
              is_active: true,
              review_status: 'pending',
              traits: values.traits,
              health_status: healthStatus,
              weight: values.weight || null,
              color: values.color || null,
            },
          ])
          .select();

        if (error) throw error;

        if (data && data.length > 0 && data[0].review_status === 'approved') {
          addPetToStore(data[0]);
        }

        Alert.alert('Başarılı', 'İlanınız başarıyla oluşturuldu!');
        resetForm();
        if (onRefreshListings) onRefreshListings();
        onClose();
      } catch (error) {
        console.error('[CreateListingModal] İlan oluşturma hatası:', error);
        Alert.alert(
          'Hata',
          'İlan oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const breedOptions = useMemo(
    () => getBreedsForCategory(formik.values.category),
    [formik.values.category]
  );

  const districtOptions = useMemo(
    () => getDistrictOptions(formik.values.city),
    [formik.values.city]
  );

  const handleToggleTrait = useCallback(
    (traitLabel) => {
      const currentTraits = formik.values.traits;
      const nextTraits = currentTraits.includes(traitLabel)
        ? currentTraits.filter((trait) => trait !== traitLabel)
        : [...currentTraits, traitLabel];
      formik.setFieldValue('traits', nextTraits);
    },
    [formik]
  );

  const handleToggleHealth = useCallback(
    (healthKey) => {
      formik.setFieldValue(healthKey, !formik.values[healthKey]);
    },
    [formik]
  );

  const handleCategorySelect = useCallback(
    (category) => {
      formik.setFieldValue('category', category);
      formik.setFieldValue('species', '');
    },
    [formik]
  );

  const handleCitySelect = useCallback(
    (city) => {
      formik.setFieldValue('city', city);
      formik.setFieldValue('district', '');
    },
    [formik]
  );

  const handleDistrictSelect = useCallback(
    (district) => {
      formik.setFieldValue('district', district);
    },
    [formik]
  );

  const handleSpeciesSelect = useCallback(
    (species) => {
      formik.setFieldValue('species', species);
    },
    [formik]
  );

  const handleOptionalChipSelect = useCallback(
    (field, value) => {
      formik.setFieldValue(field, formik.values[field] === value ? '' : value);
    },
    [formik]
  );

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
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />

          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Yeni İlan Oluştur
              </ThemedText>

              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name='close' size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
            >
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
                  <View style={styles.imagePlaceholder}>
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
                      style={[
                        styles.imagePlaceholderText,
                        {
                          color:
                            formik.errors.imageUri && formik.touched.imageUri
                              ? '#EF4444'
                              : '#9CA3AF',
                        },
                      ]}
                    >
                      Fotoğraf Seç *
                    </ThemedText>
                  </View>
                )}
              </Pressable>
              {formik.errors.imageUri && formik.touched.imageUri && (
                <Text style={[styles.errorText, styles.imageError]}>
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

              <ThemedText style={styles.label}>Kategori *</ThemedText>
              <View style={styles.chipRow}>
                {CATEGORIES.map((cat) => (
                  <ChipOption
                    key={cat}
                    label={cat}
                    isActive={formik.values.category === cat}
                    onPress={() => handleCategorySelect(cat)}
                    colors={colors}
                  />
                ))}
              </View>
              {formik.errors.category && formik.touched.category && (
                <Text style={styles.errorText}>{formik.errors.category}</Text>
              )}

              <FormSelect
                label='Türü / Irkı *'
                value={formik.values.species}
                options={breedOptions}
                onSelect={handleSpeciesSelect}
                onBlur={() => formik.setFieldTouched('species', true)}
                placeholder='Irk seçin'
                error={
                  formik.errors.species && formik.touched.species
                    ? formik.errors.species
                    : undefined
                }
              />

              <ThemedText style={styles.label}>Cinsiyet *</ThemedText>
              <View style={styles.chipRow}>
                {GENDERS.map((gen) => (
                  <ChipOption
                    key={gen}
                    label={gen}
                    isActive={formik.values.gender === gen}
                    onPress={() => formik.setFieldValue('gender', gen)}
                    colors={colors}
                  />
                ))}
              </View>
              {formik.errors.gender && formik.touched.gender && (
                <Text style={styles.errorText}>{formik.errors.gender}</Text>
              )}

              <ThemedText style={styles.label}>Yaşı *</ThemedText>
              <View style={styles.chipRowVertical}>
                {AGE_GROUPS.map((ageGroup) => (
                  <ChipOption
                    key={ageGroup}
                    label={ageGroup}
                    isActive={formik.values.age === ageGroup}
                    onPress={() => formik.setFieldValue('age', ageGroup)}
                    colors={colors}
                    long
                  />
                ))}
              </View>
              {formik.errors.age && formik.touched.age && (
                <Text style={styles.errorText}>{formik.errors.age}</Text>
              )}

              <FormSelect
                label='Şehir *'
                value={formik.values.city}
                options={cityOptions}
                onSelect={handleCitySelect}
                onBlur={() => formik.setFieldTouched('city', true)}
                placeholder='Şehir seçin'
                searchable
                error={
                  formik.errors.city && formik.touched.city
                    ? formik.errors.city
                    : undefined
                }
              />

              <FormSelect
                label='İlçe *'
                value={formik.values.district}
                options={districtOptions}
                onSelect={handleDistrictSelect}
                onBlur={() => formik.setFieldTouched('district', true)}
                placeholder={
                  formik.values.city ? 'İlçe seçin' : 'Önce şehir seçin'
                }
                disabled={!formik.values.city}
                searchable
                error={
                  formik.errors.district && formik.touched.district
                    ? formik.errors.district
                    : undefined
                }
              />

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

              <ThemedText style={styles.label}>Karakter Özellikleri</ThemedText>
              <View style={styles.chipRow}>
                {LISTING_TRAITS.map((trait) => {
                  const isActive = formik.values.traits.includes(trait.label);

                  return (
                    <ChipOption
                      key={trait.id}
                      label={trait.label}
                      isActive={isActive}
                      onPress={() => handleToggleTrait(trait.label)}
                      colors={colors}
                    />
                  );
                })}
              </View>

              <ThemedText style={styles.label}>Ağırlık</ThemedText>
              <View style={styles.chipRow}>
                {PET_WEIGHT_OPTIONS.map((option) => (
                  <ChipOption
                    key={option}
                    label={option}
                    isActive={formik.values.weight === option}
                    onPress={() => handleOptionalChipSelect('weight', option)}
                    colors={colors}
                  />
                ))}
              </View>

              <ThemedText style={styles.label}>Renk</ThemedText>
              <View style={styles.chipRow}>
                {PET_COLOR_OPTIONS.map((option) => (
                  <ChipOption
                    key={option}
                    label={option}
                    isActive={formik.values.color === option}
                    onPress={() => handleOptionalChipSelect('color', option)}
                    colors={colors}
                  />
                ))}
              </View>

              <ThemedText style={styles.label}>Sağlık Durumu</ThemedText>
              <View style={styles.chipRow}>
                {HEALTH_OPTIONS.map((option) => {
                  const isActive = formik.values[option.key];

                  return (
                    <ChipOption
                      key={option.key}
                      label={option.label}
                      isActive={isActive}
                      onPress={() => handleToggleHealth(option.key)}
                      colors={colors}
                    />
                  );
                })}
              </View>

              <ThemedText style={styles.label}>
                Son Veteriner Ziyareti
              </ThemedText>
              <View style={styles.chipRowVertical}>
                {VET_VISIT_OPTIONS.map((option) => (
                  <ChipOption
                    key={option}
                    label={option}
                    isActive={formik.values.last_vet_visit === option}
                    onPress={() =>
                      handleOptionalChipSelect('last_vet_visit', option)
                    }
                    colors={colors}
                    long
                  />
                ))}
              </View>

              <View style={styles.submitButtonWrapper}>
                <ThemedButton
                    style={[
                      styles.submitButton,
                      {
                        backgroundColor: ACCENT_COLOR,
                        opacity: formik.isSubmitting ? 0.6 : 1,
                      },
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: '90%',
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
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
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    marginTop: 4,
  },
  imageError: {
    textAlign: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipLong: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButtonWrapper: {
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 30,
    borderRadius: 25,
    paddingVertical: 12,
    width: '90%',
  },
  buttonText: {
    color: '#FFFFFF',
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
