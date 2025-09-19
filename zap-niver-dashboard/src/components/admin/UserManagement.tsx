import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/store/utils'
import { RefreshCw, Eye, UserCog } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/store/apiClient'

// Definição do tipo de usuário
interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  plan_id: number
  whatsapp_provider: string
  created_at: string
  plan: {
    id: number
    name: string
    type: string
  }
}

/**
 * Componente de Gerenciamento de Usuários
 * 
 * Permite listar e gerenciar usuários do sistema
 */
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Busca os usuários ao carregar o componente
  useEffect(() => {
    fetchUsers()
  }, [])

  // Função para buscar os usuários
  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Usar o método order corretamente com o novo apiClient
      const result = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      const { data, error } = await result.execute()
      
      if (error) throw error
      
      setUsers(data || [])
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para alternar o status de um usuário
  const toggleUserStatus = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !user.is_active })
        .eq('id', user.id)
      
      if (error) throw error
      
      toast({
        title: user.is_active ? 'Usuário desativado' : 'Usuário ativado',
        description: `O usuário ${user.email} foi ${user.is_active ? 'desativado' : 'ativado'} com sucesso`
      })
      
      // Atualiza a lista
      fetchUsers()
    } catch (error) {
      console.error('Erro ao alternar status do usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do usuário',
        variant: 'destructive'
      })
    }
  }

  // Formata a data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Renderiza o componente
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={fetchUsers} variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Atualizar
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Total de usuários: {users.length}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Carregando usuários...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">Nenhum usuário encontrado</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={
                    user.plan?.type === 'free' ? 'secondary' :
                    user.plan?.type === 'basic' ? 'default' :
                    user.plan?.type === 'premium' ? 'destructive' : 'outline'
                  }>
                    {user.plan?.name || 'Sem plano'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'default' : 'outline'} className={user.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      title={user.is_active ? 'Desativar usuário' : 'Ativar usuário'}
                      onClick={() => toggleUserStatus(user)}
                    >
                      <UserCog size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default UserManagement
