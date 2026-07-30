export const getPermissionStatusLabel = (status) => {
  switch (status) {
    case 'granted':
      return 'İzin Verildi';
    case 'denied':
      return 'Reddedildi';
    case 'limited':
      return 'Kısıtlı';
    case 'undetermined':
      return 'Henüz İstenmedi';
    case 'unsupported':
      return 'Desteklenmiyor';
    default:
      return 'Bilinmiyor';
  }
};

export const getPermissionStatusColor = (status) => {
  switch (status) {
    case 'granted':
      return '#10B981';
    case 'denied':
      return '#EF4444';
    case 'limited':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

export const canRequestPermission = ({ status, canAskAgain }) =>
  status === 'undetermined' || (status === 'denied' && canAskAgain !== false);

export const shouldOpenSettings = ({ status, canAskAgain }) =>
  status === 'limited' ||
  (status === 'denied' && canAskAgain === false);
