import { MATCH_DECK_COOLDOWN_MS } from '../constants/matchDeck';

const getCooldownIso = () =>
  new Date(Date.now() - MATCH_DECK_COOLDOWN_MS).toISOString();

/**
 * Match flow utilities for match_mypet pet-to-pet swipes.
 */

export const recordPetSwipe = async (
  supabase,
  { swiperUserId, swiperPetId, targetPetId, targetUserId, direction }
) => {
  const { data, error } = await supabase
    .from('match_pet_swipes')
    .upsert(
      {
        swiper_user_id: swiperUserId,
        swiper_pet_id: swiperPetId,
        target_pet_id: targetPetId,
        target_user_id: targetUserId,
        direction,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'swiper_pet_id,target_pet_id' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data;
};

export const recordPetImpression = async (
  supabase,
  { swiperUserId, swiperPetId, targetPetId, targetUserId }
) => {
  const { data, error } = await supabase
    .from('match_pet_impressions')
    .upsert(
      {
        swiper_user_id: swiperUserId,
        swiper_pet_id: swiperPetId,
        target_pet_id: targetPetId,
        target_user_id: targetUserId,
        seen_at: new Date().toISOString(),
      },
      { onConflict: 'swiper_pet_id,target_pet_id' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data;
};

export const fetchExcludedTargetPetIds = async (
  supabase,
  swiperPetId,
  userId
) => {
  const cooldownIso = getCooldownIso();
  const excluded = new Set();

  const [swipesResult, impressionsResult, matchesResult] = await Promise.all([
    supabase
      .from('match_pet_swipes')
      .select('target_pet_id')
      .eq('swiper_pet_id', swiperPetId)
      .gte('created_at', cooldownIso),
    supabase
      .from('match_pet_impressions')
      .select('target_pet_id')
      .eq('swiper_pet_id', swiperPetId)
      .gte('seen_at', cooldownIso),
    supabase
      .from('pet_matches')
      .select('pet_a_id, pet_b_id')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`),
  ]);

  if (swipesResult.error) throw swipesResult.error;
  if (impressionsResult.error) throw impressionsResult.error;
  if (matchesResult.error) throw matchesResult.error;

  (swipesResult.data || []).forEach((row) => excluded.add(row.target_pet_id));
  (impressionsResult.data || []).forEach((row) =>
    excluded.add(row.target_pet_id)
  );

  (matchesResult.data || []).forEach((match) => {
    if (match.pet_a_id === swiperPetId) {
      excluded.add(match.pet_b_id);
    } else if (match.pet_b_id === swiperPetId) {
      excluded.add(match.pet_a_id);
    }
  });

  return Array.from(excluded);
};

export const checkIsMutualMatch = async (
  supabase,
  swiperPetId,
  targetPetId
) => {
  const { data, error } = await supabase
    .from('match_pet_swipes')
    .select('id')
    .eq('swiper_pet_id', targetPetId)
    .eq('target_pet_id', swiperPetId)
    .eq('direction', 'like')
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
};

export const fetchUserMatches = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('pet_matches')
    .select('id, user_a_id, user_b_id, pet_a_id, pet_b_id, created_at')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data?.length) return [];

  const petIds = [...new Set(data.flatMap((match) => [match.pet_a_id, match.pet_b_id]))];
  const otherUserIds = [
    ...new Set(
      data.map((match) =>
        match.user_a_id === userId ? match.user_b_id : match.user_a_id
      )
    ),
  ];

  const [petsResult, profilesResult] = await Promise.all([
    supabase
      .from('user_pets')
      .select('id, name, image_url, userId')
      .in('id', petIds),
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', otherUserIds),
  ]);

  if (petsResult.error) throw petsResult.error;
  if (profilesResult.error) throw profilesResult.error;

  const petMap = new Map((petsResult.data || []).map((pet) => [pet.id, pet]));
  const profileMap = new Map(
    (profilesResult.data || []).map((profile) => [profile.id, profile])
  );

  return data.map((match) => {
    const isUserA = match.user_a_id === userId;
    const myPet = petMap.get(isUserA ? match.pet_a_id : match.pet_b_id);
    const matchedPet = petMap.get(isUserA ? match.pet_b_id : match.pet_a_id);
    const otherUserId = isUserA ? match.user_b_id : match.user_a_id;

    return {
      matchId: match.id,
      otherUserId,
      myPetId: myPet?.id,
      matchedPetId: matchedPet?.id,
      myPetName: myPet?.name,
      matchedPetName: matchedPet?.name,
      matchedPetImage: matchedPet?.image_url,
      profile: profileMap.get(otherUserId),
      createdAt: match.created_at,
    };
  });
};
