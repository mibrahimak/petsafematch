export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;

export const isUserOnline = (lastSeenAt) => {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_THRESHOLD_MS;
};

export const formatLastSeen = (lastSeenAt) => {
  if (!lastSeenAt) return 'Son görülme: bilinmiyor';
  if (isUserOnline(lastSeenAt)) return 'Çevrimiçi';

  const date = new Date(lastSeenAt);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (date >= startOfToday) return `Son görülme: bugün ${time}`;
  if (date >= yesterday) return 'Son görülme: dün';
  return `Son görülme: ${date.toLocaleDateString('tr-TR')}`;
};
