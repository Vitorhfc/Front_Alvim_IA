# Documentação dos Serviços de Comunicação

## 📋 Visão Geral

Este documento descreve os serviços implementados para processamento de mensagens WhatsApp e envio de emails no sistema AI Agent.

---

## 📱 Serviço de Mensagens (MensagensService)

### Localização
`src/app/Service/Api/mensagens.service.ts`

### Descrição
Serviço responsável por enviar mensagens via WhatsApp (WAHA) e processar respostas da IA via N8N.

---

### Métodos Principais

#### 1. `enviarWhatsApp(request: EnviarWhatsAppRequest): Promise<EnviarWhatsAppResponse>`

Envia mensagem via WhatsApp usando a API WAHA.

**Parâmetros:**
```typescript
{
  numeroDestino: string;      // Formato: 5511999999999
  mensagem: string;            // Texto da mensagem
  tipo?: 'texto' | 'imagem' | 'audio' | 'video' | 'documento';
  urlMidia?: string;           // URL da mídia (se aplicável)
  nomeArquivo?: string;        // Nome do arquivo (para documentos)
}
```

**Retorno:**
```typescript
{
  sucesso: boolean;
  mensagem: string;
  idEnvio?: string;
  dataEnvio: Date;
  erro?: string;
}
```

**Exemplo de Uso:**
```typescript
const mensagensService = inject(MensagensService);

await mensagensService.enviarWhatsApp({
  numeroDestino: '5511999999999',
  mensagem: 'Olá! Como posso ajudar?',
  tipo: 'texto'
});
```

---

#### 2. `enviarMensagemTexto(numeroDestino: string, mensagem: string): Promise<EnviarWhatsAppResponse>`

Atalho para enviar mensagem de texto simples.

**Exemplo:**
```typescript
await mensagensService.enviarMensagemTexto(
  '5511999999999',
  'Sua mensagem aqui'
);
```

---

#### 3. `enviarMensagemComMidia(...): Promise<EnviarWhatsAppResponse>`

Envia mensagem com mídia anexada.

**Parâmetros:**
- `numeroDestino`: string
- `mensagem`: string
- `urlMidia`: string (URL do arquivo)
- `tipo`: 'imagem' | 'audio' | 'video' | 'documento'
- `nomeArquivo?`: string (opcional, para documentos)

**Exemplo:**
```typescript
await mensagensService.enviarMensagemComMidia(
  '5511999999999',
  'Aqui está o documento solicitado',
  'https://exemplo.com/arquivo.pdf',
  'documento',
  'relatorio.pdf'
);
```

---

#### 4. `processarMensagemN8N(request: ProcessarMensagemN8NRequest): Promise<RespostaIAResponse>`

Envia mensagem para processamento pela IA via N8N.

**Parâmetros:**
```typescript
{
  idEmpresa: string;
  idCliente: string;
  ultimaResposta: {
    idMensagem: string;
    flgMensagemCliente: boolean;
    dtRecebido: Date;
    mensagem: string;
    tipoMensagem: string;
  };
  listaUltimasMensagens: Array<...>;
  flgPrimeiraMensagemDoDia: boolean;
}
```

**Retorno:**
```typescript
{
  textoResposta: string;
  tipoResposta: string;
  urlAudio?: string;
  modeloUtilizado?: string;
  tokensUtilizados?: number;
  tempoProcessamentoMs?: number;
  modulosUtilizados?: string[];
  documentosConsultados?: string[];
  agendamentoGeradoId?: string;
}
```

**Exemplo:**
```typescript
const resposta = await mensagensService.processarMensagemN8N({
  idEmpresa: 'empresa-123',
  idCliente: 'cliente-456',
  ultimaResposta: {
    idMensagem: 'msg-789',
    flgMensagemCliente: true,
    dtRecebido: new Date(),
    mensagem: 'Quero agendar um horário',
    tipoMensagem: 'texto'
  },
  listaUltimasMensagens: [],
  flgPrimeiraMensagemDoDia: true
});

console.log('Resposta da IA:', resposta.textoResposta);
```

---

#### 5. Métodos Auxiliares

**`obterContextoProjeto(idCliente: string): Promise<string>`**
- Obtém contexto do projeto do cliente para IA

**`obterPlanoCliente(idCliente: string): Promise<{...}>`**
- Retorna features habilitadas no plano do cliente

**`listarDocumentosCliente(idCliente: string): Promise<Array<{...}>>`**
- Lista documentos disponíveis para IA consultar

---

## 📧 Serviço de Email (EmailService)

### Localização
`src/app/Service/Api/email.service.ts`

### Descrição
Serviço responsável por envio de emails personalizados e templates pré-definidos.

---

### Métodos Principais

#### 1. `enviarEmail(request: EnviarEmailRequest): Promise<EnviarEmailResponse>`

Envia email personalizado.

