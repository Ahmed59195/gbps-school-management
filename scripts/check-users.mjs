import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dewyxlgexxatgxonrsvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3l4bGdleHhhdGd4b25yc3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzcyNjgsImV4cCI6MjA4ODUxMzI2OH0.ug4Xn_5kOeYKQhWLrdWzegHOFqJUKWw0P0HBdDvZP-o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('Testing login with headmaster@gbps.edu...\n')

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'headmaster@gbps.edu',
    password: 'Test123!'
  })

  if (error) {
    console.log('❌ Login failed:', error.message)
    return
  }

  console.log('✅ Login successful!')
  console.log('   User ID:', data.user.id)
  console.log('   Email:', data.user.email)
  console.log('   Metadata:', data.user.user_metadata)

  // Now check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.log('\n⚠️  Profile not found:', profileError.message)
    console.log('   The auth trigger may not have created a profile.')
  } else {
    console.log('\n✅ Profile found:')
    console.log('   Role:', profile.role)
    console.log('   Name:', profile.full_name)
  }

  // Sign out
  await supabase.auth.signOut()
}

testLogin()
