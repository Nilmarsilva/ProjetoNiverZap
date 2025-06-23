import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Shield, 
  Key, 
  Fingerprint, 
  Eye, 
  FileText, 
  AlertTriangle, 
  Save,
  RotateCcw
} from 'lucide-react'
import { PasswordPolicyConfig } from './security/PasswordPolicyConfig'
import { AuthenticationConfig } from './security/AuthenticationConfig'
import { useConfig } from '@/contexts/ConfigContext'

/**
 * Componente de Configurações de Segurança
 * 
 * Permite configurar todas as políticas de segurança do sistema
 */
const SecurityConfig = () => {
  const [activeTab, setActiveTab] = useState('password-policy')
  const { toast } = useToast()
  const { resetConfig } = useConfig()
  
  // Função para restaurar configurações padrão
  const handleRestoreDefaults = async () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações de segurança para os valores padrão? Esta ação não pode ser desfeita.')) {
      try {
        // Resetar configurações de segurança no contexto global
        await resetConfig(['security'])
        
        // Remover configurações antigas do localStorage (compatibilidade)
        localStorage.removeItem('passwordPolicy')
        localStorage.removeItem('authConfig')
        localStorage.removeItem('dataSecurityConfig')
        localStorage.removeItem('auditConfig')
        
        toast({
          title: 'Configurações restauradas',
          description: 'Todas as configurações de segurança foram restauradas para os valores padrão.',
        })
      } catch (error) {
        console.error('Erro ao restaurar configurações:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível restaurar as configurações.',
          variant: 'destructive'
        })
      }
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-datazap-green" />
          <h3 className="text-lg font-medium">Configurações de Segurança</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          onClick={handleRestoreDefaults}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrões
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              Importante: Configurações de Segurança
            </p>
            <p>
              As configurações nesta seção são críticas para a segurança do seu sistema. 
              Alterações inadequadas podem comprometer a proteção dos seus dados e dos seus usuários.
              Recomendamos que apenas administradores com conhecimento em segurança façam modificações.
            </p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="password-policy" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Políticas de Senha</span>
            <span className="sm:hidden">Senhas</span>
          </TabsTrigger>
          <TabsTrigger value="authentication" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            <span className="hidden sm:inline">Autenticação e Sessão</span>
            <span className="sm:hidden">Autenticação</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="password-policy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Políticas de Senha
              </CardTitle>
              <CardDescription>
                Configure os requisitos de complexidade de senha, políticas de expiração e bloqueio de conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordPolicyConfig />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Autenticação e Sessão
              </CardTitle>
              <CardDescription>
                Configure autenticação de dois fatores, tempos de sessão e restrições de IP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthenticationConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Dicas de Segurança
        </h4>
        <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
          <li>Use senhas fortes com pelo menos 12 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.</li>
          <li>Ative a autenticação de dois fatores (2FA) para todas as contas, especialmente para administradores.</li>
          <li>Altere suas senhas regularmente e não as reutilize em diferentes serviços.</li>
          <li>Monitore regularmente os logs de acesso para detectar atividades suspeitas.</li>
          <li>Mantenha seu sistema e todas as dependências atualizadas com as últimas correções de segurança.</li>
        </ul>
      </div>
    </div>
  )
}

export default SecurityConfig
