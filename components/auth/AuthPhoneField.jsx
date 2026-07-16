import { useMemo } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const AuthPhoneField = ({
  label = 'Telefon',
  value,
  onChangeText,
  onBlur,
  error,
  placeholder = '5XX XXX XX XX',
}) => {
  const { colors } = useTheme();

  const inputContainerStyle = useMemo(
    () => [
      styles.input,
      {
        backgroundColor: colors.uiBackground,
        borderColor: error ? colors.errorText : colors.inputBorder,
      },
    ],
    [colors, error]
  );

  const handleChangeText = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    onChangeText(digits);
  };

  return (
    <View style={styles.wrapper}>
      <ThemedText style={[styles.label, { color: colors.label }]}>
        {label}
      </ThemedText>
      <View style={inputContainerStyle}>
        <View style={styles.prefix}>
          <ThemedText style={styles.flag}>🇹🇷</ThemedText>
          <ThemedText style={[styles.dialCode, { color: colors.title }]}>
            +90
          </ThemedText>
          <View
            style={[styles.separator, { backgroundColor: colors.borderColor }]}
          />
        </View>
        <TextInput
          style={[styles.textInput, { color: colors.title }]}
          placeholder={placeholder}
          placeholderTextColor={colors.iconColor}
          keyboardType='phone-pad'
          value={value}
          onChangeText={handleChangeText}
          onBlur={onBlur}
        />
        <Ionicons name='call-outline' size={20} color={colors.iconColor} />
      </View>
      {error ? (
        <ThemedText style={[styles.errorText, { color: colors.errorText }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
};

export default AuthPhoneField;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  separator: {
    width: 1,
    height: 20,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
