import { useState } from 'react'

interface EmailConfirmationResponse {
  success: boolean
  message?: string
  emailId?: string
  error?: string
  details?: string
}

interface UseEmailConfirmationReturn {
  sendConfirmationEmail: (email: string, name?: string) => Promise<EmailConfirmationResponse>
  isLoading: boolean
  error: string | null
  success: boolean
}

export const useEmailConfirmation = (): UseEmailConfirmationReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const sendConfirmationEmail = async (
    email: string, 
    name?: string
  ): Promise<EmailConfirmationResponse> => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(
        'https://cmcfeiskfdbsefzqywbk.functions.supabase.co/send-confirmation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, name }),
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess(true)
        return {
          success: true,
          message: result.message,
          emailId: result.emailId,
        }
      } else {
        const errorMessage = result.error || 'Failed to send confirmation email'
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage,
          details: result.details,
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendConfirmationEmail,
    isLoading,
    error,
    success,
  }
}

// Usage example:
/*
import { useEmailConfirmation } from './hooks/useEmailConfirmation'

const SignupComponent = () => {
  const { sendConfirmationEmail, isLoading, error, success } = useEmailConfirmation()

  const handleSignup = async (email: string, name: string) => {
    // Your signup logic here...
    
    // Send confirmation email
    const result = await sendConfirmationEmail(email, name)
    
    if (result.success) {
      console.log('Confirmation email sent!', result.emailId)
    } else {
      console.error('Failed to send email:', result.error)
    }
  }

  return (
    <div>
      {isLoading && <p>Sending confirmation email...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {success && <p style={{ color: 'green' }}>Confirmation email sent successfully!</p>}
      
      <button onClick={() => handleSignup('user@example.com', 'John Doe')}>
        Sign Up
      </button>
    </div>
  )
}
*/