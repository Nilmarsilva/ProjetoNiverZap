import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AdminRoute from '@/components/auth/AdminRoute'
import { useAuthStore } from '@/stores/authStore'
import { isAdmin } from '@/lib/store/supabase'

// Mock do hook useAuthStore
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock da função isAdmin
vi.mock('@/lib/supabase', () => ({
  isAdmin: vi.fn(),
}))

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('deve mostrar o loader enquanto verifica o status de admin', async () => {
    // Mock do estado de autenticação
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'admin@niverzap.com' },
    } as any)
    
    // Mock da função isAdmin para demorar um pouco
    vi.mocked(isAdmin).mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(true), 100)
    }))

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminRoute>
          <div data-testid="admin-content">Conteúdo Admin</div>
        </AdminRoute>
      </MemoryRouter>
    )

    // Deve mostrar o loader
    expect(screen.getByText('Verificando permissões...')).toBeInTheDocument()
  })

  it('deve redirecionar para login quando o usuário não está autenticado', async () => {
    // Mock do estado de autenticação (usuário não autenticado)
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
    } as any)

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div data-testid="admin-content">Conteúdo Admin</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    // Aguarda o redirecionamento
    await vi.waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument()
    })
  })

  it('deve redirecionar para dashboard quando o usuário não é admin', async () => {
    // Mock do estado de autenticação (usuário autenticado)
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'user@niverzap.com' },
    } as any)
    
    // Mock da função isAdmin para retornar false
    vi.mocked(isAdmin).mockResolvedValue(false)

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard Page</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div data-testid="admin-content">Conteúdo Admin</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    // Aguarda o redirecionamento
    await vi.waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    })
  })

  it('deve renderizar o conteúdo quando o usuário é admin', async () => {
    // Mock do estado de autenticação (usuário admin)
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'admin@niverzap.com' },
    } as any)
    
    // Mock da função isAdmin para retornar true
    vi.mocked(isAdmin).mockResolvedValue(true)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminRoute>
          <div data-testid="admin-content">Conteúdo Admin</div>
        </AdminRoute>
      </MemoryRouter>
    )

    // Aguarda o conteúdo ser renderizado
    await vi.waitFor(() => {
      expect(screen.getByTestId('admin-content')).toBeInTheDocument()
    })
  })
})
