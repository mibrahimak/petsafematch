export const formatLocation = ({
  city,
  district,
  location,
  hideExactLocation = false,
} = {}) => {
  const parts = hideExactLocation
    ? [city || location].filter(Boolean)
    : [city || location, district].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Belirtilmemiş';
};
