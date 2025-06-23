@echo off
echo Instalando dependências do Supabase para o frontend...
cd zap-niver-dashboard
npm install @supabase/supabase-js

echo.
echo Instalando dependências adicionais para o formulário...
npm install @hookform/resolvers zod react-hook-form

echo.
echo Todas as dependências foram instaladas com sucesso!
echo Agora você pode iniciar a aplicação com 'npm run dev'
pause
