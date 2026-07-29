export const NOTIFICATION_FILTER_TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'unread', label: 'Okunmamış' },
];

export const NOTIFICATION_GROUP_ORDER = ['today', 'week', 'earlier'];

export const NOTIFICATION_GROUP_LABELS = {
  today: 'Bugün',
  week: 'Bu Hafta',
  earlier: 'Daha Önce',
};

export const NOTIFICATION_LEGEND_TYPES = ['favorite', 'match', 'message'];

export const NOTIFICATION_TYPE_CONFIG = {
  favorite: {
    icon: 'heart',
    colorKey: 'warning',
    backgroundColor: 'rgba(224, 82, 96, 0.12)',
  },
  match: {
    icon: 'paw',
    colorKey: 'primary',
    backgroundColor: 'rgba(80, 70, 229, 0.12)',
  },
  message: {
    icon: 'chatbubble-outline',
    colorKey: 'iconColorFocused',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  system: {
    icon: 'shield-checkmark-outline',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  promo: {
    icon: 'star-outline',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
};

export const getNotificationTypeConfig = (type) =>
  NOTIFICATION_TYPE_CONFIG[type] ?? NOTIFICATION_TYPE_CONFIG.system;
