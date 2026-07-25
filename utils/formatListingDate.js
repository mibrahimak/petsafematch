const MONTHS_TR = [
  'Oca',
  'Şub',
  'Mar',
  'Nis',
  'May',
  'Haz',
  'Tem',
  'Ağu',
  'Eyl',
  'Eki',
  'Kas',
  'Ara',
];

export const formatListingDate = (dateValue) => {
  if (!dateValue) return 'Belirtilmemiş';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Belirtilmemiş';

  const month = MONTHS_TR[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};

export const formatVetVisitDate = (dateValue) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  const month = MONTHS_TR[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${year}`;
};
