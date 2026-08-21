import { memo } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

const handleComingSoon = () => {
  Alert.alert('Yakında', 'Bu özellik yakında eklenecek.');
};

const ChatInputBar = ({
  value,
  onChangeText,
  onSend,
  editable = true,
  placeholder = 'Mesaj yaz',
  inputRef,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const hasText = value.trim().length > 0;

  const handleFabPress = () => {
    if (hasText) {
      onSend();
      return;
    }
    handleComingSoon();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.borderColor,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <Pressable
        disabled={!editable}
        hitSlop={8}
        style={styles.emojiButton}
        onPress={handleComingSoon}
      >
        <Ionicons name='happy-outline' size={24} color={colors.label} />
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
        {!hasText ? (
          <>
            <Pressable
              disabled={!editable}
              hitSlop={8}
              style={styles.pillIconButton}
              onPress={handleComingSoon}
            >
              <Ionicons name='attach' size={19} color={colors.label} />
            </Pressable>
            <Pressable
              disabled={!editable}
              hitSlop={8}
              style={styles.pillIconButton}
              onPress={handleComingSoon}
            >
              <Ionicons name='camera-outline' size={19} color={colors.label} />
            </Pressable>
          </>
        ) : null}
      </View>

      <Pressable
        onPress={handleFabPress}
        disabled={!editable}
        style={[
          styles.fabButton,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
      >
        <Ionicons
          name={hasText ? 'send' : 'mic'}
          size={18}
          color='#FFF'
          style={hasText ? styles.sendIcon : undefined}
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
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingLeft: 16,
    paddingRight: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 10,
    minWidth: 0,
  },
  pillIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendIcon: {
    marginLeft: 2,
  },
});
