import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dewyxlgexxatgxonrsvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3l4bGdleHhhdGd4b25yc3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzcyNjgsImV4cCI6MjA4ODUxMzI2OH0.ug4Xn_5kOeYKQhWLrdWzegHOFqJUKWw0P0HBdDvZP-o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedDatabase() {
  console.log('🌱 Seeding GBPS D-1 Area School Management Database...\n')

  // 1. Seed Classes (Grade 1-5)
  console.log('📚 Seeding classes...')
  const { data: classes, error: classesError } = await supabase
    .from('classes')
    .upsert([
      { name: 'Grade 1' },
      { name: 'Grade 2' },
      { name: 'Grade 3' },
      { name: 'Grade 4' },
      { name: 'Grade 5' },
    ], { onConflict: 'name' })
    .select()

  if (classesError) {
    console.log('❌ Classes error:', classesError.message)
    return
  }
  console.log(`   ✅ ${classes.length} classes created`)

  // 2. Seed Subjects
  console.log('📖 Seeding subjects...')
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .upsert([
      { name: 'English', display_order: 1 },
      { name: 'Urdu', display_order: 2 },
      { name: 'Math', display_order: 3 },
      { name: 'Science', display_order: 4 },
      { name: 'Social Studies', display_order: 5 },
      { name: 'Islamiat', display_order: 6 },
    ], { onConflict: 'name' })
    .select()

  if (subjectsError) {
    console.log('❌ Subjects error:', subjectsError.message)
    return
  }
  console.log(`   ✅ ${subjects.length} subjects created`)

  // 3. Seed Terms
  console.log('📅 Seeding terms...')
  const { data: terms, error: termsError } = await supabase
    .from('terms')
    .upsert([
      { name: 'First Term', academic_year: '2026', display_order: 1, start_date: '2026-01-15', end_date: '2026-04-15' },
      { name: 'Second Term', academic_year: '2026', display_order: 2, start_date: '2026-04-20', end_date: '2026-07-20' },
      { name: 'Third Term', academic_year: '2026', display_order: 3, start_date: '2026-08-01', end_date: '2026-11-30' },
    ], { onConflict: 'name' })
    .select()

  if (termsError) {
    console.log('❌ Terms error:', termsError.message)
    return
  }
  console.log(`   ✅ ${terms.length} terms created`)

  console.log('\n✅ Reference data seeded successfully!')
  console.log('\n--- Summary ---')
  console.log(`Classes: ${classes.length}`)
  console.log(`Subjects: ${subjects.length}`)
  console.log(`Terms: ${terms.length}`)

  // Store class IDs for later use
  console.log('\n📋 Class IDs for reference:')
  classes.forEach(c => console.log(`   ${c.name}: ${c.id}`))

  return { classes, subjects, terms }
}

seedDatabase()
