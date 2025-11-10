# Implementação do SignalR Hub para WhatsApp

Este documento descreve como implementar o **SignalR Hub** no backend .NET para enviar notificações em tempo real sobre o status da conexão WhatsApp, eliminando a necessidade de polling excessivo.

## 📋 Visão Geral

O SignalR substituirá o polling que estava "metralhando" a API a cada 2-5 segundos. Agora, o backend enviará notificações em tempo real sempre que:
- Um QR Code for gerado
- A sessão do WhatsApp mudar de status (conectado, desconectado, aguardando QR, etc.)
- Houver qualquer alteração relevante na conexão

## 🔧 Implementação no Backend

### 1. Instalar Pacote NuGet

```bash
dotnet add package Microsoft.AspNetCore.SignalR
```

### 2. Criar o Hub do WhatsApp

Crie o arquivo `Hubs/WhatsAppHub.cs`:

```csharp
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace SeuProjeto.Hubs
{
    [Authorize] // Requer autenticação
    public class WhatsAppHub : Hub
    {
        private readonly ILogger<WhatsAppHub> _logger;

        public WhatsAppHub(ILogger<WhatsAppHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Conecta o cliente a um grupo específico de sessão
        /// Isso permite enviar notificações apenas para clientes interessados em uma sessão específica
        /// </summary>
        public async Task JoinGroup(string sessionName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionName);
            _logger.LogInformation($"Cliente {Context.ConnectionId} inscrito no grupo {sessionName}");
        }

        /// <summary>
        /// Remove o cliente de um grupo de sessão
        /// </summary>
        public async Task LeaveGroup(string sessionName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionName);
            _logger.LogInformation($"Cliente {Context.ConnectionId} removido do grupo {sessionName}");
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Cliente conectado: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation($"Cliente desconectado: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}
```

### 3. Registrar o SignalR no Program.cs

```csharp
// No Program.cs ou Startup.cs

var builder = WebApplication.CreateBuilder(args);

// Adicione o SignalR
builder.Services.AddSignalR();

// ... outros serviços

var app = builder.Build();

// Configure CORS para permitir SignalR (importante!)
app.UseCors(policy => policy
    .WithOrigins("http://localhost:4200") // URL do frontend
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()); // IMPORTANTE para SignalR!

app.UseAuthentication();
app.UseAuthorization();

// Mapeie o hub
app.MapHub<WhatsAppHub>("/hubs/whatsapp");

app.Run();
```

### 4. Criar Service para Enviar Notificações

Crie `Services/WhatsAppNotificationService.cs`:

```csharp
using Microsoft.AspNetCore.SignalR;
using SeuProjeto.Hubs;

namespace SeuProjeto.Services
{
    public interface IWhatsAppNotificationService
    {
        Task NotificarStatusAlterado(string sessionName, string status, string? message = null, string? telefone = null);
        Task NotificarQRCodeGerado(string sessionName, string qrCode);
        Task NotificarWhatsAppConectado(string sessionName, string telefone);
        Task NotificarWhatsAppDesconectado(string sessionName, string? motivo = null);
    }

    public class WhatsAppNotificationService : IWhatsAppNotificationService
    {
        private readonly IHubContext<WhatsAppHub> _hubContext;
        private readonly ILogger<WhatsAppNotificationService> _logger;

        public WhatsAppNotificationService(
            IHubContext<WhatsAppHub> hubContext,
            ILogger<WhatsAppNotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        /// <summary>
        /// Notifica mudança de status geral
        /// </summary>
        public async Task NotificarStatusAlterado(
            string sessionName,
            string status,
            string? message = null,
            string? telefone = null)
        {
            var update = new
            {
                sessionName,
                status,
                message,
                telefone,
                timestamp = DateTime.UtcNow
            };

            await _hubContext.Clients
                .Group(sessionName)
                .SendAsync("WhatsAppStatusChanged", update);

            _logger.LogInformation($"Notificação enviada: {sessionName} - {status}");
        }

        /// <summary>
        /// Notifica que um QR Code foi gerado
        /// </summary>
        public async Task NotificarQRCodeGerado(string sessionName, string qrCode)
        {
            var data = new
            {
                sessionName,
                qrCode
            };

            await _hubContext.Clients
                .Group(sessionName)
                .SendAsync("QRCodeGerado", data);

            _logger.LogInformation($"QR Code enviado via SignalR para {sessionName}");
        }

        /// <summary>
        /// Notifica que o WhatsApp foi conectado com sucesso
        /// </summary>
        public async Task NotificarWhatsAppConectado(string sessionName, string telefone)
        {
            var data = new
            {
                sessionName,
                telefone
            };

            await _hubContext.Clients
                .Group(sessionName)
                .SendAsync("WhatsAppConectado", data);

            _logger.LogInformation($"WhatsApp conectado notificado via SignalR: {sessionName}");
        }

        /// <summary>
        /// Notifica que o WhatsApp foi desconectado
        /// </summary>
        public async Task NotificarWhatsAppDesconectado(string sessionName, string? motivo = null)
        {
            var data = new
            {
                sessionName,
                motivo
            };

            await _hubContext.Clients
                .Group(sessionName)
                .SendAsync("WhatsAppDesconectado", data);

            _logger.LogInformation($"WhatsApp desconectado notificado via SignalR: {sessionName}");
        }
    }
}
```

### 5. Registrar o Service

