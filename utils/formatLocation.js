export const formatLocation = ({ city, district, location } = {}) => {
  const parts = [city || location, district].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Belirtilmemiş';
};
