# Configuração PostgreSQL - Produção

## 🚀 Passos Finais

### 1. Configurar Variáveis de Ambiente na Vercel
1. Acesse: https://vercel.com/joao-paulo-dias-de-oliveiras-projects/backend/settings/environment-variables
2. Adicione as variáveis:
   ```
   DATABASE_URL = postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres
   PORT = 3001
   NODE_ENV = production
   ```

### 2. Rodar Migrações Localmente
```bash
cd backend
npm install
cp .env.example .env
# Edite .env com sua DATABASE_URL
npm run db:migrate
npm run db:generate
```

### 3. Fazer Deploy
```bash
git add .
git commit -m "Configure PostgreSQL database"
git push origin main
vercel --prod --yes
```

## 🗄️ Estrutura do Banco

O Prisma criará automaticamente:
- `User` (autenticação)
- `Student` (dados dos alunos)
- `Professor` (dados dos professores)
- `Attendance` (presença)
- `TrainingSession` (treinos)

## 🧪 Testar Conexão
Após deploy, teste:
```bash
curl https://backend-kappa-two-37.vercel.app/api/health
```

## 🔧 Outras Opções de PostgreSQL

### Railway
- URL: https://railway.app
- Criar PostgreSQL service
- Copiar connection string

### Neon
- URL: https://neon.tech
- PostgreSQL serverless
- Free tier generoso

### PlanetScale
- URL: https://planetscale.com
- MySQL (alternativa)
- Boa para produção
