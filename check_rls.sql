-- Zkontrolovat RLS status a politiky pro paro_records
SELECT 
  schemaname,
  tablename,
  rowsecurity AS "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'paro_records';

-- Zobrazit všechny politiky pro paro_records
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'paro_records';
