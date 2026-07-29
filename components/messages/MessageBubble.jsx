import { memo, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import ThemedText from '../ThemedText';

const REPLY_ACTION_WIDTH = 56;

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

  const handleLongPress = useCallback(() => {
    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress(message, { x, y, width, height });
    });
  }, [message, onLongPress]);

  const handleReplyPress = useCallback(() => {
    onReply(message);
    swipeableRef.current?.close();
  }, [message, onReply]);

  const renderRightActions = useCallback(
    () => (
      <Pressable style={styles.replyAction} onPress={handleReplyPress}>
        <Ionicons name='arrow-undo-outline' size={22} color='#9CA3AF' />
      </Pressable>
    ),
    [handleReplyPress]
  );

  const replyAuthorName =
    message.reply_to?.sender_id === currentUserId ? 'Sen' : otherUserName;

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <Swipeable
        ref={swipeableRef}
        friction={2}
        rightThreshold={30}
        renderRightActions={renderRightActions}
        overshootRight={false}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-8, 8]}
      >
        <Pressable
          ref={bubbleRef}
          onLongPress={handleLongPress}
          delayLongPress={400}
          style={[
            styles.bubble,
            isMine
              ? [styles.bubbleMine, { backgroundColor: colors.primary }]
              : [styles.bubbleTheirs, { backgroundColor: '#1e293b' }],
          ]}
        >
          {message.reply_to && (
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
                  { color: isMine ? 'rgba(255,255,255,0.85)' : '#CBD5E1' },
                ]}
                numberOfLines={2}
              >
                {message.reply_to.content || 'Mesaj silindi'}
              </ThemedText>
            </View>
          )}

          <ThemedText style={isMine ? styles.textMine : styles.textTheirs}>
            {message.content}
          </ThemedText>

          <View style={styles.metaRow}>
            <ThemedText style={styles.metaText}>
              {formatMessageTime(message.created_at)}
            </ThemedText>

            {isMine && (
              <View style={styles.readStatus}>
                <Ionicons
                  name={message.is_read ? 'checkmark-done' : 'checkmark'}
                  size={14}
                  color={message.is_read ? '#A5F3FC' : 'rgba(255,255,255,0.7)'}
                />
              </View>
            )}
          </View>
        </Pressable>
      </Swipeable>
    </View>
  );
};

export default memo(MessageBubble);

const styles = StyleSheet.create({
  row: {
    marginBottom: 4,
    maxWidth: '85%',
  },
  rowMine: {
    alignSelf: 'flex-end',
  },
  rowTheirs: {
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
    fontWeight: 'bold',
  },
  textTheirs: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
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
});
