import { create } from 'zustand';
import { MATCH_DECK_COOLDOWN_MS } from '../../constants/matchDeck';
import {
  addHiddenPetId as persistHiddenPetId,
  addHiddenPetIds as persistHiddenPetIds,
} from '../../libs/matchDeckCache';

export const useMatchDeckStore = create((set, get) => ({
  hiddenBySwiperPet: {},

  hidePet: (swiperPetId, targetPetId) => {
    if (!swiperPetId || !targetPetId) return;

    const expiresAt = Date.now() + MATCH_DECK_COOLDOWN_MS;
    const current = get().hiddenBySwiperPet[swiperPetId] || {};

    set({
      hiddenBySwiperPet: {
        ...get().hiddenBySwiperPet,
        [swiperPetId]: {
          ...current,
          [targetPetId]: expiresAt,
        },
      },
    });

    persistHiddenPetId(swiperPetId, targetPetId);
  },

  hidePets: (swiperPetId, targetPetIds) => {
    if (!swiperPetId || !targetPetIds?.length) return;

    const expiresAt = Date.now() + MATCH_DECK_COOLDOWN_MS;
    const current = get().hiddenBySwiperPet[swiperPetId] || {};
    const updated = { ...current };

    targetPetIds.forEach((targetPetId) => {
      if (targetPetId) updated[targetPetId] = expiresAt;
    });

    set({
      hiddenBySwiperPet: {
        ...get().hiddenBySwiperPet,
        [swiperPetId]: updated,
      },
    });

    persistHiddenPetIds(swiperPetId, targetPetIds);
  },

  getHiddenPetIds: (swiperPetId) => {
    if (!swiperPetId) return [];

    const entries = get().hiddenBySwiperPet[swiperPetId] || {};
    const now = Date.now();

    return Object.entries(entries)
      .filter(([, expiresAt]) => expiresAt > now)
      .map(([targetPetId]) => targetPetId);
  },

  mergeHiddenFromCache: (swiperPetId, targetPetIds) => {
    if (!swiperPetId || !targetPetIds?.length) return;

    const expiresAt = Date.now() + MATCH_DECK_COOLDOWN_MS;
    const current = get().hiddenBySwiperPet[swiperPetId] || {};
    const updated = { ...current };

    targetPetIds.forEach((targetPetId) => {
      if (targetPetId) updated[targetPetId] = expiresAt;
    });

    set({
      hiddenBySwiperPet: {
        ...get().hiddenBySwiperPet,
        [swiperPetId]: updated,
      },
    });
  },

  unhidePet: (swiperPetId, targetPetId) => {
    if (!swiperPetId || !targetPetId) return;

    const current = get().hiddenBySwiperPet[swiperPetId];
    if (!current?.[targetPetId]) return;

    const updated = { ...current };
    delete updated[targetPetId];

    set({
      hiddenBySwiperPet: {
        ...get().hiddenBySwiperPet,
        [swiperPetId]: updated,
      },
    });
  },
}));
