export const LISTING_TRAITS = [
  { id: 'Oyuncu', label: 'Oyuncu', icon: 'flash-outline' },
  { id: 'Sosyal', label: 'Sosyal', icon: 'people-outline' },
  { id: 'Ev Tipi', label: 'Ev Tipi', icon: 'home-outline' },
  { id: 'Dostane', label: 'Dostane', icon: 'heart-outline' },
];

export const HEALTH_OPTIONS = [
  { key: 'vaccines', label: 'Aşılar' },
  { key: 'neutered', label: 'Kısırlaştırma' },
  { key: 'nail_trim', label: 'Tırnak Kesimi' },
  { key: 'microchip', label: 'Mikroçip' },
];

export const LISTING_TABS = [
  { id: 'about', label: 'Hakkında' },
  { id: 'health', label: 'Sağlık' },
  { id: 'owner', label: 'Sahip' },
];

export const TRAIT_LABELS = LISTING_TRAITS.map((trait) => trait.label);

export const getTraitIcon = (label) => {
  const trait = LISTING_TRAITS.find((item) => item.label === label);
  return trait?.icon ?? 'paw-outline';
};
