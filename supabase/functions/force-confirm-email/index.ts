import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

serve(async (req) => {
  try {
    const { email } = await req.json()

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

    // Get user by email
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to fetch users' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Force confirm the user's email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true
      }
    )

    if (updateError) {
      console.error('Error confirming email:', updateError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to confirm email' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log(`Successfully confirmed email for ${email}`)

    return new Response(JSON.stringify({ 
      success: true,
      message: `Email confirmed for ${email}`,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: new Date().toISOString()
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