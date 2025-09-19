import { useState, useEffect } from 'react'
import { dashboardService } from '@/services/dashboardService'
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
    const loadData = async () => {
      try {
        setLoading(true)
        try {
          const { stats } = await dashboardService.getStats();
          setMessagesSent(stats.messages_sent_today);
        } catch (error) {
          console.error('Erro ao carregar estatísticas:', error);
          // Usar valores padrão se o endpoint falhar
          setMessagesSent(0);
        }
        
        // Mapear plano
        const map: Record<number,string> = {1:'Gratuito',2:'Profissional',3:'Avançado'};
        const limits: Record<number,number> = {1:10,2:100,3:1000};
        const pid = user?.plan_id ?? 1;
        setPlan({ id: String(pid), name: map[pid] ?? 'Gratuito', message_limit: limits[pid] ?? 10 });
      } finally {
        setLoading(false);
      }
    };
    if(user) loadData();
  }, [user])

  // Formatar o nome do usuário (usar o nome completo)
  const formatName = (name?: string|null) => {
    if (!name) return 'Usuário';
    return name;
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              Olá, {formatName((user as any)?.full_name || user?.name || user?.email)}!
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
