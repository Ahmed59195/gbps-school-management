import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Announcement, AnnouncementWithCreator } from '../lib/types'

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          created_by_profile:profiles(id, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as AnnouncementWithCreator[]
    },
  })
}

export function useAnnouncement(announcementId: string | undefined) {
  return useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: async () => {
      if (!announcementId) return null

      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          created_by_profile:profiles(id, full_name)
        `)
        .eq('id', announcementId)
        .single()

      if (error) throw error
      return data as AnnouncementWithCreator
    },
    enabled: !!announcementId,
  })
}

interface CreateAnnouncementData {
  title: string
  content: string
  target_role: 'headmaster' | 'teacher' | 'parent' | 'all'
  target_class_id?: string | null
  created_by: string
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAnnouncementData) => {
      const { data: announcement, error } = await supabase
        .from('announcements')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return announcement as Announcement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}

interface UpdateAnnouncementData {
  id: string
  title?: string
  content?: string
  target_role?: 'headmaster' | 'teacher' | 'parent' | 'all'
  target_class_id?: string | null
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateAnnouncementData) => {
      const { data: announcement, error } = await supabase
        .from('announcements')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return announcement as Announcement
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcement', variables.id] })
    },
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}

// Get announcements visible to a specific role (for dashboard widgets)
export function useAnnouncementsForRole(role: string | undefined) {
  return useQuery({
    queryKey: ['announcements', 'for-role', role],
    queryFn: async () => {
      if (!role) return []

      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          created_by_profile:profiles(id, full_name)
        `)
        .or(`target_role.eq.all,target_role.eq.${role}`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data as AnnouncementWithCreator[]
    },
    enabled: !!role,
  })
}
