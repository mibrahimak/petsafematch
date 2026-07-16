import { useMemo } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';

const AuthTextField = ({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const inputStyle = useMemo(
    () => [
      styles.input,
      {
        backgroundColor: colors.uiBackground,
        borderColor: error ? colors.errorText : colors.inputBorder,
        color: colors.title,
      },
      style,
    ],
    [colors, error, style]
  );

  return (
    <View style={styles.wrapper}>
      {label ? (
        <ThemedText style={[styles.label, { color: colors.label }]}>
          {label}
        </ThemedText>
      ) : null}
      <View style={inputStyle}>
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.iconColor}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          style={[styles.textInput, { color: colors.title }]}
          placeholderTextColor={colors.iconColor}
          {...props}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Ionicons name={rightIcon} size={20} color={colors.iconColor} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText style={[styles.errorText, { color: colors.errorText }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
};

export default AuthTextField;

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
  leftIcon: {
    marginRight: 12,
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