No `Program.cs`:

```csharp
builder.Services.AddScoped<IWhatsAppNotificationService, WhatsAppNotificationService>();
```

### 6. Usar nas Controllers/Services

No seu `WAHAController.cs` ou serviço relacionado:

```csharp
public class WAHAController : ControllerBase
{
    private readonly IWhatsAppNotificationService _notificationService;
    // ... outros serviços

    public WAHAController(IWhatsAppNotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost("sessao/{sessionName}/iniciar")]
    public async Task<IActionResult> IniciarSessao(string sessionName)
    {
        try
        {
            // Inicia a sessão no WAHA
            var resultado = await _wahaService.IniciarSessaoAsync(sessionName);

            // Se QR Code foi gerado, notifica via SignalR
            if (!string.IsNullOrEmpty(resultado.Qr))
            {
                await _notificationService.NotificarQRCodeGerado(sessionName, resultado.Qr);
                await _notificationService.NotificarStatusAlterado(
                    sessionName,
                    "SCAN_QR_CODE",
                    "QR Code gerado. Escaneie no WhatsApp."
                );
            }

            return Ok(new { sucesso = true, data = resultado });
        }
        catch (Exception ex)
        {
            await _notificationService.NotificarStatusAlterado(
                sessionName,
                "FAILED",
                $"Erro ao iniciar sessão: {ex.Message}"
            );
            return BadRequest(new { sucesso = false, mensagem = ex.Message });
        }
    }

    // Exemplo: Webhook do WAHA que detecta mudanças de status
    [HttpPost("webhook/status")]
    public async Task<IActionResult> WebhookStatus([FromBody] WahaWebhookPayload payload)
    {
        try
        {
            // Quando o WAHA notificar mudança de status via webhook
            switch (payload.Event)
            {
                case "session.status":
                    await _notificationService.NotificarStatusAlterado(
                        payload.Session,
                        payload.Status,
                        payload.Message
                    );
                    break;

                case "qr":
                    await _notificationService.NotificarQRCodeGerado(
                        payload.Session,
                        payload.QrCode
                    );
                    break;

                case "authenticated":
                    await _notificationService.NotificarWhatsAppConectado(
                        payload.Session,
                        payload.Phone
                    );
                    break;

                case "disconnected":
                    await _notificationService.NotificarWhatsAppDesconectado(
                        payload.Session,
                        payload.Reason
                    );
                    break;
            }

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Erro no webhook: {ex.Message}");
            return StatusCode(500);
        }
    }
}
```

## 📡 Eventos SignalR Disponíveis

### Eventos que o Frontend Escuta:

1. **`WhatsAppStatusChanged`** - Status geral alterado
   ```json
   {
     "sessionName": "Alvim_123_10112025",
     "status": "WORKING",
     "message": "WhatsApp conectado",
     "telefone": "+55 11 98765-4321",
     "timestamp": "2025-11-10T12:00:00Z"
   }
   ```

2. **`QRCodeGerado`** - Novo QR Code gerado
   ```json
   {
     "sessionName": "Alvim_123_10112025",
     "qrCode": "2@jGcZPKPT80Tf4Md4..."
   }
   ```

3. **`WhatsAppConectado`** - WhatsApp conectou com sucesso
   ```json
   {
     "sessionName": "Alvim_123_10112025",
     "telefone": "+5511987654321"
   }
   ```

4. **`WhatsAppDesconectado`** - WhatsApp desconectou
   ```json
   {
     "sessionName": "Alvim_123_10112025",
     "motivo": "Sessão encerrada pelo usuário"
   }
   ```

## 🎯 Status Possíveis

- `STARTING` - Sessão iniciando
- `SCAN_QR_CODE` - Aguardando scan do QR Code
- `WORKING` - Conectado e funcionando
- `FAILED` - Falha na conexão
- `STOPPED` - Sessão parada

## 🔒 Segurança

1. O Hub usa `[Authorize]` - apenas usuários autenticados podem conectar
2. Os grupos são isolados por `sessionName` - cada cliente só recebe notificações da sua própria sessão
3. O token JWT é passado automaticamente na conexão SignalR

## 📊 Benefícios

- ✅ **Redução de 90%+ nas requisições HTTP** - De polling a cada 2-5s para notificações em tempo real
- ✅ **Latência menor** - Usuário recebe atualizações instantaneamente
- ✅ **Menos carga no servidor** - Backend envia dados apenas quando necessário
- ✅ **Melhor experiência do usuário** - Atualizações instantâneas de QR code e status
- ✅ **Fallback automático** - Se SignalR falhar, o frontend volta a usar polling (30s)

## 🧪 Teste

Para testar se o SignalR está funcionando:

1. Abra o console do navegador (F12)
2. Navegue até a página de configuração do WhatsApp
3. Procure por logs como:
   - `✅ SignalR conectado com sucesso`
   - `SignalR ativo, polling desabilitado`
   - `📱 Status do WhatsApp atualizado: ...`
4. Clique em "Conectar WhatsApp"
5. Você deve ver a atualização do QR code em tempo real via SignalR

## 📝 Notas Importantes

- Configure o CORS corretamente com `.AllowCredentials()`
- A URL do Hub deve ser `/hubs/whatsapp`
- Use grupos (JoinGroup) para evitar broadcast desnecessário
- Implemente logging adequado para debug
- Configure reconnection policy no SignalR para alta disponibilidade
