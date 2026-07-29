import { memo, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import ThemedText from '../ThemedText';

const REPLY_ACTION_WIDTH = 56;
const EMOJI_ONLY_REGEX = /^\p{Extended_Pictographic}+$/u;

const isEmojiOnlyMessage = (content) => {
  const trimmed = (content || '').trim();
  return trimmed.length > 0 && trimmed.length <= 4 && EMOJI_ONLY_REGEX.test(trimmed);
};

const MessageBubble = ({
  message,
  isMine,
  colors,
  currentUserId,
  otherUserName,
  formatMessageTime,
  onLongPress,
  onReply,
}) => {
  const bubbleRef = useRef(null);
  const swipeableRef = useRef(null);
  const isEmojiOnly = isEmojiOnlyMessage(message.content);

  const handleLongPress = useCallback(() => {
    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress(message, { x, y, width, height });
    });
  }, [message, onLongPress]);

  const handleReplyPress = useCallback(() => {
    onReply(message);
    swipeableRef.current?.close();
  }, [message, onReply]);

  const renderReplyAction = useCallback(
    (flipIcon = false) => (
      <Pressable style={styles.replyAction} onPress={handleReplyPress}>
        <Ionicons
          name='arrow-undo-outline'
          size={22}
          color={colors.label}
          style={flipIcon ? styles.replyIconFlipped : undefined}
        />
      </Pressable>
    ),
    [handleReplyPress, colors.label]
  );

  const renderRightActions = useCallback(
    () => renderReplyAction(false),
    [renderReplyAction]
  );

  const renderLeftActions = useCallback(
    () => renderReplyAction(true),
    [renderReplyAction]
  );

  const replyAuthorName =
    message.reply_to?.sender_id === currentUserId ? 'Sen' : otherUserName;

  const renderBubbleContent = () => {
    if (isEmojiOnly) {
      return (
        <View style={isMine ? styles.emojiMine : styles.emojiTheirs}>
          <ThemedText style={styles.emojiText}>{message.content.trim()}</ThemedText>
          <View style={[styles.metaRow, isMine && styles.metaRowMine]}>
            <ThemedText
              style={[styles.metaText, { color: colors.label }]}
            >
              {formatMessageTime(message.created_at)}
            </ThemedText>
            {isMine ? (
              <Ionicons
                name={message.is_read ? 'checkmark-done' : 'checkmark'}
                size={12}
                color={message.is_read ? colors.iconColorFocused : colors.label}
              />
            ) : null}
          </View>
        </View>
      );
    }

    return (
      <Pressable
        ref={bubbleRef}
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={[
          styles.bubble,
          isMine
            ? [styles.bubbleMine, { backgroundColor: colors.primary }]
            : [
                styles.bubbleTheirs,
                {
                  backgroundColor: colors.uiBackground,
                  borderColor: colors.borderColor,
                },
              ],
        ]}
      >
        {message.reply_to ? (
          <View
            style={[
              styles.quoteBlock,
              {
                borderLeftColor: isMine ? '#A5F3FC' : colors.primary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.quoteAuthor,
                { color: isMine ? '#A5F3FC' : colors.primary },
              ]}
            >
              {replyAuthorName}
            </ThemedText>
            <ThemedText
              style={[
                styles.quoteText,
                { color: isMine ? 'rgba(255,255,255,0.85)' : colors.text },
              ]}
              numberOfLines={2}
            >
              {message.reply_to.content || 'Mesaj silindi'}
            </ThemedText>
          </View>
        ) : null}

        <ThemedText
          style={[
            isMine ? styles.textMine : styles.textTheirs,
            !isMine && { color: colors.title },
          ]}
        >
          {message.content}
        </ThemedText>

        <View style={styles.metaRow}>
          <ThemedText
            style={[
              styles.metaText,
              {
                color: isMine ? 'rgba(255,255,255,0.55)' : colors.label,
              },
            ]}
          >
            {formatMessageTime(message.created_at)}
          </ThemedText>

          {isMine ? (
            <View style={styles.readStatus}>
              <Ionicons
                name={message.is_read ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={
                  message.is_read ? '#A5F3FC' : 'rgba(255,255,255,0.7)'
                }
              />
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.row}>
      <Swipeable
        ref={swipeableRef}
        friction={2}
        containerStyle={styles.swipeableContainer}
        renderRightActions={isMine ? renderRightActions : undefined}
        renderLeftActions={isMine ? undefined : renderLeftActions}
        rightThreshold={isMine ? 30 : undefined}
        leftThreshold={isMine ? undefined : 30}
        overshootRight={false}
        overshootLeft={false}
        activeOffsetX={isMine ? [-10, 10000] : [-10000, 10]}
        failOffsetY={[-8, 8]}
      >
        <View
          style={[
            styles.bubbleWrapper,
            isMine ? styles.bubbleWrapperMine : styles.bubbleWrapperTheirs,
          ]}
        >
          {isEmojiOnly ? (
            <Pressable
              ref={bubbleRef}
              onLongPress={handleLongPress}
              delayLongPress={400}
            >
              {renderBubbleContent()}
            </Pressable>
          ) : (
            renderBubbleContent()
          )}
        </View>
      </Swipeable>
    </View>
  );
};

export default memo(MessageBubble);

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginBottom: 4,
  },
  swipeableContainer: {
    width: '100%',
  },
  bubbleWrapper: {
    maxWidth: '72%',
  },
  bubbleWrapperMine: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperTheirs: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  emojiMine: {
    alignItems: 'flex-end',
  },
  emojiTheirs: {
    alignItems: 'flex-start',
  },
  emojiText: {
    fontSize: 40,
    lineHeight: 48,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 6,
    gap: 2,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 12,
  },
  textMine: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  textTheirs: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 6,
    flexWrap: 'wrap',
  },
  metaRowMine: {
    flexDirection: 'row-reverse',
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
  },
  readStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  replyAction: {
    width: REPLY_ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyIconFlipped: {
    transform: [{ scaleX: -1 }],
  },
});
