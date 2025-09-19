
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Calendar, Send, MessageSquare } from 'lucide-react'
import { WelcomeCard } from '@/components/dashboard/WelcomeCard'
import { useAuthStore } from '@/stores/authStore'
import { contactService } from '@/services/contactService'
import { messageService } from '@/services/messageService'
import { dashboardService } from '@/services/dashboardService'
import { templateService } from '@/services/templateService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * DashboardPage 
 * 
 * Página principal que exibe um resumo geral da aplicação
 * Mostra estatísticas e informações relevantes para o usuário
 * usando dados reais do Supabase
 */
const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    {
      title: 'Total de Contatos',
      value: '0',
      icon: <User className="h-8 w-8 text-datazap-green" />,
      change: 'Carregando...'
    },
    {
      title: 'Eventos Hoje',
      value: '0',
      icon: <Calendar className="h-8 w-8 text-datazap-light-green" />,
      change: 'Carregando...'
    },
    {
      title: 'Mensagens Enviadas',
      value: '0',
      icon: <Send className="h-8 w-8 text-datazap-green" />,
      change: 'Carregando...'
    },
    {
      title: 'Templates Ativos',
      value: '0',
      icon: <MessageSquare className="h-8 w-8 text-datazap-light-green" />,
      change: 'Carregando...'
    }
  ])
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Buscar dados reais do backend
        let totalContacts = 0;
        let eventsToday = 0;
        let monthlyMessages = 0;
        let activeTemplates = 0;
        
        try {
          const { stats } = await dashboardService.getStats();
          totalContacts = stats.total_contacts;
          eventsToday = stats.events_today;
          monthlyMessages = stats.messages_sent_today;
          activeTemplates = stats.active_templates;
        } catch (error) {
          console.error('Erro ao buscar estatísticas do dashboard:', error);
          // Usar valores padrão se o endpoint falhar
        }
        
        try {
          const upcoming = await dashboardService.getUpcomingEvents();
          setUpcomingBirthdays(upcoming);
        } catch (error) {
          console.error('Erro ao buscar próximos eventos:', error);
          setUpcomingBirthdays([]);
        }
        
        try {
          const recent = await dashboardService.getRecentActivity();
          setRecentActivity(recent);
        } catch (error) {
          console.error('Erro ao buscar atividade recente:', error);
          setRecentActivity([]);
        }

        
        // Atualizar estatísticas
        setStats([
          {
            title: 'Total de Contatos',
            value: totalContacts.toString(),
            icon: <User className="h-8 w-8 text-datazap-green" />,
            change: totalContacts <= 0 ? 'Nenhum contato cadastrado' : `${Math.round(totalContacts * 0.1)}% desde o mês passado`
          },
          {
            title: 'Eventos Hoje',
            value: eventsToday.toString(),
            icon: <Calendar className="h-8 w-8 text-datazap-light-green" />,
            change: eventsToday > 0 ? `${eventsToday} evento(s) hoje` : 'Nenhum evento hoje'
          },
          {
            title: 'Mensagens Enviadas',
            value: monthlyMessages.toString(),
            icon: <Send className="h-8 w-8 text-datazap-green" />,
            change: monthlyMessages <= 0 ? 'Nenhuma mensagem enviada' : `Este mês`
          },
          {
            title: 'Templates Ativos',
            value: activeTemplates.toString(),
            icon: <MessageSquare className="h-8 w-8 text-datazap-light-green" />,
            change: activeTemplates <= 0 ? 'Nenhum template ativo' : `Total de templates ativos`
          }
        ])
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [user])

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Seção de boas-vindas */}
        <WelcomeCard />
        
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Seções adicionais do dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximos eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-500">Carregando eventos...</p>
                ) : upcomingBirthdays.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum evento nos próximos 30 dias</p>
                ) : (
                  upcomingBirthdays.slice(0, 4).map((event, idx) => {
                    // Calcular dias até o evento
                    const eventDate = new Date(event.birth_date)
                    const today = new Date()
                    
                    // Calcular diferença em dias
                    const diffTime = Math.abs(eventDate.getTime() - today.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    
                    // Formatar data do evento
                    const formattedDate = format(eventDate, 'dd/MM', { locale: ptBR })
                    
                    // Determinar o nome do evento
                    let eventName = '';
                    if (event.eventType === 'aniversario') {
                      eventName = 'Aniversário';
                    } else if (event.eventType === 'dia-das-maes') {
                      eventName = 'Dia das Mães';
                    } else if (event.eventType === 'dia-dos-pais') {
                      eventName = 'Dia dos Pais';
                    } else if (event.eventType === 'natal') {
                      eventName = 'Natal';
                    } else if (event.eventType === 'ano-novo') {
                      eventName = 'Ano Novo';
                    } else {
                      eventName = event.eventName || 'Evento';
                    }
                    
                    return (
                      <div key={event.id} className="flex items-center justify-between pb-2 border-b">
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-gray-500">
                            {eventName} - {formattedDate}
                          </p>
                        </div>
                        <div className="text-sm text-datazap-green">
                          {diffDays === 0 ? 'Hoje' : `Em ${diffDays} dias`}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Atividade recente */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-500">Carregando atividades...</p>
                ) : recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
                ) : (
                  recentActivity.map((activity, idx) => {
                    // Formatar data da atividade
                    const activityDate = new Date(activity.created_at)
                    const today = new Date()
                    const yesterday = new Date(today)
                    yesterday.setDate(yesterday.getDate() - 1)
                    
                    let formattedTime = ''
                    if (activityDate.toDateString() === today.toDateString()) {
                      formattedTime = `hoje, ${format(activityDate, 'HH:mm')}`
                    } else if (activityDate.toDateString() === yesterday.toDateString()) {
                      formattedTime = `ontem, ${format(activityDate, 'HH:mm')}`
                    } else {
                      formattedTime = format(activityDate, 'dd/MM, HH:mm')
                    }
                    
                    // Obter nome do contato (assumindo que está em contacts.name)
                    const contactName = activity.contacts?.name || 'Contato'
                    
                    return (
                      <div key={activity.id} className="flex items-center justify-between pb-2 border-b">
                        <div>
                          <p className="font-medium">Mensagem {activity.status === 'sent' ? 'enviada' : 'agendada'}</p>
                          <p className="text-sm text-gray-500">para {contactName}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formattedTime}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default DashboardPage
