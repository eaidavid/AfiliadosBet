#!/bin/bash

# Script para manter o AfiliadosBet sempre rodando
# Monitora e reinicia automaticamente se necessário

APP_NAME="AfiliadosBet"
PROCESS_NAME="tsx server/index.ts"
PORT=5000
CHECK_INTERVAL=30 # segundos

print_log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [MONITOR] $1"
}

check_app_running() {
    if pgrep -f "$PROCESS_NAME" > /dev/null; then
        return 0
    else
        return 1
    fi
}

check_port_responding() {
    if curl -s "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

restart_app() {
    print_log "Reiniciando $APP_NAME..."
    
    # Parar processo existente
    pkill -f "$PROCESS_NAME" 2>/dev/null
    sleep 3
    
    # Limpar porta se estiver ocupada
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; then
        print_log "Liberando porta $PORT..."
        lsof -ti:$PORT | xargs kill -9 2>/dev/null
        sleep 2
    fi
    
    # Iniciar aplicação
    print_log "Iniciando nova instância..."
    nohup npm run dev > logs/app.log 2>&1 &
    
    # Aguardar inicialização
    sleep 10
    
    if check_app_running && check_port_responding; then
        print_log "$APP_NAME reiniciado com sucesso!"
        return 0
    else
        print_log "Falha ao reiniciar $APP_NAME"
        return 1
    fi
}

# Criar diretório de logs
mkdir -p logs

print_log "Monitor do $APP_NAME iniciado"
print_log "Verificando a cada $CHECK_INTERVAL segundos"

while true; do
    if check_app_running; then
        if check_port_responding; then
            print_log "$APP_NAME está rodando normalmente"
        else
            print_log "$APP_NAME não está respondendo na porta $PORT"
            restart_app
        fi
    else
        print_log "$APP_NAME não está rodando"
        restart_app
    fi
    
    sleep $CHECK_INTERVAL
done