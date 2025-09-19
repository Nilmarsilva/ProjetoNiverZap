import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PlanManagement from '@/components/admin/PlanManagement'
import { supabase } from '@/lib/store/apiClient'

// Mock do Supabase
vi.mock('@/lib/store/apiClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            {
              id: '1',
              name: 'Plano Básico',
              description: 'Plano básico para pequenas empresas',
              price: 29.90,
              message_limit: 100,
              is_active: true,
              created_at: '2025-01-01T00:00:00.000Z',
              features: ['Envio de mensagens', 'Contatos ilimitados']
            },
            {
              id: '2',
              name: 'Plano Premium',
              description: 'Plano premium para empresas médias',
              price: 59.90,
              message_limit: 500,
              is_active: true,
              created_at: '2025-01-01T00:00:00.000Z',
              features: ['Envio de mensagens', 'Contatos ilimitados', 'Suporte prioritário']
            }
          ],
          error: null
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({
          data: {
            id: '3',
            name: 'Novo Plano',
            description: 'Descrição do novo plano',
            price: 39.90,
            message_limit: 200,
            is_active: true,
            created_at: '2025-01-01T00:00:00.000Z',
            features: ['Envio de mensagens']
          },
          error: null
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: null,
          error: null
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: null,
          error: null
        })),
      })),
    })),
  },
}))

// Mock do componente de toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

describe('PlanManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a lista de planos', async () => {
    render(<PlanManagement />)
    
    // Aguarda os planos serem carregados
    await waitFor(() => {
      expect(screen.getByText('Plano Básico')).toBeInTheDocument()
      expect(screen.getByText('Plano Premium')).toBeInTheDocument()
    })
  })

  it('deve abrir o diálogo de criação de plano ao clicar no botão', async () => {
    render(<PlanManagement />)
    
    // Clica no botão de adicionar plano
    fireEvent.click(screen.getByText('Adicionar Plano'))
    
    // Verifica se o diálogo foi aberto
    await waitFor(() => {
      expect(screen.getByText('Criar Novo Plano')).toBeInTheDocument()
    })
  })

  it('deve mostrar o diálogo de confirmação ao tentar excluir um plano', async () => {
    render(<PlanManagement />)
    
    // Aguarda os planos serem carregados
    await waitFor(() => {
      expect(screen.getByText('Plano Básico')).toBeInTheDocument()
    })
    
    // Encontra o botão de excluir do primeiro plano e clica nele
    const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
      button => button.querySelector('svg')
    )
    
    // Clica no botão de excluir (assumindo que é o segundo botão de ação)
    fireEvent.click(deleteButtons[1])
    
    // Verifica se o diálogo de confirmação foi aberto
    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja excluir o plano/)).toBeInTheDocument()
    })
  })

  it('deve chamar a API para excluir o plano quando confirmado', async () => {
    render(<PlanManagement />)
    
    // Aguarda os planos serem carregados
    await waitFor(() => {
      expect(screen.getByText('Plano Básico')).toBeInTheDocument()
    })
    
    // Encontra o botão de excluir do primeiro plano e clica nele
    const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
      button => button.querySelector('svg')
    )
    
    // Clica no botão de excluir (assumindo que é o segundo botão de ação)
    fireEvent.click(deleteButtons[1])
    
    // Verifica se o diálogo de confirmação foi aberto
    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja excluir o plano/)).toBeInTheDocument()
    })
    
    // Clica no botão de confirmar
    fireEvent.click(screen.getByText('Excluir'))
    
    // Verifica se a API foi chamada
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('plans')
      // Corrigido para fornecer um mock de retorno da função from
      const mockFrom = vi.fn().mockReturnValue({
        delete: vi.fn()
      })
      expect(supabase.from).toHaveBeenCalled()
      // Verificar se delete foi chamado no objeto retornado por from
      const returnedMock = supabase.from('plans')
      expect(returnedMock.delete).toHaveBeenCalled()
    })
  })
})
