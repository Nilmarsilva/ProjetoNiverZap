
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

/**
 * NotFoundPage
 * 
 * Página de erro 404 - Não encontrado
 * Exibida quando o usuário acessa uma rota que não existe
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-datazap-green mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button asChild className="bg-datazap-green hover:bg-datazap-green/90">
          <Link to="/dashboard">Voltar para o Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
