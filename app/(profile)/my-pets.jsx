import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

import { supabase } from '../../libs/supabase';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ThemedButton from '../../components/ThemedButton';

const CATEGORIES = ['Kedi', 'Köpek', 'Kuş', 'Diğer'];
const GENDERS = ['Erkek', 'Dişi'];
const AGE_GROUPS = [
  'Yavru (0-1 Yaş)',
  'Genç (1-3 Yaş)',
  'Yetişkin (3-7 Yaş)',
  'Kıdemli (7+ Yaş)',
];

const petValidationSchema = Yup.object().shape({
  petName: Yup.string()
    .trim()
    .required('Dostunuzun adı zorunludur.')
    .min(2, 'Adı en az 2 karakter olmalıdır.'),
  category: Yup.string().oneOf(CATEGORIES).required(),
  petSpecies: Yup.string().trim().required('Cinsi / Irkı zorunludur.'),
  gender: Yup.string().oneOf(GENDERS).required(),
  age: Yup.string().oneOf(AGE_GROUPS).required(),
  petImage: Yup.mixed().required('Dostunuzun fotoğrafını eklemek zorunludur.'),
});

export default function MyPets() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchMyPets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_pets')
        .select('*')
        .eq('userId', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Can dostlarınız listelenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyPets();
  }, [fetchMyPets]);

  const pickImage = async (setFieldValue) => {
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
      setFieldValue('petImage', result.assets[0]);
    }
  };

  const uploadImageAsync = async (image) => {
    try {
      const filePath = `my-pets/${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, decode(image.base64), { contentType: 'image/jpeg' });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('pet-photos').getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleDeletePet = async (pet) => {
    Alert.alert(
      'Emin misiniz?',
      `${pet.name} dostunuzu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Veritabanından sil
              const { error } = await supabase
                .from('user_pets')
                .delete()
                .eq('id', pet.id);

              if (error) throw error;

              // 2. Eğer depolanmış bir görsel varsa storage'dan da temizle (İsteğe bağlı temizlik)
              if (pet.image_url) {
                const urlParts = pet.image_url.split('/public/pet-photos/');
                if (urlParts.length > 1) {
                  const storagePath = urlParts[1];
                  await supabase.storage
                    .from('pet-photos')
                    .remove([storagePath]);
                }
              }

              Alert.alert('Başarılı', 'Dostunuz başarıyla silindi.');
              fetchMyPets();
            } catch (error) {
              console.error(error);
              Alert.alert('Hata', 'Silme işlemi sırasında bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    setUploading(true);
    let uploadedImageUrl = null;

    if (values.petImage) {
      uploadedImageUrl = await uploadImageAsync(values.petImage);
    }

    try {
      const { error } = await supabase.from('user_pets').insert([
        {
          userId: user.id,
          name: values.petName.trim(),
          category: values.category,
          species: values.petSpecies.trim(),
          gender: values.gender,
          age: values.age,
          image_url: uploadedImageUrl,
        },
      ]);

      if (error) throw error;

      Alert.alert('Başarılı', `${values.petName} başarıyla kaydedildi! 🐾`);
      setModalVisible(false);
      resetForm();
      fetchMyPets();
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Kaydedilirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size='large' color={'#2563EB'} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle} title={true}>
          Patili Dostlarım
        </ThemedText>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name='paw-outline' size={72} color='#9CA3AF' />
          <ThemedText style={styles.emptyTitle}>Henüz Dostunuz Yok</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Sağ alttaki butonu kullanarak evcil hayvanınızı ekleyebilir ve
            sağlık karnesini takip edebilirsiniz.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.petCard,
                {
                  backgroundColor: colors.uiBackground,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              <Image
                source={{
                  uri: item.image_url || 'https://via.placeholder.com/150',
                }}
                style={styles.petImage}
              />
              <View style={styles.petDetails}>
                <View style={styles.nameRow}>
                  <ThemedText style={styles.petName}>{item.name}</ThemedText>
                  <Text style={styles.genderIcon}>
                    {item.gender === 'Erkek' ? '♂️' : '♀️'}
                  </Text>
                </View>
                <ThemedText style={styles.petMeta}>
                  {item.category} • {item.species}
                </ThemedText>
                <ThemedText style={styles.petAge}>{item.age}</ThemedText>

                <Pressable
                  style={[
                    styles.healthButton,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                  onPress={() => console.log('Sağlık Karnesine Tıklandı!')}
                >
                  <Ionicons
                    name='medical-outline'
                    size={16}
                    color={'#2563EB'}
                  />
                  <Text style={[styles.healthButtonText, { color: '#2563EB' }]}>
                    Sağlık Karnesi
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeletePet(item)}
              >
                <Ionicons name='trash-outline' size={20} color='#EF4444' />
              </Pressable>
            </View>
          )}
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: '#2563EB' }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name='add' size={30} color='#FFF' />
      </Pressable>

      <Formik
        initialValues={{
          petName: '',
          category: 'Kedi',
          petSpecies: '',
          gender: 'Erkek',
          age: 'Yavru (0-1 Yaş)',
          petImage: null,
        }}
        validationSchema={petValidationSchema}
        onSubmit={handleFormSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          resetForm,
        }) => (
          <Modal
            visible={modalVisible}
            animationType='slide'
            transparent={true}
            onRequestClose={() => {
              setModalVisible(false);
              resetForm();
            }}
          >
            <Pressable
              style={styles.dismissArea}
              onPress={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <ThemedView style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <ThemedView>
                      <ThemedText style={styles.modalTitle}>
                        Yeni Patili Dost Ekle
                      </ThemedText>
                    </ThemedView>
                    <Pressable
                      onPress={() => {
                        setModalVisible(false);
                        resetForm();
                      }}
                    >
                      <Ionicons name='close' size={24} color={colors.text} />
                    </Pressable>
                  </View>

                  <ScrollView
                    contentContainerStyle={styles.modalScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <Pressable
                      style={[
                        styles.imageSelectArea,
                        {
                          borderColor:
                            errors.petImage && touched.petImage
                              ? '#EF4444'
                              : colors.borderColor,
                        },
                      ]}
                      onPress={() => pickImage(setFieldValue)}
                    >
                      {values.petImage ? (
                        <Image
                          source={{ uri: values.petImage.uri }}
                          style={styles.selectedImage}
                        />
                      ) : (
                        <View style={{ alignItems: 'center' }}>
                          <Ionicons
                            name='camera-outline'
                            size={36}
                            color={
                              errors.petImage && touched.petImage
                                ? '#EF4444'
                                : '#9CA3AF'
                            }
                          />
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color:
                                errors.petImage && touched.petImage
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
                    {touched.petImage && errors.petImage && (
                      <Text
                        style={[
                          styles.errorText,
                          { textAlign: 'center', marginBottom: 10 },
                        ]}
                      >
                        {errors.petImage}
                      </Text>
                    )}

                    <ThemedText style={styles.inputLabel}>Adı</ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: colors.borderColor, color: colors.text },
                      ]}
                      placeholder='Örn: Pamuk'
                      placeholderTextColor='#9CA3AF'
                      onChangeText={handleChange('petName')}
                      onBlur={handleBlur('petName')}
                      value={values.petName}
                    />
                    {touched.petName && errors.petName && (
                      <Text style={styles.errorText}>{errors.petName}</Text>
                    )}

                    <ThemedText style={styles.inputLabel}>Kategori</ThemedText>
                    <View style={styles.chipRow}>
                      {CATEGORIES.map((cat) => (
                        <Pressable
                          key={cat}
                          style={[
                            styles.chip,
                            values.category === cat && {
                              backgroundColor: '#2563EB',
                            },
                          ]}
                          onPress={() => setFieldValue('category', cat)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              values.category === cat && { color: '#FFF' },
                            ]}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <ThemedText style={styles.inputLabel}>
                      Cinsi / Irkı
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.input,
                        { borderColor: colors.borderColor, color: colors.text },
                      ]}
                      placeholder='Örn: Tekir, Siyam, Golden'
                      placeholderTextColor='#9CA3AF'
                      onChangeText={handleChange('petSpecies')}
                      onBlur={handleBlur('petSpecies')}
                      value={values.petSpecies}
                    />
                    {touched.petSpecies && errors.petSpecies && (
                      <Text style={styles.errorText}>{errors.petSpecies}</Text>
                    )}

                    <ThemedText style={styles.inputLabel}>Cinsiyet</ThemedText>
                    <View style={styles.chipRow}>
                      {GENDERS.map((gen) => (
                        <Pressable
                          key={gen}
                          style={[
                            styles.chip,
                            values.gender === gen && {
                              backgroundColor: '#2563EB',
                            },
                          ]}
                          onPress={() => setFieldValue('gender', gen)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              values.gender === gen && { color: '#FFF' },
                            ]}
                          >
                            {gen}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <ThemedText style={styles.inputLabel}>Yaş</ThemedText>
                    <View style={styles.chipRowVertical}>
                      {AGE_GROUPS.map((ageGroup) => (
                        <Pressable
                          key={ageGroup}
                          style={[
                            styles.chipLong,
                            values.age === ageGroup && {
                              backgroundColor: '#2563EB',
                            },
                          ]}
                          onPress={() => setFieldValue('age', ageGroup)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              values.age === ageGroup && { color: '#FFF' },
                            ]}
                          >
                            {ageGroup}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.saveButtonWrapper}>
                      <ThemedButton
                        style={styles.saveButton}
                        onPress={handleSubmit}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <ActivityIndicator color='#FFF' />
                        ) : (
                          <ThemedText style={styles.saveButtonText}>
                            Kaydet
                          </ThemedText>
                        )}
                      </ThemedButton>
                    </View>
                  </ScrollView>
                </ThemedView>
              </View>
            </Pressable>
          </Modal>
        )}
      </Formik>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  petCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative', // Delete butonu konumlandırması için
  },
  petImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 16,
  },
  petDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
  },
  genderIcon: {
    fontSize: 16,
  },
  petMeta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  petAge: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  healthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  healthButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  dismissArea: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    paddingBottom: 40,
  },
  imageSelectArea: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipRowVertical: {
    flexDirection: 'column',
    gap: 8,
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
  saveButton: {
    marginTop: 30,
    borderRadius: 25,
    paddingVertical: 12,
    width: '90%',
    backgroundColor: '#2563EB',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  saveButtonWrapper: {
    alignItems: 'center',
  },
});
