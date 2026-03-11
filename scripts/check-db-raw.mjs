import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dewyxlgexxatgxonrsvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3l4bGdleHhhdGd4b25yc3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzcyNjgsImV4cCI6MjA4ODUxMzI2OH0.ug4Xn_5kOeYKQhWLrdWzegHOFqJUKWw0P0HBdDvZP-o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabase() {
  console.log('Checking with raw RPC call...\n')

  // Try using RPC to bypass RLS for debugging
  const { data, error } = await supabase.rpc('get_user_role')

  if (error) {
    console.log('RPC error (expected if not logged in):', error.message)
  } else {
    console.log('User role:', data)
  }

  // Check if we can at least see the table structure
  const { data: classData, error: classError, count } = await supabase
    .from('classes')
    .select('*', { count: 'exact' })

  console.log('\nClasses query result:')
  console.log('  Data:', classData)
  console.log('  Error:', classError?.message || 'none')
  console.log('  Count:', count)

  // Check subjects (should be readable by all per RLS)
  const { data: subjectData, error: subjectError } = await supabase
    .from('subjects')
    .select('*')

  console.log('\nSubjects query result:')
  console.log('  Data:', subjectData)
  console.log('  Error:', subjectError?.message || 'none')
}

checkDatabase()
