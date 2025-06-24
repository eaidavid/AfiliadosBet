#!/bin/bash

apt update && apt upgrade -y

# Instalações necessárias
apt install -y docker.io docker-compose git ufw nginx certbot python3-certbot-nginx

# Clona o projeto
git clone https://github.com/eaidavid/AfiliadosBet.git afiliadosbet
cd afiliadosbet

# Copia os Dockerfiles e arquivos auxiliares
# (Você vai subir eles no repositório ou por SCP)

# Sobe os containers
docker-compose up -d --build

# Ativa firewall com porta 22, 80, 443
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Cria HTTPS com Certbot
certbot --nginx -d afiliadosbet.com.br

echo "✅ Sistema AfiliadosBet rodando em https://afiliadosbet.com.br"


#atualizar