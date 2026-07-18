import { View, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';
import { useNotificationStore } from '../src/store/useNotificationStore';

const NotificationBadge = () => {
  const unreadCount = useNotificationStore(
    (state) => state.notifications.filter((n) => !n.is_read).length
  );

  if (unreadCount === 0) return null;

  return (
    <View style={styles.badge}>
      <ThemedText style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </ThemedText>
    </View>
  );
};

export default NotificationBadge;

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
