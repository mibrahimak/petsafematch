import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import ThemedView from '../ThemedView';

const normalizeSearch = (value) =>
  (value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

const OptionRow = memo(function OptionRow({ label, isSelected, onPress, colors }) {
  return (
    <Pressable
      style={[
        styles.optionRow,
        {
          backgroundColor: isSelected ? colors.primarySurface : 'transparent',
          borderBottomColor: colors.borderColor,
        },
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.optionText,
          isSelected && { color: colors.primary, fontWeight: '600' },
        ]}
      >
        {label}
      </ThemedText>
      {isSelected ? (
        <Ionicons name='checkmark' size={18} color={colors.primary} />
      ) : null}
    </Pressable>
  );
});

const FormSelect = ({
  label,
  value,
  options = [],
  onSelect,
  placeholder = 'Seçiniz',
  disabled = false,
  searchable = false,
  error,
  onBlur,
}) => {
  const { colors } = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const normalized = normalizeSearch(searchQuery.trim());
    return options.filter((option) =>
      normalizeSearch(option).includes(normalized)
    );
  }, [options, searchQuery, searchable]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setSearchQuery('');
    setPickerVisible(true);
  }, [disabled]);

  const handleClose = useCallback(() => {
    setPickerVisible(false);
    setSearchQuery('');
    if (onBlur) onBlur();
  }, [onBlur]);

  const handleSelect = useCallback(
    (option) => {
      onSelect(option);
      setPickerVisible(false);
      setSearchQuery('');
      if (onBlur) onBlur();
    },
    [onBlur, onSelect]
  );

  const renderOption = useCallback(
    ({ item }) => (
      <OptionRow
        label={item}
        isSelected={item === value}
        onPress={() => handleSelect(item)}
        colors={colors}
      />
    ),
    [colors, handleSelect, value]
  );

  const keyExtractor = useCallback((item) => item, []);

  return (
    <View>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}

      <Pressable
        style={[
          styles.trigger,
          {
            borderColor: error ? '#EF4444' : colors.borderColor,
            backgroundColor: colors.uiBackground,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text
          style={[
            styles.triggerText,
            { color: value ? colors.text : '#9CA3AF' },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name='chevron-down' size={18} color={colors.label} />
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={pickerVisible}
        animationType='slide'
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.pickerOverlay}>
          <Pressable style={styles.pickerBackdrop} onPress={handleClose} />
          <ThemedView style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <ThemedText style={styles.pickerTitle}>
                {label || 'Seçiniz'}
              </ThemedText>
              <Pressable onPress={handleClose} hitSlop={8}>
                <Ionicons name='close' size={22} color={colors.text} />
              </Pressable>
            </View>

            {searchable ? (
              <View
                style={[
                  styles.searchBox,
                  {
                    borderColor: colors.borderColor,
                    backgroundColor: colors.uiBackground,
                  },
                ]}
              >
                <Ionicons name='search' size={16} color={colors.label} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder='Ara...'
                  placeholderTextColor='#9CA3AF'
                  autoCorrect={false}
                />
              </View>
            ) : null}

            <FlatList
              data={filteredOptions}
              keyExtractor={keyExtractor}
              renderItem={renderOption}
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <ThemedText style={[styles.emptyText, { color: colors.label }]}>
                  Sonuç bulunamadı
                </ThemedText>
              }
            />
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
};

export default memo(FormSelect);

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 46,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerSheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
});
