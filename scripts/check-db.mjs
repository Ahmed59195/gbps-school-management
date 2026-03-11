import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dewyxlgexxatgxonrsvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3l4bGdleHhhdGd4b25yc3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzcyNjgsImV4cCI6MjA4ODUxMzI2OH0.ug4Xn_5kOeYKQhWLrdWzegHOFqJUKWw0P0HBdDvZP-o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkDatabase() {
  console.log('Checking Supabase connection and data...\n')

  // Check classes
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .select('*')

  if (classesError) {
    console.log('❌ Classes table error:', classesError.message)
  } else {
    console.log(`✅ Classes: ${classes?.length || 0} records`)
    classes?.forEach(c => console.log(`   - ${c.name}`))
  }

  // Check subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*')

  if (subjectsError) {
    console.log('❌ Subjects table error:', subjectsError.message)
  } else {
    console.log(`✅ Subjects: ${subjects?.length || 0} records`)
  }

  // Check terms
  const { data: terms, error: termsError } = await supabase
    .from('terms')
    .select('*')

  if (termsError) {
    console.log('❌ Terms table error:', termsError.message)
  } else {
    console.log(`✅ Terms: ${terms?.length || 0} records`)
  }

  // Check students
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')

  if (studentsError) {
    console.log('❌ Students table error:', studentsError.message)
  } else {
    console.log(`✅ Students: ${students?.length || 0} records`)
  }

  // Check profiles (will likely fail without auth, but let's try)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  if (profilesError) {
    console.log('⚠️  Profiles: RLS blocked (expected without auth)')
  } else {
    console.log(`✅ Profiles: ${profiles?.length || 0} records`)
  }

  console.log('\n--- Connection test complete ---')
}

checkDatabase()
