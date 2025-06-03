# Start - Sistema de Ordens de Manutenção e Atendimento

Este é um projeto [Next.js](https://nextjs.org) para gerenciamento de guias de remessa, bases, usuários e serviços.

## Disclaimer

You should install the project using
```bash
npm install --legacy-peer-deps
```
That's because ShadcnUI today (02/28/2025) have some incompatibilities between components on NextJS 15 and React 19

## Getting Started

First, run the development server:

```bash
npm run dev
```

Next, start a postgresql docker instance

```bash
docker pull postgres
```
```bash
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```
```bash
npx prisma generate
```
```bash
npx prisma db push
```

The url for the database will be: postgresql://postgres:postgres@localhost:5432/postgres

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy na AWS EC2

Siga estas instruções para fazer o deploy da aplicação em uma instância EC2 da AWS:

### 1. Preparação da Instância EC2

1. Crie uma instância EC2 na AWS (recomendado: Ubuntu Server 22.04 LTS, t2.micro ou superior)
2. Configure o grupo de segurança para permitir tráfego nas portas 22 (SSH), 80 (HTTP) e 443 (HTTPS)
3. Conecte-se à instância via SSH:
   ```bash
   ssh -i sua-chave.pem ubuntu@seu-ip-publico
   ```

### 2. Instalação de Dependências

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Node.js e npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node -v
npm -v

# Instalar PM2 (gerenciador de processos para Node.js)
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Instalar Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Configuração do PostgreSQL

```bash
# Acessar o PostgreSQL como usuário postgres
sudo -u postgres psql

# Criar banco de dados e usuário
CREATE DATABASE soma;
CREATE USER somauser WITH ENCRYPTED PASSWORD 'sua-senha-segura';
GRANT ALL PRIVILEGES ON DATABASE soma TO somauser;

# Sair do PostgreSQL
\q
```

### 4. Configuração do Projeto

```bash
# Clonar o repositório
git clone https://github.com/AlyxsonMarques/soma.git
cd soma

# Instalar dependências
npm install --legacy-peer-deps

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

Edite o arquivo .env com as informações corretas:
```
DATABASE_URL="postgresql://somauser:sua-senha-segura@localhost:5432/soma"
NEXT_PUBLIC_API_URL="http://seu-dominio-ou-ip"
```

### 5. Build e Inicialização

```bash
# Gerar o Prisma Client
npx prisma generate

# Aplicar migrações ao banco de dados
npx prisma migrate deploy

# Popular o banco com dados iniciais
npx prisma db seed

# Construir a aplicação
npm run build

# Iniciar com PM2
pm2 start npm --name "soma" -- start
pm2 save
```

### 6. Configuração do Nginx

```bash
sudo nano /etc/nginx/sites-available/soma
```

Adicione a seguinte configuração:
```nginx
server {
    listen 80;
    server_name seu-dominio-ou-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/soma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configuração de HTTPS (opcional, mas recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo systemctl status certbot.timer
```

### 8. Manutenção e Atualizações

Para atualizar a aplicação quando houver mudanças:

```bash
cd ~/soma
git pull
npm install --legacy-peer-deps
npx prisma generate
npm run build
pm2 restart soma
```

Para visualizar logs:
```bash
pm2 logs soma
```

Para monitorar a aplicação:
```bash
pm2 monit
```
