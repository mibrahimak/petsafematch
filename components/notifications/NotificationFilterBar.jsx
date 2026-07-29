import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import NotificationTypeIcon from './NotificationTypeIcon';
import {
  NOTIFICATION_FILTER_TABS,
  NOTIFICATION_LEGEND_TYPES,
} from '../../constants/notificationOptions';

const NotificationFilterBar = ({
  activeFilter,
  unreadCount,
  onFilterChange,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderBottomColor: colors.borderColor },
      ]}
    >
      <View style={styles.tabs}>
        {NOTIFICATION_FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;

          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? colors.primary : colors.uiBackground,
                  borderColor: isActive ? colors.primary : colors.borderColor,
                },
              ]}
              onPress={() => onFilterChange(tab.id)}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.onPrimary : colors.label },
                ]}
              >
                {tab.label}
              </ThemedText>
              {tab.id === 'unread' && unreadCount > 0 ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isActive
                        ? 'rgba(255,255,255,0.2)'
                        : colors.uiBackground,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.badgeText,
                      { color: isActive ? colors.onPrimary : colors.warning },
                    ]}
                  >
                    {unreadCount}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        {NOTIFICATION_LEGEND_TYPES.map((type) => (
          <NotificationTypeIcon key={type} type={type} size={14} compact />
        ))}
      </View>
    </View>
  );
};

export default memo(NotificationFilterBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: 6,
  },
});
