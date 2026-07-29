import { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';

const ReplyPreviewBar = ({ message, senderName, colors, onCancel }) => {
  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: colors.borderColor,
          backgroundColor: colors.navBackground,
        },
      ]}
    >
      <View style={[styles.accent, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        <ThemedText style={[styles.sender, { color: colors.primary }]}>
          {senderName}
        </ThemedText>
        <ThemedText
          style={[styles.preview, { color: colors.text }]}
          numberOfLines={1}
        >
          {message.content}
        </ThemedText>
      </View>
      <Pressable onPress={onCancel} hitSlop={8}>
        <Ionicons name='close' size={22} color={colors.title} />
      </Pressable>
    </View>
  );
};

export default memo(ReplyPreviewBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  sender: {
    fontSize: 13,
    fontWeight: '700',
  },
  preview: {
    fontSize: 13,
    opacity: 0.85,
  },
});
