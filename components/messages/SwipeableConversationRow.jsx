import { memo, useCallback, useRef } from 'react';
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import ThemedText from '../ThemedText';

const ACTION_WIDTH = 80;

const SwipeableConversationRow = ({
  item,
  userId,
  colors,
  isBlocked,
  onPress,
  onDelete,
  onBlock,
  onSwipeableWillOpen,
  swipeableRef,
}) => {
  const fullName = item.profile?.full_name || 'Kullanıcı';
  const avatarUrl =
    item.profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2B62E5&color=fff&size=150`;
  const isUnread =
    !item.lastMessage.is_read && item.lastMessage.receiver_id === userId;

  const localSwipeableRef = useRef(null);

  const setSwipeableRef = useCallback(
    (ref) => {
      localSwipeableRef.current = ref;
      if (typeof swipeableRef === 'function') {
        swipeableRef(ref);
      }
    },
    [swipeableRef]
  );

  const closeSwipeable = useCallback(() => {
    localSwipeableRef.current?.close();
  }, []);

  const handleBlockPress = useCallback(() => {
    if (isBlocked) {
      closeSwipeable();
      return;
    }

    Alert.alert(
      'Kullanıcıyı engelle',
      `${fullName} adlı kullanıcıyı engellemek istediğinize emin misiniz? Mesaj gönderemez ve alamazsınız.`,
      [
        { text: 'İptal', style: 'cancel', onPress: closeSwipeable },
        {
          text: 'Engelle',
          style: 'destructive',
          onPress: () => {
            onBlock(item.otherUserId);
            closeSwipeable();
          },
        },
      ]
    );
  }, [isBlocked, fullName, item.otherUserId, onBlock, closeSwipeable]);

  const handleDeletePress = useCallback(() => {
    Alert.alert(
      'Konuşmayı sil',
      'Bu konuşma yalnızca sizin listenizden kaldırılacak.',
      [
        { text: 'İptal', style: 'cancel', onPress: closeSwipeable },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            onDelete(item.otherUserId);
            closeSwipeable();
          },
        },
      ]
    );
  }, [item.otherUserId, onDelete, closeSwipeable]);

  const renderRightActions = useCallback(
    () => (
      <View style={styles.actionsRow}>
        <Pressable style={styles.blockAction} onPress={handleBlockPress}>
          <Ionicons name='ban-outline' size={22} color='#FFF' />
          <ThemedText style={styles.actionText}>Engelle</ThemedText>
        </Pressable>
        <Pressable style={styles.deleteAction} onPress={handleDeletePress}>
          <Ionicons name='trash-outline' size={22} color='#FFF' />
          <ThemedText style={styles.actionText}>Sil</ThemedText>
        </Pressable>
      </View>
    ),
    [handleBlockPress, handleDeletePress]
  );

  return (
    <Swipeable
      ref={setSwipeableRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={onSwipeableWillOpen}
      overshootRight={false}
    >
      <Pressable
        style={[
          styles.row,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.background,
          },
        ]}
        onPress={onPress}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.textWrapper}>
          <View style={styles.nameRow}>
            <ThemedText style={[styles.name, { color: colors.title }]}>
              {fullName}
            </ThemedText>
            {isBlocked && (
              <ThemedText style={styles.blockedBadge}>Engellendi</ThemedText>
            )}
          </View>
          <ThemedText
            style={[
              styles.preview,
              isUnread && { fontWeight: '700', color: colors.title },
              { color: colors.title },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.content}
          </ThemedText>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </Pressable>
    </Swipeable>
  );
};

export default memo(SwipeableConversationRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  textWrapper: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  blockedBadge: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  preview: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2B62E5',
  },
  actionsRow: {
    flexDirection: 'row',
  },
  blockAction: {
    width: ACTION_WIDTH,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    width: ACTION_WIDTH,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
