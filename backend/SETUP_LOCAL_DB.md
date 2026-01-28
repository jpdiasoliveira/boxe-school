# Configuração de Banco de Dados Local

## Opção 1: PostgreSQL Local (Recomendado)

### 1. Instalar PostgreSQL
```bash
# Windows
# Baixe e instale: https://www.postgresql.org/download/windows/

# Ou com Chocolatey
choco install postgresql

# Ou com Docker
docker run --name postgres-boxe -e POSTGRES_PASSWORD=password -e POSTGRES_DB=boxe_school -p 5432:5432 -d postgres:15
```

### 2. Criar Banco de Dados
```sql
-- Conecte no PostgreSQL e execute:
CREATE DATABASE boxe_school;
```

### 3. Atualizar .env
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/boxe_school"
```

### 4. Rodar Migrações
```bash
cd backend
npx prisma db push
```

## Opção 2: SQLite (Mais Simples)

### 1. Mudar para SQLite
```env
DATABASE_URL="file:./dev.db"
```

### 2. Atualizar schema.prisma
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. Rodar Migrações
```bash
npx prisma db push
```

## Opção 3: Neon (PostgreSQL Serverless)

### 1. Criar Projeto Neon
1. Acesse: https://neon.tech
2. Crie conta gratuita
3. Crie novo projeto
4. Copie connection string

### 2. Configurar .env
```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/dbname"
```

## Testar Conexão
```bash
node check-db.js
```

## Problemas Comuns

### PostgreSQL não conecta:
- Verifique se o serviço está rodando
- Confirme porta 5432
- Verifique usuário/senha

### Permissões negadas:
```sql
GRANT ALL PRIVILEGES ON DATABASE boxe_school TO postgres;
```

### Tabelas não existem:
```bash
npx prisma db push
```
