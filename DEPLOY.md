# Guia de Deploy (Vercel + GitHub)

Este guia irá ajudá-lo a colocar sua aplicação online no Vercel e salvar o código no GitHub.

## Pré-requisitos

1.  **Conta no GitHub**: [https://github.com/](https://github.com/)
2.  **Conta na Vercel**: [https://vercel.com/](https://vercel.com/) (Faça login com o GitHub)
3.  **Git Instalado**: [https://git-scm.com/downloads](https://git-scm.com/downloads)

## Passo 1: Preparar o Repositório GitHub

Como você não tem o GitHub CLI (`gh`) instalado, vamos fazer pelo navegador e terminal.

1.  Vá para [GitHub - Novo Repositório](https://github.com/new).
2.  Nomeie o repositório (ex: `sistema-sicat-v2`).
3.  Deixe como **Public** ou **Private** (sua escolha).
4.  **NÃO** inicialize com README, .gitignore ou License (já temos isso localmente).
5.  Clique em **Create repository**.
6.  Copie a URL do repositório (ex: `https://github.com/SEU_USUARIO/sistema-sicat-v2.git`).

## Passo 2: Enviar Código para o GitHub

Abra o terminal na pasta do projeto (`c:\Users\Paulo Henrique\Desktop\SistemaSICAT-V2-main`) e execute:

```bash
# Inicializa o git (se já não estiver)
git init

# Adiciona todos os arquivos
git add .

# Faz o primeiro commit
git commit -m "Primeiro commit: Sistema SICAT V2"

# Renomeia a branch principal para main
git branch -M main

# Conecta com o repositório remoto (SUBSTITUA A URL PELA SUA)
git remote add origin https://github.com/SEU_USUARIO/sistema-sicat-v2.git

# Envia o código
git push -u origin main
```

## Passo 3: Deploy na Vercel

1.  Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Em **"Import Git Repository"**, encontre o repositório `sistema-sicat-v2` que você acabou de criar e clique em **Import**.
4.  **Configuração do Projeto**:
    - **Framework Preset**: Vite (deve detectar automaticamente).
    - **Root Directory**: `./` (padrão).
    - **Build Command**: `vite build` (padrão).
    - **Output Directory**: `dist` (padrão).
    - **Environment Variables** (Variáveis de Ambiente):
      - Adicione `DATABASE_URL` se você tiver um banco de dados Postgres (veja Passo 4).
5.  Clique em **Deploy**.

## Passo 4: Banco de Dados (Importante!)

Sua aplicação usa atualmente SQLite (`database.sqlite`). **O SQLite NÃO funciona corretamente na Vercel** porque o sistema de arquivos é temporário. Seus dados serão apagados a cada deploy.

Para ter dados persistentes, você precisa de um banco de dados na nuvem (Postgres).

### Opção Recomendada: Vercel Postgres

1.  No painel do seu projeto na Vercel, vá na aba **Storage**.
2.  Clique em **Connect Store** -> **Postgres** -> **Create New**.
3.  Aceite os termos e crie o banco.
4.  Após criar, vá em **.env.local** (na aba Storage) e clique em **"Copy Snippet"**.
5.  Vá em **Settings** -> **Environment Variables** no seu projeto Vercel.
6.  Cole as variáveis copiadas (principalmente `POSTGRES_URL` ou `DATABASE_URL`).
    - _Nota: O código já está preparado para usar `process.env.DATABASE_URL`._

### Atualizar o Schema do Banco

Para criar as tabelas no novo banco Postgres, você pode precisar rodar uma sincronização. Como o backend roda automaticamente `sequelize.sync()` ao iniciar, as tabelas devem ser criadas automaticamente no primeiro acesso, desde que a variável `DATABASE_URL` esteja correta.

---

**Sucesso!** Sua aplicação deve estar online.
