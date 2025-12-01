# Guia de Deploy (Vercel + GitHub)

Este guia foi atualizado para o seu projeto atual, que já está conectado ao GitHub.

## Estado Atual

- **Repositório Local**: Configurado
- **Repositório Remoto**: `https://github.com/PHDevillzin/SICATI-V3.git`
- **Branch Principal**: `main`

---

## Passo 1: Enviar Alterações para o GitHub

Como seu projeto já está configurado, você só precisa salvar as alterações e enviá-las.

Abra o terminal na pasta do projeto e execute os comandos abaixo, um por um:

```bash
# 1. Verifique o estado dos arquivos (opcional, para ver o que mudou)
git status

# 2. Adicione todas as alterações para serem salvas
git add .

# 3. Salve as alterações com uma mensagem (mude a mensagem se quiser)
git commit -m "Atualizacao do projeto"

# 4. Envie para o GitHub
git push origin main
```

### Problemas Comuns

- **Erro de permissão/login**: Se pedir senha, use seu **Token de Acesso Pessoal (PAT)** do GitHub, não sua senha de login. Ou use o navegador se aparecer uma janela de autenticação.
- **Erro "rejected" (non-fast-forward)**: Significa que tem coisas no GitHub que você não tem no pc. Tente `git pull origin main` antes de dar push.

---

## Passo 2: Deploy na Vercel

Se você já configurou o projeto na Vercel, o deploy deve acontecer **automaticamente** assim que você fizer o `git push` acima.

Se ainda não configurou:

1.  Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Importe o repositório `SICATI-V3`.
4.  **Configurações**:
    - **Framework Preset**: Vite.
    - **Root Directory**: `./`.
    - **Build Command**: `vite build`.

# Guia de Deploy (Vercel + GitHub)

Este guia foi atualizado para o seu projeto atual, que já está conectado ao GitHub.

## Estado Atual

- **Repositório Local**: Configurado
- **Repositório Remoto**: `https://github.com/PHDevillzin/SICATI-V3.git`
- **Branch Principal**: `main`

---

## Passo 1: Enviar Alterações para o GitHub

Como seu projeto já está configurado, você só precisa salvar as alterações e enviá-las.

Abra o terminal na pasta do projeto e execute os comandos abaixo, um por um:

```bash
# 1. Verifique o estado dos arquivos (opcional, para ver o que mudou)
git status

# 2. Adicione todas as alterações para serem salvas
git add .

# 3. Salve as alterações com uma mensagem (mude a mensagem se quiser)
git commit -m "Atualizacao do projeto"

# 4. Envie para o GitHub
git push origin main
```

### Problemas Comuns

- **Erro de permissão/login**: Se pedir senha, use seu **Token de Acesso Pessoal (PAT)** do GitHub, não sua senha de login. Ou use o navegador se aparecer uma janela de autenticação.
- **Erro "rejected" (non-fast-forward)**: Significa que tem coisas no GitHub que você não tem no pc. Tente `git pull origin main` antes de dar push.

---

## Passo 2: Deploy na Vercel

Se você já configurou o projeto na Vercel, o deploy deve acontecer **automaticamente** assim que você fizer o `git push` acima.

Se ainda não configurou:

1.  Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Importe o repositório `SICATI-V3`.
4.  **Configurações**:
    - **Framework Preset**: Vite.
    - **Root Directory**: `./`.
    - **Build Command**: `vite build`.
    - **Output Directory**: `dist`.
    - **Environment Variables**: Adicione `DATABASE_URL` se estiver usando Postgres.
5.  Clique em **Deploy**.

# Guia de Deploy (Vercel + GitHub)

Este guia foi atualizado para o seu projeto atual, que já está conectado ao GitHub.

## Estado Atual

- **Repositório Local**: Configurado
- **Repositório Remoto**: `https://github.com/PHDevillzin/SICATI-V3.git`
- **Branch Principal**: `main`

---

## Passo 1: Enviar Alterações para o GitHub

Como seu projeto já está configurado, você só precisa salvar as alterações e enviá-las.

Abra o terminal na pasta do projeto e execute os comandos abaixo, um por um:

```bash
# 1. Verifique o estado dos arquivos (opcional, para ver o que mudou)
git status

# 2. Adicione todas as alterações para serem salvas
git add .

# 3. Salve as alterações com uma mensagem (mude a mensagem se quiser)
git commit -m "Atualizacao do projeto"

# 4. Envie para o GitHub
git push origin main
```

### Problemas Comuns

- **Erro de permissão/login**: Se pedir senha, use seu **Token de Acesso Pessoal (PAT)** do GitHub, não sua senha de login. Ou use o navegador se aparecer uma janela de autenticação.
- **Erro "rejected" (non-fast-forward)**: Significa que tem coisas no GitHub que você não tem no pc. Tente `git pull origin main` antes de dar push.

---

## Passo 2: Deploy na Vercel

Se você já configurou o projeto na Vercel, o deploy deve acontecer **automaticamente** assim que você fizer o `git push` acima.

Se ainda não configurou:

1.  Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Importe o repositório `SICATI-V3`.
4.  **Configurações**:
    - **Framework Preset**: Vite.
    - **Root Directory**: `./`.
    - **Build Command**: `vite build`.
    - **Output Directory**: `dist`.
    - **Environment Variables**: Adicione `DATABASE_URL` se estiver usando Postgres.
5.  Clique em **Deploy**.

---

## Passo 3: Configurar Banco de Dados (Turso)

Para usar SQLite na Vercel, usaremos o **Turso** (libSQL).

**Método Recomendado (Via Site):**

1.  Acesse [turso.tech](https://turso.tech/) e faça login/cadastro (pode usar o GitHub).
2.  No painel, clique em **"Create Database"**.
3.  Dê um nome (ex: `sicat-db`) e escolha uma região próxima (ex: `São Paulo` ou `Virginia`).
4.  Após criar, clique no banco de dados.
5.  **Pegar a URL**:
    - Na tela do banco, copie a **Database URL**. Ela começa com `libsql://...`.
6.  **Pegar o Token**:
    - Clique em **"Generate Token"** (ou vá na aba "Settings" -> "Tokens").
    - Copie o token gerado (é um texto longo e aleatório).

**Configurando na Vercel:**

1.  No Dashboard da Vercel, vá em **Settings** -> **Environment Variables**.
2.  Adicione uma nova variável:

    - **Key**: `DATABASE_URL`
    - **Value**: A URL que você copiou, mas com o token no final.

    **Formato OBRIGATÓRIO**:
    `libsql://[NOME-DO-BANCO]-[SEU-USUARIO].turso.io?authToken=[SEU-TOKEN]`

    _Exemplo_: `libsql://sicat-db-paulo.turso.io?authToken=eyJhbGciOiJIUzI1Ni...`
    libsql://database-vercel-icfg-m3mu6rj4nyfbz3e49l6bfgj9.aws-us-east-1.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQ2MDYxNjEsImlkIjoiZmFmZTgyMWQtZTRmNS00YjRiLWFmNmUtYWNjZWZhNTc0MjA1IiwicmlkIjoiOTBhNjhjNDgtYmRhMy00N2FjLTg2OWQtNmY1MTg2NTk1M2QxIn0.n2e2d-dPp0wPnIS72GIg6c8Un28p_EpZ0rrhV9OiuI0xxNpU5UJVJ21EW9ipxz8Ue6KL2LoMBwidwhpILdkFBw

### Finalizando

Após configurar a variável `DATABASE_URL`, vá na aba **Deployments** da Vercel e clique nos três pontinhos do último deploy -> **Redeploy**.
