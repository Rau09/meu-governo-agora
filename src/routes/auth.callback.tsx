import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession()
      if (error) {
        console.error('Auth callback error:', error)
      }
      // Redirecionar para home; o estado do useCidadao cuidará do resto
      navigate({ to: '/' })
    }

    handleAuth()
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-sm font-medium text-muted-foreground tracking-tight">Finalizando acesso...</p>
    </div>
  )
}
