// Quick script to check what's in the database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pdnishbanhiwjnpphfvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmlzaGJhbmhpd2pucHBoZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzc5MzUsImV4cCI6MjA3NjkxMzkzNX0.z4JecCJ2y8zJtH0nRoTw_JmfLITrQ6MNFxOAicsaTKA'
);

async function checkDatabase() {
  console.log('🔍 Checking Supabase database...\n');

  // Check paro_records
  const { data: records, error: recordsError, count: recordsCount } = await supabase
    .from('paro_records')
    .select('*', { count: 'exact', head: false })
    .limit(5);

  console.log('📋 paro_records:');
  console.log(`   Total: ${recordsCount} records`);
  if (recordsError) {
    console.log(`   ❌ Error: ${recordsError.message}`);
  } else {
    console.log(`   ✅ Sample data:`, records?.slice(0, 2));
  }

  // Check ai_roles
  const { data: roles, error: rolesError, count: rolesCount } = await supabase
    .from('ai_roles')
    .select('*', { count: 'exact', head: false })
    .limit(5);

  console.log('\n🤖 ai_roles:');
  console.log(`   Total: ${rolesCount} roles`);
  if (rolesError) {
    console.log(`   ❌ Error: ${rolesError.message}`);
  } else {
    console.log(`   ✅ Sample data:`, roles?.slice(0, 2));
  }

  // Check llm_feedback
  const { data: feedback, error: feedbackError, count: feedbackCount } = await supabase
    .from('llm_feedback')
    .select('*', { count: 'exact', head: false })
    .limit(5);

  console.log('\n💬 llm_feedback:');
  console.log(`   Total: ${feedbackCount} feedback items`);
  if (feedbackError) {
    console.log(`   ❌ Error: ${feedbackError.message}`);
  } else {
    console.log(`   ✅ Sample data:`, feedback?.slice(0, 2));
  }

  // Check auth users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

  console.log('\n👥 auth.users:');
  if (usersError) {
    console.log(`   ⚠️  Cannot access (need service role key)`);
  } else {
    console.log(`   Total: ${users?.length} users`);
  }
}

checkDatabase().catch(console.error);
