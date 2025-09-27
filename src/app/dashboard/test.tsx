'use client'

import { useAuth } from '@/contexts/auth-context'

export default function TestPage() {
  const { user, profile, loading } = useAuth()
  
  console.log('Test page render:', { user: !!user, profile: !!profile, loading })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2">Auth Status:</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user ? 'Authenticated' : 'Not authenticated'}</p>
          <p>Profile: {profile ? 'Loaded' : 'Not loaded'}</p>
        </div>
        
        {profile && (
          <div className="p-4 bg-green-50 rounded shadow">
            <h2 className="font-semibold mb-2">Profile Info:</h2>
            <p>Name: {profile.full_name}</p>
            <p>Email: {profile.email}</p>
            <p>Role: {profile.role}</p>
            <p>Institution ID: {profile.institution_id}</p>
          </div>
        )}
        
        {user && (
          <div className="p-4 bg-blue-50 rounded shadow">
            <h2 className="font-semibold mb-2">User Info:</h2>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Email Verified: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
