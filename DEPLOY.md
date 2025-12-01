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

## Passo 3: Banco de Dados (Lembrete)

Lembre-se que o banco de dados SQLite (`database.sqlite`) **não persiste dados na Vercel**.
Para produção, configure um banco Postgres (Vercel Postgres ou Supabase) e atualize a variável `DATABASE_URL` na Vercel.
