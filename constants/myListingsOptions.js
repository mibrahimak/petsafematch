export const LISTING_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  PASSIVE: 'passive',
};

export const FILTER_TABS = [
  { id: 'all', label: 'Tümü' },
  { id: LISTING_STATUS.ACTIVE, label: 'Aktif' },
  { id: LISTING_STATUS.PENDING, label: 'İncelemede' },
  { id: LISTING_STATUS.PASSIVE, label: 'Pasif' },
];

export const STATUS_CONFIG = {
  [LISTING_STATUS.ACTIVE]: {
    label: 'Aktif',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    icon: 'checkmark-circle',
  },
  [LISTING_STATUS.PENDING]: {
    label: 'İncelemede',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    icon: 'alert-circle',
  },
  [LISTING_STATUS.PASSIVE]: {
    label: 'Pasif',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.12)',
    icon: 'close-circle',
  },
};

export const SUMMARY_ITEMS = [
  { key: 'all', label: 'Toplam', colorKey: 'primary' },
  { key: LISTING_STATUS.ACTIVE, label: 'Aktif', color: '#10b981' },
  { key: LISTING_STATUS.PENDING, label: 'İncelemede', color: '#f59e0b' },
  { key: LISTING_STATUS.PASSIVE, label: 'Pasif', colorKey: 'label' },
];

export const EMPTY_MESSAGES = {
  all: 'Henüz ilan eklemediniz.',
  [LISTING_STATUS.ACTIVE]: 'Aktif ilanınız yok.',
  [LISTING_STATUS.PASSIVE]: 'Pasif ilanınız yok.',
  [LISTING_STATUS.PENDING]: 'İncelemede ilanınız yok.',
};

const AVATAR_COLORS = [
  '#7c9cc0',
  '#a78bfa',
  '#f59e0b',
  '#64748b',
  '#10b981',
  '#e05260',
  '#38bdf8',
];

export const getListingStatus = (listing) => {
  if (listing?.review_status === 'pending') return LISTING_STATUS.PENDING;
  if (
    listing?.is_active === false ||
    listing?.review_status === 'rejected'
  ) {
    return LISTING_STATUS.PASSIVE;
  }
  return LISTING_STATUS.ACTIVE;
};

export const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
