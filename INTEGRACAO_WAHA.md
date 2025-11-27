# Integração WAHA (WhatsApp HTTP API)

Este documento descreve a integração completa entre o frontend Angular e o backend .NET para gerenciamento de sessões WhatsApp via WAHA.

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquivos Criados](#arquivos-criados)
3. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
4. [Como Usar](#como-usar)
5. [Endpoints Integrados](#endpoints-integrados)

## 🎯 Visão Geral

A integração permite que a aplicação Angular se conecte ao backend .NET para gerenciar sessões WhatsApp através da API WAHA. O sistema fornece:

- **Conexão WhatsApp**: Iniciar e gerenciar sessões WhatsApp
- **QR Code**: Geração e atualização de QR Codes para autenticação
- **Monitoramento**: Polling inteligente para verificar status da conexão
- **Informações da Conta**: Obter dados da conta WhatsApp conectada

## 📁 Arquivos Criados

### 1. Modelos TypeScript
**Arquivo**: `src/app/Models/Objetos/waha.model.ts`

Define todas as interfaces e tipos para comunicação com a API WAHA:
- `WAHAQRCodeResponse`: Resposta com QR Code
- `WAHAStatusResponse`: Status da sessão
- `WAHASessionStatus`: Enum com estados possíveis
- `WAHAActionResponse`: Resultado de ações
- `WAHASessionInfo`: Informações da sessão
- `WAHAAccountInfo`: Dados da conta conectada
- `WAHAHealthInfo`: Saúde do sistema

### 2. Service de API
**Arquivo**: `src/app/Service/Api/waha.service.ts`

Service Angular que se comunica com o backend:

#### Métodos Principais:

```typescript
// Gerenciamento de Sessão
iniciarSessao(sessionName: string): Promise<WAHAQRCodeResponse>
obterQRCode(sessionName: string): Promise<WAHAQRCodeResponse>
obterStatus(sessionName: string): Promise<WAHAStatusResponse>
pararSessao(sessionName: string): Promise<WAHAActionResponse>
removerSessao(sessionName: string): Promise<WAHAActionResponse>
reiniciarSessao(sessionName: string): Promise<WAHAActionResponse>
listarSessoes(): Promise<WAHASessionInfo[]>
obterInformacoesConta(sessionName: string): Promise<WAHAAccountInfo>

// Utilitários
verificarSaude(): Promise<WAHAHealthInfo>
estaConectado(sessionName: string): Promise<boolean>
aguardarConexao(sessionName: string, timeoutMs?, intervalMs?): Promise<boolean>
getNomeSessaoPadrao(): string
```

### 3. Componente Atualizado
**Arquivo**: `src/app/Pages/whatsapp-config/whatsapp-config.ts`

Componente completamente refatorado para usar a API real:

#### Funcionalidades Implementadas:

1. **Carregamento Inicial**
   - Verifica status da sessão existente
   - Carrega informações da conta se conectado
   - Inicia monitoramento automático

2. **Iniciar Conexão**
   - Cria nova sessão WAHA
   - Exibe QR Code para escaneamento
   - Aumenta frequência de polling

3. **Monitoramento Inteligente**
   - Polling a cada 5 segundos (normal)
   - Polling a cada 2 segundos (aguardando conexão)
   - Detecção automática de mudanças de estado
   - Notificações ao usuário

4. **Desconexão**
   - Para sessão WAHA
   - Limpa dados locais
   - Confirmação do usuário

5. **Atualização de QR Code**
   - Reinicia sessão para gerar novo QR
   - Busca QR Code atualizado

## 🔄 Fluxo de Funcionamento

### Conexão Inicial

```
1. Usuário acessa a página
   ↓
2. Component verifica status da sessão
   ↓
3. Se desconectado: Exibe botão "Conectar WhatsApp"
   ↓
4. Usuário clica em conectar
   ↓
5. Backend cria sessão e retorna QR Code
   ↓
6. QR Code é exibido na tela
   ↓
7. Polling rápido inicia (2s)
   ↓
8. Usuário escaneia QR Code no WhatsApp
   ↓
9. Status muda para WORKING (conectado)
   ↓
10. Informações da conta são carregadas
   ↓
11. Polling volta ao normal (5s)
```

### Monitoramento Contínuo

```
[Polling Loop]
   ↓
Verifica status a cada X segundos
   ↓
Status mudou? → Sim → Atualiza UI e notifica usuário
   ↓              ↓
   Não           Carrega informações se conectado
   ↓              ↓
Continua     Ajusta intervalo de polling
```

## 🚀 Como Usar

### 1. Na Aplicação

1. **Navegar para Configuração WhatsApp**
   ```
   /whatsapp-config
   ```

2. **Conectar WhatsApp**
   - Clique em "Conectar WhatsApp"
   - Aguarde o QR Code aparecer
   - Abra WhatsApp no celular
   - Vá em: Mais opções → Aparelhos conectados → Conectar um aparelho
   - Escaneie o QR Code
   - Aguarde a confirmação de conexão

3. **Verificar Status**
   - O sistema monitora automaticamente
   - Status é atualizado em tempo real
   - Notificações aparecem quando o estado muda

4. **Desconectar**
   - Clique em "Desconectar"
   - Confirme a ação
   - Sessão será encerrada

### 2. Programaticamente

```typescript
import { WahaService } from './Service/Api/waha.service';

constructor(private wahaService: WahaService) {}

async conectarWhatsApp() {
  try {
    // Obter nome da sessão (baseado na empresa)
    const sessionName = this.wahaService.getNomeSessaoPadrao();

    // Iniciar sessão e obter QR Code
    const qrResponse = await this.wahaService.iniciarSessao(sessionName);
    console.log('QR Code:', qrResponse.qrCode);

    // Aguardar conexão (timeout de 60s)
    const conectado = await this.wahaService.aguardarConexao(sessionName, 60000);

    if (conectado) {
      // Obter informações da conta
      const accountInfo = await this.wahaService.obterInformacoesConta(sessionName);
      console.log('Conta conectada:', accountInfo);
    }
  } catch (error) {
    console.error('Erro ao conectar:', error);
  }
}
```

## 🔌 Endpoints Integrados

### Backend Controller: `WAHAController.cs`
**Base URL**: `/api/whatsapp`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/sessao/{sessionName}/iniciar` | Inicia nova sessão e retorna QR Code |
| GET | `/sessao/{sessionName}/qrcode` | Obtém QR Code de sessão existente |
| GET | `/sessao/{sessionName}/status` | Verifica status da sessão |
| POST | `/sessao/{sessionName}/parar` | Para/desconecta sessão |
| DELETE | `/sessao/{sessionName}` | Remove sessão permanentemente |
| POST | `/sessao/{sessionName}/reiniciar` | Reinicia sessão |
| GET | `/sessoes` | Lista todas as sessões |
| GET | `/sessao/{sessionName}/conta` | Informações da conta conectada |
| GET | `/health` | Verifica saúde do WAHA (público) |

### Estados da Sessão (WAHASessionStatus)

| Status | Descrição | UI Status |
|--------|-----------|-----------|
| `STARTING` | Sessão iniciando | `connecting` |
| `SCAN_QR_CODE` | Aguardando QR Code | `qr` |
| `WORKING` | Conectado e funcionando | `connected` |
| `FAILED` | Sessão falhou | `error` |
| `STOPPED` | Sessão parada | `disconnected` |

## ⚙️ Configurações

### Intervalos de Polling

```typescript
// Polling normal (sessão estável)
POLLING_INTERVAL_MS = 5000 // 5 segundos

// Polling rápido (aguardando conexão)
POLLING_FAST_INTERVAL_MS = 2000 // 2 segundos
```

### Nome da Sessão

O nome da sessão é baseado no ID da empresa do usuário logado:
- Formato: `empresa-{empresaId}`
- Exemplo: `empresa-123e4567-e89b-12d3-a456-426614174000`

## 🎨 UI States

### Status da Conexão

```scss
// Classes CSS aplicadas dinamicamente
.status-connected   // WhatsApp conectado (verde)
.status-qr          // Aguardando QR Code (amarelo)
.status-connecting  // Conectando (azul)
.status-error       // Erro na conexão (vermelho)
.status-disconnected // Desconectado (cinza)
```

### Ícones Material

- `check_circle`: Conectado
- `qr_code_2`: Aguardando QR Code
- `sync`: Conectando (rotação animada)
- `error`: Erro
- `power_settings_new`: Desconectado

## 📝 Notas Importantes

1. **Nome da Sessão**: É único por empresa. Usar o mesmo nome reconecta à sessão existente.

2. **QR Code Timeout**: O QR Code expira após 30-60 segundos. Use "Atualizar QR Code" se necessário.

3. **Telefone**: O número do telefone é obtido automaticamente do WhatsApp conectado e não pode ser editado manualmente.

4. **Persistência**: As sessões WAHA persistem mesmo após restart da aplicação.

5. **Cleanup**: Use `ngOnDestroy` para parar o polling quando o componente for destruído.

## 🔐 Segurança

- Todos os endpoints (exceto `/health`) requerem autenticação via JWT
- Headers incluem `Authorization: Bearer {token}`
- Token é obtido do LocalStorage automaticamente

## 🐛 Troubleshooting

### Erro: "Sessão não encontrada"
- A sessão ainda não foi criada
- Use `iniciarSessao()` primeiro

### Erro: "QR Code expirado"
- Clique em "Atualizar QR Code"
- Ou reinicie a sessão

### Status não atualiza
- Verifique se o polling está ativo
- Verifique console do navegador por erros
- Verifique se o backend WAHA está rodando

### Conexão cai constantemente
- Verifique a conexão de internet
- Verifique logs do backend WAHA
- Pode ser necessário remover e recriar a sessão

---

**Desenvolvido para**: Alvim - Atendimento ao Cliente
**Última atualização**: 2025-11-10
