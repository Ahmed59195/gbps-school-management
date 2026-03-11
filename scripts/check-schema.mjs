import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dewyxlgexxatgxonrsvg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRld3l4bGdleHhhdGd4b25yc3ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzcyNjgsImV4cCI6MjA4ODUxMzI2OH0.ug4Xn_5kOeYKQhWLrdWzegHOFqJUKWw0P0HBdDvZP-o'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  console.log('Checking table schemas...\n')

  // Try inserting minimal data to see what columns exist
  const tables = ['classes', 'subjects', 'terms', 'students', 'profiles', 'attendance', 'grades', 'homework', 'announcements', 'timetable_entries', 'teacher_classes']

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: exists`)
      if (data && data.length > 0) {
        console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`)
      }
    }
  }
}

checkSchema()
