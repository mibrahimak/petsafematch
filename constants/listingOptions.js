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

export const PET_BREEDS_BY_CATEGORY = {
  Kedi: [
    'Tekir',
    'Van Kedisi',
    'British Shorthair',
    'Scottish Fold',
    'Siyam',
    'Ankara Kedisi',
    'Maine Coon',
    'Persian',
    'Ragdoll',
    'Bengal',
    'Diğer',
  ],
  Köpek: [
    'Golden Retriever',
    'Labrador',
    'Kangal',
    'Alman Kurdu',
    'Husky',
    'Poodle',
    'Beagle',
    'Chihuahua',
    'Terrier',
    'Bulldog',
    'Diğer',
  ],
  Kuş: [
    'Muhabbet Kuşu',
    'Kanarya',
    'Sultan Papağanı',
    'Jako Papağanı',
    'Güvercin',
    'Diğer',
  ],
  Diğer: [
    'Tavşan',
    'Hamster',
    'Kaplumbağa',
    'Balık',
    'Sürüngen',
    'Diğer',
  ],
};

export const PET_WEIGHT_OPTIONS = [
  '0-1 kg',
  '1-3 kg',
  '3-5 kg',
  '5-10 kg',
  '10-20 kg',
  '20+ kg',
];

export const PET_COLOR_OPTIONS = [
  'Siyah',
  'Beyaz',
  'Gri',
  'Kahverengi',
  'Turuncu',
  'Sarı',
  'Karma',
  'Diğer',
];

export const VET_VISIT_OPTIONS = [
  'Son 1 ay',
  'Son 3 ay',
  '3-6 ay önce',
  '6-12 ay önce',
  '1 yıldan fazla',
  'Hiç gitmedi',
];

export const getBreedsForCategory = (category) =>
  PET_BREEDS_BY_CATEGORY[category] || PET_BREEDS_BY_CATEGORY.Diğer;
