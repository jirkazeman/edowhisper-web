// List all tables in Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pdnishbanhiwjnpphfvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmlzaGJhbmhpd2pucHBoZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzc5MzUsImV4cCI6MjA3NjkxMzkzNX0.z4JecCJ2y8zJtH0nRoTw_JmfLITrQ6MNFxOAicsaTKA'
);

async function listTables() {
  console.log('🔍 Listing all accessible tables in Supabase...\n');

  // Try to query information_schema (might not work with anon key)
  const { data, error } = await supabase.rpc('get_schema_info');

  if (error) {
    console.log('⚠️  Cannot access schema info with anon key');
    console.log('   Trying individual tables...\n');

    // Try common tables one by one
    const tablesToTry = [
      'paro_records',
      'llm_feedback',
      'ai_roles',
      'users',
      'profiles',
      'records',
      'feedback'
    ];

    for (const table of tablesToTry) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Not found or no access`);
      } else {
        console.log(`✅ ${table}: ${count} rows`);
      }
    }
  } else {
    console.log('Tables found:', data);
  }
}

listTables().catch(console.error);