**Parâmetros:**
```typescript
{
  destinatarios: string[];             // Lista de emails
  assunto: string;                     // Assunto do email
  corpo: string;                       // Corpo do email
  corpoHTML?: boolean;                 // Default: false
  destinatariosCopiaOculta?: string[]; // BCC
  emailRemetente?: string;             // Remetente customizado
  nomeRemetente?: string;              // Nome do remetente
  anexos?: AnexoEmail[];               // Array de anexos
}
```

**Anexos:**
```typescript
interface AnexoEmail {
  nomeArquivo: string;
  conteudoBase64: string;
  tipoMime: string;
}
```

**Retorno:**
```typescript
{
  sucesso: boolean;
  mensagem: string;
  idEnvio?: string;
  dataEnvio: Date;
  erro?: string;
}
```

---

#### 2. `enviarEmailSimples(destinatario: string, assunto: string, corpo: string)`

Atalho para enviar email de texto plano.

**Exemplo:**
```typescript
const emailService = inject(EmailService);

await emailService.enviarEmailSimples(
  'usuario@exemplo.com',
  'Sua solicitação foi recebida',
  'Obrigado por entrar em contato. Em breve retornaremos.'
);
```

---

#### 3. `enviarEmailHTML(destinatarios: string[], assunto: string, corpoHTML: string)`

Envia email com HTML.

**Exemplo:**
```typescript
await emailService.enviarEmailHTML(
  ['usuario1@exemplo.com', 'usuario2@exemplo.com'],
  'Newsletter',
  '<h1>Bem-vindo!</h1><p>Conteúdo HTML aqui...</p>'
);
```

---

#### 4. `enviarEmailComAnexos(...)`

Envia email com arquivos anexados.

**Exemplo:**
```typescript
const anexo: AnexoEmail = {
  nomeArquivo: 'relatorio.pdf',
  conteudoBase64: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8...',
  tipoMime: 'application/pdf'
};

await emailService.enviarEmailComAnexos(
  ['cliente@exemplo.com'],
  'Relatório Mensal',
  '<p>Segue relatório em anexo.</p>',
  [anexo]
);
```

---

### Templates Pré-definidos

#### 1. `enviarEmailBoasVindas(destinatario: string, nomeUsuario: string)`

Email de boas-vindas após cadastro.

**Template inclui:**
- Saudação personalizada
- Lista de funcionalidades
- Botão para acessar dashboard
- Design responsivo com gradiente

**Exemplo:**
```typescript
await emailService.enviarEmailBoasVindas(
  'novousuario@exemplo.com',
  'João Silva'
);
```

---

#### 2. `enviarEmailRecuperacaoSenha(destinatario: string, nomeUsuario: string, tokenRecuperacao: string)`

Email para recuperação de senha.

**Template inclui:**
- Link com token de recuperação
- Aviso de expiração (1 hora)
- Alerta de segurança
- Design responsivo

**Exemplo:**
```typescript
const token = 'abc123xyz789'; // Token gerado pelo backend

await emailService.enviarEmailRecuperacaoSenha(
  'usuario@exemplo.com',
  'Maria Santos',
  token
);
```

---

#### 3. `enviarEmailConfirmacaoCadastro(destinatario: string, nomeUsuario: string, linkConfirmacao: string)`

Email para confirmar cadastro.

**Template inclui:**
- Botão de confirmação
- Link direto para ativação
- Design responsivo

**Exemplo:**
```typescript
const link = `https://app.exemplo.com/confirmar?token=${token}`;

await emailService.enviarEmailConfirmacaoCadastro(
  'usuario@exemplo.com',
  'Pedro Costa',
  link
);
```

---

#### 4. `enviarEmailNotificacao(destinatario: string, titulo: string, mensagem: string)`

Email genérico de notificação.

**Exemplo:**
```typescript
await emailService.enviarEmailNotificacao(
  'admin@exemplo.com',
  'Novo Cliente Cadastrado',
  '<p>Um novo cliente se cadastrou no sistema.</p><p><strong>Nome:</strong> João Silva</p>'
);
```

---

## 🎨 Personalização de Templates

Todos os templates HTML são gerados dinamicamente e incluem:

- **Design Responsivo**: Adapta-se a desktop e mobile
- **Gradiente Corporativo**: Azul (#4F85FF) e Roxo (#8B5CF6)
- **Botões CTA**: Call-to-action destacados
- **Footer Padrão**: Informações da empresa
- **Aviso de Email Automático**: Não responder

### Estrutura Básica dos Templates

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Estilos inline para compatibilidade */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <!-- Título com gradiente -->
    </div>
    <div class="content">
      <!-- Conteúdo personalizado -->
    </div>
    <div class="footer">
      <!-- Rodapé padrão -->
    </div>
  </div>
</body>
</html>
```

---

## 🔄 Integração com Spinner

