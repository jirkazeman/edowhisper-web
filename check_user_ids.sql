-- Zkontrolovat user_id v paro_records
SELECT 
  user_id,
  COUNT(*) as "Počet záznamů",
  MAX(created_at) as "Poslední záznam",
  STRING_AGG(DISTINCT 
    COALESCE(form_data->>'lastName', 'Bez příjmení'), 
    ', ' 
    ORDER BY COALESCE(form_data->>'lastName', 'Bez příjmení')
  ) as "Příjmení pacientů"
FROM paro_records
WHERE deleted = false
GROUP BY user_id
ORDER BY COUNT(*) DESC;

-- Zjistit aktuálně přihlášeného uživatele
SELECT 
  auth.uid() as "Tvůj user_id",
  auth.email() as "Tvůj email";
