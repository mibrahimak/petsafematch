import { memo, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import ThemedText from '../ThemedText';
import BubbleTail from './BubbleTail';

const REPLY_ACTION_WIDTH = 48;
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
  onSwipeableWillOpen,
  swipeableRef,
}) => {
  const bubbleRef = useRef(null);
  const localSwipeableRef = useRef(null);
  const isEmojiOnly = isEmojiOnlyMessage(message.content);

  const setSwipeableRef = useCallback(
    (ref) => {
      localSwipeableRef.current = ref;
      if (typeof swipeableRef === 'function') {
        swipeableRef(ref);
      }
    },
    [swipeableRef]
  );

  const handleLongPress = useCallback(() => {
    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress(message, { x, y, width, height });
    });
  }, [message, onLongPress]);

  const closeSwipeable = useCallback(() => {
    localSwipeableRef.current?.close();
  }, []);

  const handleReplyPress = useCallback(() => {
    onReply(message);
    closeSwipeable();
  }, [message, onReply, closeSwipeable]);

  const handleSwipeableWillOpen = useCallback(() => {
    onSwipeableWillOpen?.();
    onReply(message);
    closeSwipeable();
  }, [message, onReply, onSwipeableWillOpen, closeSwipeable]);

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

  const readIconColor = message.is_read
    ? colors.iconColorFocused
    : isMine
      ? 'rgba(255,255,255,0.45)'
      : colors.label;

  const renderBubbleContent = () => {
    if (isEmojiOnly) {
      return (
        <View style={isMine ? styles.emojiMine : styles.emojiTheirs}>
          <ThemedText style={styles.emojiText}>{message.content.trim()}</ThemedText>
          <View style={[styles.metaRow, isMine && styles.metaRowMine]}>
            <ThemedText style={[styles.metaText, { color: colors.label }]}>
              {formatMessageTime(message.created_at)}
            </ThemedText>
            {isMine ? (
              <Ionicons
                name={message.is_read ? 'checkmark-done' : 'checkmark'}
                size={12}
                color={readIconColor}
              />
            ) : null}
          </View>
        </View>
      );
    }

    const tailColor = isMine ? colors.primary : colors.uiBackground;

    return (
      <View style={styles.bubbleContainer}>
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
                  color: isMine ? 'rgba(255,255,255,0.5)' : colors.label,
                },
              ]}
            >
              {formatMessageTime(message.created_at)}
            </ThemedText>

            {isMine ? (
              <View style={styles.readStatus}>
                <Ionicons
                  name={message.is_read ? 'checkmark-done' : 'checkmark'}
                  size={12}
                  color={readIconColor}
                />
              </View>
            ) : null}
          </View>
        </Pressable>
        <BubbleTail isMine={isMine} color={tailColor} />
      </View>
    );
  };

  return (
    <View style={styles.row}>
      <Swipeable
        ref={setSwipeableRef}
        friction={2.5}
        containerStyle={styles.swipeableContainer}
        renderRightActions={isMine ? renderRightActions : undefined}
        renderLeftActions={isMine ? undefined : renderLeftActions}
        rightThreshold={isMine ? 40 : undefined}
        leftThreshold={isMine ? undefined : 40}
        overshootRight={false}
        overshootLeft={false}
        activeOffsetX={isMine ? [-10, 10000] : [-10000, 10]}
        failOffsetY={[-8, 8]}
        onSwipeableWillOpen={handleSwipeableWillOpen}
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
    marginBottom: 6,
  },
  swipeableContainer: {
    width: '100%',
  },
  bubbleWrapper: {
    maxWidth: '72%',
    overflow: 'visible',
  },
  bubbleWrapperMine: {
    alignSelf: 'flex-end',
  },
  bubbleWrapperTheirs: {
    alignSelf: 'flex-start',
  },
  bubbleContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
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
    paddingHorizontal: 4,
  },
  emojiTheirs: {
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  emojiText: {
    fontSize: 44,
    lineHeight: 50,
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
    fontSize: 14,
    lineHeight: 20,
  },
  textTheirs: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
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
