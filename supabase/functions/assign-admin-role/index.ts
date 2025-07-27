import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

serve(async (req) => {
  try {
    const { email, role = 'admin' } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://cmcfeiskfdbsefzqywbk.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY2ZlaXNrZmRic2VmenF5d2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA5MDAzMiwiZXhwIjoyMDY3NjY2MDMyfQ.v1YFUEK7xRQrfzJVfWPo_q0CTqp5eAZhyPmw6CZKqpw'
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch users' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user = authUsers.users.find(u => u.email === email)
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update user role in auth.users metadata
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        user_metadata: { 
          ...user.user_metadata,
          role: role 
        }
      }
    )

    if (updateAuthError) {
      console.error('Error updating auth user:', updateAuthError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to update auth user role' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update or insert in public.users table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        role: role,
        created_at: user.created_at
      })

    if (upsertError) {
      console.error('Error upserting public user:', upsertError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to update public user role' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Successfully assigned ${role} role to ${email}`)

    return new Response(JSON.stringify({ 
      success: true,
      message: `Successfully assigned ${role} role to ${email}`,
      user: {
        id: user.id,
        email: user.email,
        role: role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server error',
      details: err.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})