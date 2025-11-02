-- Migration: Realtime notifikace pro propojení web app a mobilní app
-- Umožňuje hygienistce poslat záznam do telefonu

-- 1. Vytvoření tabulky pro notifikace
CREATE TABLE IF NOT EXISTS record_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_id UUID NOT NULL REFERENCES paro_records(id) ON DELETE CASCADE,
  action VARCHAR(50) DEFAULT 'open_record',
  opened_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexy pro rychlé dotazy
  INDEX idx_user_notifications ON record_notifications(user_id, created_at DESC),
  INDEX idx_record_notifications ON record_notifications(record_id)
);

-- 2. RLS politiky (Row Level Security)
ALTER TABLE record_notifications ENABLE ROW LEVEL SECURITY;

-- Uživatel vidí jen své notifikace
CREATE POLICY "Users can view their own notifications"
  ON record_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Uživatel může vytvořit notifikaci pro sebe
CREATE POLICY "Users can create notifications for themselves"
  ON record_notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Uživatel může updatovat své notifikace (opened_at)
CREATE POLICY "Users can update their own notifications"
  ON record_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Uživatel může smazat své notifikace
CREATE POLICY "Users can delete their own notifications"
  ON record_notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Realtime publication (pro live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE record_notifications;

-- 4. Trigger pro automatické čištění starých notifikací (30 dní)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS trigger AS $$
BEGIN
  DELETE FROM record_notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_notifications
  AFTER INSERT ON record_notifications
  EXECUTE FUNCTION cleanup_old_notifications();

-- 5. Funkce pro označení notifikace jako přečtené
CREATE OR REPLACE FUNCTION mark_notification_as_opened(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE record_notifications
  SET opened_at = NOW()
  WHERE id = notification_id
    AND user_id = auth.uid()
    AND opened_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE record_notifications IS 'Realtime notifikace pro propojení web app a mobilní app';
COMMENT ON COLUMN record_notifications.action IS 'Typ akce: open_record, edit_record, view_record';
COMMENT ON COLUMN record_notifications.opened_at IS 'Timestamp kdy byla notifikace otevřena v mobilní app';

