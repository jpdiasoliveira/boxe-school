# Configuração de Banco de Dados Persistente

## Opção 1: Supabase (Recomendado)

### 1. Criar Projeto Supabase
1. Acesse https://supabase.com
2. Crie conta gratuita
3. Crie novo projeto
4. Aguarde provisionamento (2-3 minutos)

### 2. Obter Connection String
1. No projeto Supabase, vá em Settings > Database
2. Copie "Connection string"
3. Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

### 3. Configurar .env
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@db.abc123.supabase.co:5432/postgres"
PORT=3001
NODE_ENV=production
```

### 4. Rodar Migrações
```bash
cd backend
npx prisma db push
```

## Opção 2: Railway (Se já tiver)

### 1. Verificar Projeto Railway
1. Acesse https://railway.app
2. Verifique se tem serviço PostgreSQL ativo
3. Copie DATABASE URL das variáveis de ambiente

### 2. Configurar .env
```env
DATABASE_URL="postgresql://postgres:SENHA@containers-us-west-XXX.railway.app:5432/railway"
```

## Opção 3: Neon (PostgreSQL Serverless)

### 1. Criar Projeto Neon
1. Acesse https://neon.tech
2. Crie conta gratuita
3. Crie novo projeto
4. Copie connection string

### 2. Configurar .env
```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/dbname"
```

## Testar Conexão

```bash
cd backend
npm run dev
```

## Deploy no Vercel

1. Configure variáveis de ambiente no Vercel Dashboard
2. Vá para seu projeto > Settings > Environment Variables
3. Adicione DATABASE_URL
4. Redeploy

## Benefícios

✅ Dados persistem entre deploys
✅ Backup automático
✅ Escalabilidade
✅ Acesso de qualquer lugar
✅ Multi-região
