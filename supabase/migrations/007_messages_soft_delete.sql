-- Soft-delete columns for per-user message visibility
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS deleted_for_sender boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_for_receiver boolean NOT NULL DEFAULT false;

-- Sender can update own messages (soft-delete for sender)
CREATE POLICY "Gönderen kendi mesajını güncelleyebilir"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Sender can hard-delete own messages (delete for everyone)
CREATE POLICY "Gönderen kendi mesajını silebilir"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = sender_id);
