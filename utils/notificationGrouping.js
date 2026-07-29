import {
  NOTIFICATION_GROUP_LABELS,
  NOTIFICATION_GROUP_ORDER,
} from '../constants/notificationOptions';

export const formatNotificationDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} sa önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return date.toLocaleDateString('tr-TR');
};

export const getNotificationGroup = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'today';
  if (date >= startOfWeek) return 'week';
  return 'earlier';
};

export const groupNotifications = (notifications) =>
  NOTIFICATION_GROUP_ORDER.map((group) => ({
    group,
    label: NOTIFICATION_GROUP_LABELS[group],
    data: notifications.filter(
      (notification) => getNotificationGroup(notification.created_at) === group
    ),
  })).filter((section) => section.data.length > 0);
