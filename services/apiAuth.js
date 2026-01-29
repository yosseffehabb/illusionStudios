// services/ApiAuth.js
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

// ============================================
// CLIENT-SIDE FUNCTIONS (for React components)
// ============================================

export async function getUser() {
  const supabase = createBrowserClient()
  
  // Get session to avoid 403 errors
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) throw sessionError
  if (!session) return null
  
  const user = session.user
  
  // Check if user exists in admin_users table
  if (user) {
    try {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('email, full_name')
        .eq('id', user.id)
        .maybeSingle() // Use maybeSingle instead of single to avoid error if not found
      
      // If user is in admin_users table, they're an admin
      return { 
        ...user, 
        is_admin: !!adminUser, // true if exists, false if not
        full_name: adminUser?.full_name
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return { ...user, is_admin: false }
    }
  }
  
  return null
}

export async function login(email, password) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export async function logout() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) throw error
}

// ============================================
// SERVER-SIDE FUNCTIONS (for Server Components)
// ============================================

export async function getUserServer() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) throw error
  if (!user) return null
  
  // Check if user exists in admin_users table
  try {
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name')
      .eq('id', user.id)
      .maybeSingle()
    
    return { 
      ...user, 
      is_admin: !!adminUser, // true if exists in admin_users table
      profile: adminUser
    }
  } catch (error) {
    console.error('Error checking admin status:', error)
    return { ...user, is_admin: false }
  }
}

export async function checkIsAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  try {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
    
    return !!adminUser // true if user exists in admin_users table
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}