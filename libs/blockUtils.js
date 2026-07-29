export const blockUser = async (supabase, blockerId, blockedId) => {
  const { error } = await supabase.from('blocked_users').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  });

  if (error) throw error;
};

export const unblockUser = async (supabase, blockerId, blockedId) => {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) throw error;
};

export const getBlockedUserIds = async (supabase, userId) => {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('blocked_id')
    .eq('blocker_id', userId);

  if (error) throw error;

  return (data || []).map((row) => row.blocked_id);
};

export const isUserBlocked = async (supabase, userId, otherUserId) => {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .or(
      `and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`
    )
    .limit(1);

  if (error) throw error;

  return (data || []).length > 0;
};

export const isBlockedByMe = async (supabase, userId, otherUserId) => {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('blocker_id', userId)
    .eq('blocked_id', otherUserId)
    .limit(1);

  if (error) throw error;

  return (data || []).length > 0;
};
