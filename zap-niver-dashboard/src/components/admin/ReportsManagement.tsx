import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/store/supabase'
import { RefreshCw, Download, BarChart3, Users, MessageSquare } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

interface UsersByPlan {
  plan_name: string
  user_count: number
}

interface MessageStats {
  date: string
  count: number
}

interface UserStats {
  month: string
  new_users: number
}

const ReportsManagement = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [usersByPlan, setUsersByPlan] = useState<UsersByPlan[]>([])
  const [messageStats, setMessageStats] = useState<MessageStats[]>([])
  const [userStats, setUserStats] = useState<UserStats[]>([])

  const fetchUsersByPlan = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_users_by_plan')

      if (error) {
        throw error
      }

      setUsersByPlan(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários por plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de usuários por plano.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessageStats = async () => {
    try {
      setLoading(true)
      // Simulando dados de mensagens por dia (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10,
        }
      }).reverse()

      setMessageStats(last7Days)
    } catch (error) {
      console.error('Erro ao buscar estatísticas de mensagens:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de mensagens.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      setLoading(true)
      // Simulando dados de novos usuários por mês (últimos 6 meses)
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho']
      const stats = months.map(month => ({
        month,
        new_users: Math.floor(Math.random() * 20) + 1,
      }))

      setUserStats(stats)
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de usuários.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchUsersByPlan()
    fetchMessageStats()
    fetchUserStats()
  }

  useEffect(() => {
    refreshData()
  }, [])

  // Configuração do gráfico de usuários por plano
  const planChartData = {
    labels: usersByPlan.map(item => item.plan_name),
    datasets: [
      {
        label: 'Usuários',
        data: usersByPlan.map(item => item.user_count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Configuração do gráfico de mensagens por dia
  const messageChartData = {
    labels: messageStats.map(item => item.date),
    datasets: [
      {
        label: 'Mensagens Enviadas',
        data: messageStats.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  }

  // Configuração do gráfico de novos usuários por mês
  const userChartData = {
    labels: userStats.map(item => item.month),
    datasets: [
      {
        label: 'Novos Usuários',
        data: userStats.map(item => item.new_users),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Relatórios e Estatísticas</h2>
        <Button onClick={refreshData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="mr-2 h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usuários por Plano</CardTitle>
                <CardDescription>Distribuição de usuários por plano de assinatura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie data={planChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
                <CardDescription>Novos usuários nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={userChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório de Usuários
          </Button>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens Enviadas</CardTitle>
              <CardDescription>Total de mensagens enviadas nos últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={messageChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório de Mensagens
          </Button>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usersByPlan.reduce((sum, item) => sum + item.user_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{userStats.reduce((sum, item) => sum + item.new_users, 0)} nos últimos 6 meses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {messageStats.reduce((sum, item) => sum + item.count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nos últimos 7 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plano Mais Popular</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usersByPlan.length > 0
                    ? usersByPlan.reduce((prev, current) =>
                        prev.user_count > current.user_count ? prev : current
                      ).plan_name
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {usersByPlan.length > 0
                    ? `${usersByPlan.reduce((prev, current) =>
                        prev.user_count > current.user_count ? prev : current
                      ).user_count} usuários`
                    : ''}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportsManagement
