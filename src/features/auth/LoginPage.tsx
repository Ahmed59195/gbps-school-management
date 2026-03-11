import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoginForm } from '../../components/forms/LoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import type { LoginFormData } from './schemas'

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(data.email, data.password)
      // After successful sign-in, navigate to the intended page
      // The profile will be loaded by AuthContext
      navigate(from, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid email or password'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // If already logged in, redirect based on role
  if (profile) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* School branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GBPS D-1 Area</h1>
          <p className="text-gray-600 mt-1">School Management System</p>
        </div>

        {/* Login card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Contact the school administration if you need access.
        </p>
      </div>
    </div>
  )
}
