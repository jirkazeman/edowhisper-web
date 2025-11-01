import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pdnishbanhiwjnpphfvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmlzaGJhbmhpd2pucHBoZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzc5MzUsImV4cCI6MjA3NjkxMzkzNX0.z4JecCJ2y8zJtH0nRoTw_JmfLITrQ6MNFxOAicsaTKA'
);

async function checkDeleted() {
  const { data: all } = await supabase.from('paro_records').select('id, deleted, form_data');

  console.log('📊 Database status:\n');
  console.log('Total records:', all?.length);
  console.log('Deleted (deleted=true):', all?.filter((r: any) => r.deleted === true).length);
  console.log('Active (deleted=false):', all?.filter((r: any) => r.deleted === false).length);
  console.log('Deleted (string "true"):', all?.filter((r: any) => r.deleted === 'true').length);

  console.log('\n✅ Active records (deleted=false):');
  all?.filter((r: any) => r.deleted === false).forEach((r: any) => {
    console.log(`   - ${r.form_data?.lastName || 'N/A'}`);
  });
}

checkDeleted();
