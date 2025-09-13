import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// This script runs migrations by reading SQL files and executing them
// Run with: node run-migration-simple.js

async function runMigration() {
  // Note: You'll need to set these values manually or via environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role for schema changes
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables:')
    console.error('- VITE_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nPlease set these in your environment or .env file')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '20250911_roles_at_risk_table_refactor.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('Executing migration: 20250911_roles_at_risk_table_refactor.sql')
    console.log('Migration content preview:')
    console.log(migrationSQL.substring(0, 200) + '...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: migrationSQL 
    })
    
    if (error) {
      console.error('Migration failed:', error)
      return
    }
    
    console.log('Migration executed successfully!')
    console.log('Result:', data)
    
  } catch (err) {
    console.error('Error running migration:', err.message)
  }
}

runMigration()