Ambos os serviços integram automaticamente com o `SpinnerService`:

- `show()` é chamado no início da requisição
- `hidden()` é chamado no final (sucesso ou erro)
- Não é necessário gerenciar manualmente

---

## 🔐 Autenticação

Todos os métodos dos serviços:

- ✅ Incluem automaticamente o token JWT no header `Authorization`
- ✅ Obtém token do `LocalStorageService`
- ✅ Tratam erros de autenticação

---

## ⚠️ Tratamento de Erros

Padrão de erro retornado:

```typescript
try {
  await mensagensService.enviarMensagemTexto(...);
} catch (error: any) {
  // error.message contém mensagem amigável
  console.error('Erro:', error.message);

  // Exibir para usuário
  alert(error.message);
}
```

---

## 📍 Endpoints da API

### Mensagens
- `POST /api/WhatsApp/Enviar` - Enviar mensagem WhatsApp
- `POST /api/N8N/Processar-Mensagens` - Processar com IA
- `GET /api/N8N/Cliente/{id}/Contexto-Projeto` - Obter contexto
- `GET /api/N8N/Cliente/{id}/Plano` - Obter plano
- `GET /api/N8N/Cliente/{id}/Documentos` - Listar documentos

### Email
- `POST /api/Email/Enviar` - Enviar email customizado

---

## 💡 Exemplos Práticos

### Exemplo 1: Enviar Mensagem WhatsApp no Chat

```typescript
// No componente de conversas
import { MensagensService } from '../../Service/Api/mensagens.service';

export class ConversasComponent {
  constructor(private mensagensService: MensagensService) {}

  async enviarMensagem(): Promise<void> {
    if (!this.novaMensagem.trim()) return;

    try {
      await this.mensagensService.enviarMensagemTexto(
        this.conversaSelecionada.clienteTelefone,
        this.novaMensagem
      );

      // Adicionar à lista local
      this.mensagens.push({
        texto: this.novaMensagem,
        isUsuario: true,
        horario: new Date().toLocaleTimeString()
      });

      this.novaMensagem = '';
    } catch (error: any) {
      alert('Erro ao enviar: ' + error.message);
    }
  }
}
```

---

### Exemplo 2: Processar Resposta com IA

```typescript
async processarComIA(mensagemCliente: string): Promise<void> {
  try {
    const resposta = await this.mensagensService.processarMensagemN8N({
      idEmpresa: this.empresaId,
      idCliente: this.clienteId,
      ultimaResposta: {
        idMensagem: generateId(),
        flgMensagemCliente: true,
        dtRecebido: new Date(),
        mensagem: mensagemCliente,
        tipoMensagem: 'texto'
      },
      listaUltimasMensagens: this.mensagens.map(m => ({...})),
      flgPrimeiraMensagemDoDia: this.isPrimeiraMensagem()
    });

    // Usar resposta da IA
    console.log('IA respondeu:', resposta.textoResposta);
    console.log('Modelo usado:', resposta.modeloUtilizado);
    console.log('Tokens:', resposta.tokensUtilizados);
  } catch (error: any) {
    console.error('Erro ao processar com IA:', error);
  }
}
```

---

### Exemplo 3: Email de Boas-vindas após Cadastro

```typescript
// No componente de cadastro
import { EmailService } from '../../Service/Api/email.service';

async onCadastro(): Promise<void> {
  try {
    // 1. Cadastrar usuário
    const usuario = await this.authService.cadastrarUsuario(...);

    // 2. Enviar email de boas-vindas
    await this.emailService.enviarEmailBoasVindas(
      usuario.email,
      usuario.nome
    );

    this.successMessage = 'Cadastro realizado! Verifique seu email.';
  } catch (error: any) {
    this.errorMessage = error.message;
  }
}
```

---

### Exemplo 4: Email com Anexo

```typescript
async enviarRelatorio(): Promise<void> {
  // Converter arquivo para base64
  const arquivoBase64 = await this.convertToBase64(file);

  const anexo: AnexoEmail = {
    nomeArquivo: 'relatorio.pdf',
    conteudoBase64: arquivoBase64,
    tipoMime: 'application/pdf'
  };

  await this.emailService.enviarEmailComAnexos(
    [this.cliente.email],
    'Relatório Mensal',
    '<h2>Relatório</h2><p>Segue relatório em anexo.</p>',
    [anexo]
  );
}

// Helper para converter arquivo
convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## 📚 Recursos Adicionais

- **Spinner**: Ativado automaticamente em todas as chamadas
- **Logs**: Console.error em caso de falhas
- **Tipagem**: TypeScript completo em todos os métodos
- **Promise-based**: Async/await para melhor legibilidade

---

**Versão**: 1.0.0
**Data**: Janeiro 2025
**Autor**: Equipe de Desenvolvimento AI Agent
