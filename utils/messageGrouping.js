const getDateLabel = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= startOfToday) return 'Bugün';
  if (date >= yesterday) return 'Dün';

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  });
};

export const groupMessagesWithDateSeparators = (messages) => {
  const items = [];
  let lastDateLabel = null;

  (messages || []).forEach((message) => {
    const dateLabel = getDateLabel(message.created_at);

    if (dateLabel !== lastDateLabel) {
      items.push({ type: 'date', id: `date-${dateLabel}-${message.id}`, dateLabel });
      lastDateLabel = dateLabel;
    }

    items.push({ type: 'message', id: message.id, message });
  });

  return items;
};

export const formatConversationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date >= startOfToday) {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (date >= yesterday) return 'Dün';

  const dayDiff = Math.floor((startOfToday - date) / 86400000);
  if (dayDiff < 7) {
    return date.toLocaleDateString('tr-TR', { weekday: 'short' });
  }

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
  });
};
