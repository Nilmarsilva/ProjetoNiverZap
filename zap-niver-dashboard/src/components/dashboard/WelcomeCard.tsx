import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { useAuthStore } from '@/stores/authStore'

interface Plan {
  id: string
  name: string
  message_limit: number
}

/**
 * Componente de boas-vindas para o dashboard
 * 
 * Exibe informações relevantes para o usuário, como:
 * - Nome do usuário
 * - Plano atual
 * - Limite de mensagens
 * - Mensagens enviadas no mês atual
 */
export function WelcomeCard() {
  const user = useAuthStore((state) => state.user)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [messagesSent, setMessagesSent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular um pequeno delay para dar a impressão de carregamento
    const timeout = setTimeout(() => {
      // Dados mockados para o plano do usuário
      setPlan({
        id: 'plan-premium',
        name: 'Premium',
        message_limit: 1000
      })
      
      // Dados mockados para mensagens enviadas
      setMessagesSent(350)
      
      // Finalizar o carregamento
      setLoading(false)
    }, 500)
    
    // Limpar o timeout quando o componente for desmontado
    return () => clearTimeout(timeout)
  }, [user])

  // Formatar o nome do usuário (usar o nome completo)
  const formatName = (name: string) => {
    if (!name) return 'Usuário'
    return name
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Olá, {formatName(user?.name)}!
            </CardTitle>
            <CardDescription>
              Bem-vindo ao seu dashboard do DataZAP
            </CardDescription>
          </div>
          <Logo size="lg" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="text-sm font-medium text-muted-foreground">Seu Plano</div>
            <div className="mt-1 text-2xl font-bold">
              {loading ? '...' : plan?.name || 'Sem plano'}
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="text-sm font-medium text-muted-foreground">Mensagens Enviadas</div>
            <div className="mt-1 text-2xl font-bold">
              {loading ? '...' : `${messagesSent} / ${plan?.message_limit || 0}`}
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <div className="text-sm font-medium text-muted-foreground">Status da Conta</div>
            <div className="mt-1 text-2xl font-bold">
              {loading ? '...' : 'Ativa'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
