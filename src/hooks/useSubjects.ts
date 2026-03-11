import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Subject } from '../lib/types'

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Subject[]
    },
  })
}
