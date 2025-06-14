# Resolução de Problemas SSH - Hostinger VPS

## Problema: Configuração SSH Modificada

Quando você vê a mensagem sobre "A new version of configuration file /etc/ssh/sshd_config is available", significa que o sistema detectou uma nova versão do arquivo de configuração SSH.

### Solução Recomendada

**Escolha a opção: "install the package maintainer's version"** (primeira opção em vermelho)

Isso vai:
- Manter a configuração SSH atualizada e segura
- Usar as configurações padrão mais recentes
- Evitar problemas de compatibilidade

### Por que esta escolha?

1. **Segurança**: A nova versão corrige vulnerabilidades
2. **Compatibilidade**: Funciona melhor com sistemas atualizados
3. **Suporte**: Configuração padrão é mais fácil de debugar

### Configurações SSH Recomendadas para Produção

Após aceitar a nova configuração, você pode personalizar o SSH editando:

```bash
sudo nano /etc/ssh/sshd_config
```

#### Configurações Importantes:

```bash
# Porta SSH (mude para aumentar segurança)
Port 22

# Permitir login root (desabilitar em produção)
PermitRootLogin no

# Usar chaves SSH ao invés de senhas
PasswordAuthentication no
PubkeyAuthentication yes

# Timeout de conexão
ClientAliveInterval 300
ClientAliveCountMax 2

# Limitar tentativas de login
MaxAuthTries 3
MaxStartups 3

# Desabilitar X11 forwarding
X11Forwarding no

# Protocolo SSH
Protocol 2
```

### Aplicar Mudanças

Após fazer alterações:

```bash
# Testar configuração
sudo sshd -t

# Reiniciar SSH
sudo systemctl restart ssh

# Verificar status
sudo systemctl status ssh
```

### Configuração Segura Completa

```bash
#!/bin/bash
# Script para configurar SSH seguro

# Backup da configuração atual
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Configurar SSH
sudo tee /etc/ssh/sshd_config > /dev/null <<EOF
# Configuração SSH Segura - AfiliadosBet

# Porta e protocolo
Port 22
Protocol 2

# Autenticação
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Timeouts e limites
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxStartups 10:30:60
MaxSessions 10

# Recursos desabilitados
X11Forwarding no
PermitEmptyPasswords no
PermitUserEnvironment no
AllowAgentForwarding yes
AllowTcpForwarding yes
GatewayPorts no

# Logging
SyslogFacility AUTH
LogLevel INFO

# Algoritmos seguros
KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,hmac-sha2-256,hmac-sha2-512

# Banner de aviso
Banner /etc/ssh/banner

# Usuários permitidos (substitua 'usuario' pelo seu usuário)
AllowUsers usuario

# Subsistemas
Subsystem sftp /usr/lib/openssh/sftp-server
EOF

# Criar banner de aviso
sudo tee /etc/ssh/banner > /dev/null <<EOF
=========================================================
              ACESSO AUTORIZADO APENAS
              Sistema AfiliadosBet
              Todas as atividades são monitoradas
=========================================================
EOF

# Testar configuração
sudo sshd -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração SSH válida"
    sudo systemctl restart ssh
    echo "✅ SSH reiniciado com sucesso"
else
    echo "❌ Erro na configuração SSH"
    sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
    echo "🔄 Configuração anterior restaurada"
fi
EOF
```

### Configurar Chaves SSH

Para aumentar a segurança, configure chaves SSH:

#### No seu computador local:

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave para servidor
ssh-copy-id usuario@SEU_IP_VPS
```

#### No servidor:

```bash
# Criar diretório SSH
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Criar arquivo de chaves autorizadas
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Adicionar sua chave pública
echo "sua-chave-publica-aqui" >> ~/.ssh/authorized_keys
```

### Firewall SSH

Configure o firewall para proteger SSH:

```bash
# Permitir SSH
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Se mudou a porta SSH
sudo ufw allow NOVA_PORTA/tcp

# Ativar firewall
sudo ufw enable
```

### Monitoramento SSH

Para monitorar acessos SSH:

```bash
# Ver tentativas de login
sudo grep "Failed password" /var/log/auth.log

# Ver logins bem-sucedidos
sudo grep "Accepted password" /var/log/auth.log

# Usuários conectados
who
w

# Histórico de comandos
history
```

### Fail2Ban (Proteção contra Ataques)

Instalar proteção automática:

```bash
# Instalar Fail2Ban
sudo apt update
sudo apt install fail2ban

# Configurar para SSH
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

# Iniciar serviço
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Verificar status
sudo fail2ban-client status sshd
```

### Backup de Emergência

Sempre mantenha um meio de acesso alternativo:

1. **Console do Hostinger**: Use o console web do painel
2. **Chave SSH backup**: Mantenha uma chave SSH adicional
3. **Usuário backup**: Crie um usuário adicional com sudo

### Resolução de Problemas

Se perder acesso SSH:

1. Use o console web do Hostinger
2. Verifique logs: `sudo tail -f /var/log/auth.log`
3. Restaure configuração: `sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config`
4. Reinicie SSH: `sudo systemctl restart ssh`

### Teste de Configuração

Sempre teste antes de desconectar:

```bash
# Em uma nova sessão SSH (sem fechar a atual)
ssh usuario@SEU_IP_VPS

# Se funcionar, pode fechar a sessão original
```

### Comandos de Emergência

Se algo der errado:

```bash
# Restaurar configuração padrão
sudo dpkg-reconfigure openssh-server

# Reinstalar SSH
sudo apt remove --purge openssh-server
sudo apt install openssh-server

# Verificar se SSH está rodando
sudo systemctl status ssh
sudo netstat -tlnp | grep :22
```