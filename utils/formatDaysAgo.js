export const formatDaysAgo = (dateValue) => {
  if (!dateValue) return 'Belirtilmemiş';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Belirtilmemiş';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Bugün';
  if (diffDays === 1) return '1 gün önce';
  return `${diffDays} gün önce`;
};
