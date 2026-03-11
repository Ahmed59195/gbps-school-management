import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dewyxlgexxatgxonrsvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3l4bGdleHhhdGd4b25yc3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzcyNjgsImV4cCI6MjA4ODUxMzI2OH0.ug4Xn_5kOeYKQhWLrdWzegHOFqJUKWw0P0HBdDvZP-o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function seedStudents() {
  console.log('🎓 Seeding students...\n')

  // Login as headmaster to bypass RLS
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'headmaster@gbps.edu',
    password: 'Test123!'
  })

  if (authError) {
    console.log('❌ Login failed:', authError.message)
    return
  }
  console.log('✅ Logged in as headmaster')

  // Get class IDs
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id, name')
    .order('name')

  if (classError || !classes?.length) {
    console.log('❌ Failed to get classes:', classError?.message)
    return
  }

  console.log(`\n📚 Found ${classes.length} classes`)
  const classMap = {}
  classes.forEach(c => {
    classMap[c.name] = c.id
    console.log(`   ${c.name}: ${c.id}`)
  })

  // Sample students data
  const students = [
    // Grade 1
    { name: 'Ahmed Khan', class_id: classMap['Grade 1'], date_of_birth: '2019-03-15', gender: 'male' },
    { name: 'Fatima Bibi', class_id: classMap['Grade 1'], date_of_birth: '2019-06-22', gender: 'female' },
    { name: 'Muhammad Ali', class_id: classMap['Grade 1'], date_of_birth: '2019-01-10', gender: 'male' },
    { name: 'Ayesha Siddiqui', class_id: classMap['Grade 1'], date_of_birth: '2019-08-05', gender: 'female' },
    // Grade 2
    { name: 'Bilal Ahmed', class_id: classMap['Grade 2'], date_of_birth: '2018-12-20', gender: 'male' },
    { name: 'Zainab Malik', class_id: classMap['Grade 2'], date_of_birth: '2018-09-14', gender: 'female' },
    { name: 'Hassan Raza', class_id: classMap['Grade 2'], date_of_birth: '2018-04-08', gender: 'male' },
    { name: 'Maryam Noor', class_id: classMap['Grade 2'], date_of_birth: '2018-07-30', gender: 'female' },
    // Grade 3
    { name: 'Usman Tariq', class_id: classMap['Grade 3'], date_of_birth: '2017-05-12', gender: 'male' },
    { name: 'Sara Khan', class_id: classMap['Grade 3'], date_of_birth: '2017-11-25', gender: 'female' },
    { name: 'Ibrahim Shah', class_id: classMap['Grade 3'], date_of_birth: '2017-02-18', gender: 'male' },
    { name: 'Hira Farooq', class_id: classMap['Grade 3'], date_of_birth: '2017-09-03', gender: 'female' },
    // Grade 4
    { name: 'Hamza Iqbal', class_id: classMap['Grade 4'], date_of_birth: '2016-06-28', gender: 'male' },
    { name: 'Amina Yousaf', class_id: classMap['Grade 4'], date_of_birth: '2016-03-17', gender: 'female' },
    { name: 'Zaid Hussain', class_id: classMap['Grade 4'], date_of_birth: '2016-10-09', gender: 'male' },
    { name: 'Khadija Abbas', class_id: classMap['Grade 4'], date_of_birth: '2016-01-22', gender: 'female' },
    // Grade 5
    { name: 'Saad Rehman', class_id: classMap['Grade 5'], date_of_birth: '2015-08-14', gender: 'male' },
    { name: 'Nadia Ashraf', class_id: classMap['Grade 5'], date_of_birth: '2015-04-05', gender: 'female' },
    { name: 'Fahad Nawaz', class_id: classMap['Grade 5'], date_of_birth: '2015-12-31', gender: 'male' },
    { name: 'Sana Malik', class_id: classMap['Grade 5'], date_of_birth: '2015-07-19', gender: 'female' },
  ]

  console.log(`\n👨‍🎓 Inserting ${students.length} students...`)

  const { data: insertedStudents, error: insertError } = await supabase
    .from('students')
    .insert(students)
    .select()

  if (insertError) {
    console.log('❌ Insert failed:', insertError.message)
  } else {
    console.log(`✅ Successfully inserted ${insertedStudents.length} students!`)
  }

  // Verify
  const { data: allStudents } = await supabase
    .from('students')
    .select('name, class_id')

  console.log(`\n📊 Total students in database: ${allStudents?.length || 0}`)

  await supabase.auth.signOut()
}

seedStudents()
