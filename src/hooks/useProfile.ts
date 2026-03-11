import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!userId,
  })
}

export function useProfiles(role?: string) {
  return useQuery({
    queryKey: ['profiles', role],
    queryFn: async () => {
      let query = supabase.from('profiles').select('*')

      if (role) {
        query = query.eq('role', role)
      }

      const { data, error } = await query.order('full_name')

      if (error) throw error
      return data as Profile[]
    },
  })
}

export function useParents() {
  return useProfiles('parent')
}

export function useTeachers() {
  return useProfiles('teacher')
}
