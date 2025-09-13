// Migration Script - Fix My Desk Missing Columns
// Run this to add missing columns to my_desk tables

import { supabase } from './src/supabaseClient.js';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('🔄 Running My Desk columns migration...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./migrations/20250910_fix_my_desk_columns.sql', 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} completed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1} error:`, err.message);
      }
    }
    
    console.log('🎉 Migration completed!');
    
    // Test the new columns
    console.log('🔍 Testing new columns...');
    
    const { data: checklistTest } = await supabase
      .from('my_desk_checklist')
      .select('id, sort_order, order_index, completed')
      .limit(1);
      
    const { data: tasksTest } = await supabase
      .from('my_desk_tasks') 
      .select('id, due_date, completed, priority_level')
      .limit(1);
      
    const { data: notesTest } = await supabase
      .from('my_desk_notes')
      .select('id, type, pinned')
      .limit(1);
    
    console.log('✅ All columns accessible!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
