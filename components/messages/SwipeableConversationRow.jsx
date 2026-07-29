import { memo, useCallback, useRef } from 'react';
import { View, Pressable, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import ThemedText from '../ThemedText';
import { formatConversationTime } from '../../utils/messageGrouping';
import { isUserOnline } from '../../utils/presenceUtils';

const ACTION_WIDTH = 80;

const SwipeableConversationRow = ({
  item,
  userId,
  colors,
  isBlocked,
  listing,
  unreadCount = 0,
  onPress,
  onDelete,
  onBlock,
  onSwipeableWillOpen,
  swipeableRef,
}) => {
  const fullName = item.profile?.full_name || 'Kullanıcı';
  const avatarUrl =
    item.profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5046e5&color=fff&size=150`;
  const online = isUserOnline(item.profile?.last_seen_at);
  const hasUnread = unreadCount > 0;

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
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          {online ? (
            <View
              style={[styles.onlineDot, { borderColor: colors.background }]}
            />
          ) : null}
        </View>

        <View style={styles.textWrapper}>
          <View style={styles.nameRow}>
            <ThemedText
              style={[
                styles.name,
                { color: colors.title },
                hasUnread && styles.nameUnread,
              ]}
              numberOfLines={1}
            >
              {fullName}
            </ThemedText>
            <ThemedText
              style={[
                styles.time,
                { color: hasUnread ? colors.primary : colors.label },
              ]}
            >
              {formatConversationTime(item.lastMessage.created_at)}
            </ThemedText>
          </View>

          <View style={styles.previewRow}>
            <ThemedText
              style={[
                styles.preview,
                {
                  color: hasUnread ? colors.text : colors.label,
                  fontWeight: hasUnread ? '600' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.content}
            </ThemedText>
            {hasUnread ? (
              <View
                style={[styles.unreadBadge, { backgroundColor: colors.primary }]}
              >
                <ThemedText style={styles.unreadText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </ThemedText>
              </View>
            ) : null}
          </View>

          {listing?.name ? (
            <View style={styles.petRow}>
              <Ionicons name='paw' size={9} color={colors.label} />
              <ThemedText style={[styles.petText, { color: colors.label }]}>
                {listing.name} hakkında
              </ThemedText>
            </View>
          ) : null}

          {isBlocked ? (
            <ThemedText style={styles.blockedBadge}>Engellendi</ThemedText>
          ) : null}
        </View>
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
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
  },
  textWrapper: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  nameUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 10,
    flexShrink: 0,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preview: {
    fontSize: 12,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  petText: {
    fontSize: 10,
  },
  blockedBadge: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
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
    backgroundColor: '#EF4444',
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
