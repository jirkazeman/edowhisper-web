// Test loading real data
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pdnishbanhiwjnpphfvl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbmlzaGJhbmhpd2pucHBoZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzc5MzUsImV4cCI6MjA3NjkxMzkzNX0.z4JecCJ2y8zJtH0nRoTw_JmfLITrQ6MNFxOAicsaTKA'
);

async function testRealData() {
  console.log('🧪 Testing real data loading...\n');

  // Get records (exclude deleted)
  const { data: records, error } = await supabase
    .from('paro_records')
    .select('*')
    .eq('deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error loading records:', error);
    return;
  }

  console.log(`✅ Loaded ${records.length} active records (non-deleted)`);

  // Show first 3
  console.log('\n📋 Sample records:\n');
  records.slice(0, 3).forEach((record, i) => {
    console.log(`${i + 1}. ${record.form_data?.lastName || 'Bez jména'}`);
    console.log(`   ID: ${record.form_data?.personalIdNumber || 'N/A'}`);
    console.log(`   Kuřák: ${record.form_data?.isSmoker || 'neznámo'}`);
    console.log(`   Vytvořeno: ${new Date(record.created_at).toLocaleDateString('cs-CZ')}`);
    console.log('');
  });

  console.log(`\n🎉 Web aplikace nyní načte ${records.length} skutečných záznamů!`);
}

testRealData().catch(console.error);
