// hooks/useAuth.js
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
// ❌ OLD (Wrong):
// import { getUser, login as loginApi, logout as logoutApi } from './services/apiAuth'

// ✅ NEW (Correct):
import { getUser, login as loginApi, logout as logoutApi } from '../services/apiAuth'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Query for current user
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: () => {
        toast.success("loged in successfully")
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      router.push('/admin')
      router.refresh()
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
        toast.success("loged out successfully")
      queryClient.setQueryData(['auth', 'user'], null)
      queryClient.clear()
      router.push('/login')
      router.refresh()
    },
  })

  // Listen to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      }
      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(['auth', 'user'], null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, queryClient])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    refetch,
  }
}
