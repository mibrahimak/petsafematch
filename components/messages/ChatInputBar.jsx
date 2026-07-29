import { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

const ChatInputBar = ({
  value,
  onChangeText,
  onSend,
  editable = true,
  placeholder = 'Mesaj yaz',
  inputRef,
}) => {
  const { colors } = useTheme();
  const hasText = value.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.borderColor,
        },
      ]}
    >
      <Pressable disabled={!editable} hitSlop={8}>
        <Ionicons name='attach' size={20} color={colors.iconColor} />
      </Pressable>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.uiBackground,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.label}
          style={[styles.input, { color: colors.title }]}
          multiline
          editable={editable}
        />
        <Pressable disabled={!editable} hitSlop={8}>
          <Ionicons name='happy-outline' size={17} color={colors.iconColor} />
        </Pressable>
      </View>

      <Pressable
        onPress={onSend}
        disabled={!editable || !hasText}
        style={[
          styles.sendButton,
          {
            backgroundColor: hasText ? colors.primary : colors.uiBackground,
            borderColor: hasText ? colors.primary : colors.borderColor,
          },
        ]}
      >
        <Ionicons
          name='send'
          size={16}
          color={hasText ? '#FFF' : colors.iconColor}
        />
      </Pressable>
    </View>
  );
};

export default memo(ChatInputBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
