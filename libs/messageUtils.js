export const isMessageVisibleForUser = (msg, userId) => {
  if (!msg || !userId) return false;
  if (msg.sender_id === userId && msg.deleted_for_sender) return false;
  if (msg.receiver_id === userId && msg.deleted_for_receiver) return false;
  return true;
};

export const filterMessagesForUser = (messages, userId) =>
  (messages || []).filter((msg) => isMessageVisibleForUser(msg, userId));

export const softDeleteConversationForUser = async (
  supabase,
  userId,
  otherUserId
) => {
  const { error: senderError } = await supabase
    .from('messages')
    .update({ deleted_for_sender: true })
    .eq('sender_id', userId)
    .eq('receiver_id', otherUserId);

  if (senderError) throw senderError;

  const { error: receiverError } = await supabase
    .from('messages')
    .update({ deleted_for_receiver: true })
    .eq('receiver_id', userId)
    .eq('sender_id', otherUserId);

  if (receiverError) throw receiverError;
};

export const softDeleteMessageForUser = async (supabase, message, userId) => {
  const updates =
    message.sender_id === userId
      ? { deleted_for_sender: true }
      : { deleted_for_receiver: true };

  const { error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', message.id);

  if (error) throw error;
};

export const deleteMessageForEveryone = async (supabase, messageId) => {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
};

export const fetchMessagesWithReplies = async (
  supabase,
  userId,
  otherUserId
) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, reply_to:reply_to_id(id, content, sender_id)')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: true });

  if (error) throw error;

  return filterMessagesForUser(data, userId);
};
