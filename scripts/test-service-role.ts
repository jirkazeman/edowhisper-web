import { createClient } from '@supabase/supabase-js';

// Use service_role key
const supabaseAdmin = createClient(
  'https://pdnishbanhiwjnpphfvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmlzaGJhbmhpd2pucHBoZnZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMzNzkzNSwiZXhwIjoyMDc2OTEzOTM1fQ.UKp3iKR_lBbC9xMIWupiT3fihtLv4DzPReDhrXOEGNU',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function testServiceRole() {
  console.log('🔑 Testing Service Role Key access...\n');

  // Get ALL records (bypassing RLS)
  const { data, error, count } = await supabaseAdmin
    .from('paro_records')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Total records in DB: ${count}`);
  console.log(`✅ Retrieved: ${data?.length} records`);

  const deleted = data?.filter(r => r.deleted === true || r.deleted === 'true').length || 0;
  const active = data?.filter(r => r.deleted === false || r.deleted === 'false').length || 0;

  console.log(`\n📊 Breakdown:`);
  console.log(`   Active (deleted=false): ${active}`);
  console.log(`   Deleted (deleted=true): ${deleted}`);

  console.log(`\n📋 Sample active records:`);
  data?.filter(r => r.deleted === false).slice(0, 5).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.form_data?.lastName || 'N/A'} - ${r.form_data?.personalIdNumber || 'N/A'}`);
  });
}

testServiceRole();
