import AsyncStorage from '@react-native-async-storage/async-storage';
import { MATCH_DECK_COOLDOWN_MS } from '../constants/matchDeck';

const getCacheKey = (swiperPetId) => `match_deck_hidden_${swiperPetId}`;

const pruneExpired = (entries) => {
  const now = Date.now();
  const pruned = {};

  Object.entries(entries).forEach(([targetPetId, expiresAt]) => {
    if (expiresAt > now) {
      pruned[targetPetId] = expiresAt;
    }
  });

  return pruned;
};

const readCache = async (swiperPetId) => {
  try {
    const raw = await AsyncStorage.getItem(getCacheKey(swiperPetId));
    if (!raw) return {};
    return pruneExpired(JSON.parse(raw));
  } catch (error) {
    console.error('[matchDeckCache] Cache okunurken hata:', error);
    return {};
  }
};

const writeCache = async (swiperPetId, entries) => {
  try {
    await AsyncStorage.setItem(
      getCacheKey(swiperPetId),
      JSON.stringify(pruneExpired(entries))
    );
  } catch (error) {
    console.error('[matchDeckCache] Cache yazılırken hata:', error);
  }
};

export const addHiddenPetId = async (swiperPetId, targetPetId) => {
  if (!swiperPetId || !targetPetId) return;

  const entries = await readCache(swiperPetId);
  entries[targetPetId] = Date.now() + MATCH_DECK_COOLDOWN_MS;
  await writeCache(swiperPetId, entries);
};

export const addHiddenPetIds = async (swiperPetId, targetPetIds) => {
  if (!swiperPetId || !targetPetIds?.length) return;

  const entries = await readCache(swiperPetId);
  const expiresAt = Date.now() + MATCH_DECK_COOLDOWN_MS;

  targetPetIds.forEach((targetPetId) => {
    if (targetPetId) entries[targetPetId] = expiresAt;
  });

  await writeCache(swiperPetId, entries);
};

export const getHiddenPetIds = async (swiperPetId) => {
  if (!swiperPetId) return [];

  const entries = await readCache(swiperPetId);
  return Object.keys(entries);
};

export const mergeHiddenPetIds = async (swiperPetId, targetPetIds) => {
  if (!swiperPetId || !targetPetIds?.length) return;

  await addHiddenPetIds(swiperPetId, targetPetIds);
};
