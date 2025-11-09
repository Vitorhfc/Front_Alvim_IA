# Fluxo de Autenticação - Sistema Alvim

## Visão Geral

O sistema de autenticação foi reconstruído para centralizar o processo em um único fluxo, com dois ambientes distintos:
- **CLIENT**: Ambiente de produção onde os usuários acessam as empresas
- **ADMIN**: Ambiente administrativo para cadastro de usuários e empresas

---

## FLUXO DE LOGIN

### 1. Login Inicial
**Componente**: `LoginComponent`
**Endpoint**: `POST /api/Autenticacao/login` (CLIENT)

```
Usuário insere:
- Email
- Senha
- Tipo de validação (0=Email, 1=WhatsApp)
```

**Resposta**:
```json
{
  "usuarioId": "690df391c4066150d1e1f898",
  "nome": "Vitor",
  "email": "vitorhfcampos@gmail.com",
  "requerValidacaoDuasEtapas": false,
  "temEmail": true,
  "temWhatsApp": true,
  "destinoEnvio": "v***********s@g****.com",
  "mensagem": "Token de validação enviado para seu email"
}
```

### 2. Validação 2FA
**Componente**: `Validacao2FAComponent`
**Endpoint**: `POST /api/Autenticacao/validar-token-2fa` (CLIENT)

```
Usuário insere:
- Token de 6 dígitos (recebido por email ou WhatsApp)
```

**Resposta**:
```json
{
  "sucesso": true,
  "mensagem": "Token validado com sucesso",
  "usuarioId": "690df391c4066150d1e1f898",
  "empresas": [
    {
      "empresaId": "690df402c4066150d1e1f899",
      "nomeEmpresa": "ProjetoVitor",
      "flgAdministrador": true
    }
  ]
}
```

### 3A. Seleção de Empresa Existente
**Componente**: `SelecaoEmpresaComponent`
**Endpoint**: `POST /api/Autenticacao/selecionar-empresa` (CLIENT)

```
Usuário seleciona uma empresa da lista
```

**Resposta**:
```json
{
  "usuarioId": "690df391c4066150d1e1f898",
  "empresaId": "690df402c4066150d1e1f899",
  "nome": "Vitor",
  "email": "vitorhfcampos@gmail.com",
  "flgAdministrador": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "kxUaUWwgKBfuUAXCReJkQrNqxenbnDNZ...",
  "dataExpiracao": "2025-11-10T15:43:31.2840541-03:00"
}
```

✅ **Token JWT final salvo → Redireciona para Dashboard**

---

### 3B. Criação de Nova Empresa

#### 3B.1. Login no ADMIN
**Componente**: `SelecaoEmpresaComponent`
**Endpoint**: `POST /api/Autenticacao/login-usuario` (ADMIN)

```
Sistema faz login automático no ADMIN com o usuarioId
```

**Resposta**:
```json
{
  "usuarioId": "690df391c4066150d1e1f898",
  "nome": "Vitor",
  "email": "vitorhfcampos@gmail.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "dataExpiracao": "2025-11-10T15:45:36.3692643-03:00"
}
```

⚠️ **Token ADM salvo temporariamente em `temp_admin_token`**

#### 3B.2. Cadastro de Empresa
**Componente**: `CadastroEmpresaComponent`
**Endpoint**: `POST /api/Empresa` (ADMIN)

```
Usuário preenche formulário:
- Razão Social
- Nome Fantasia
- CNPJ
- Email
- Endereço completo
```

**Resposta**:
```json
{
  "sucesso": true,
  "mensagem": "Empresa criada com sucesso",
  "data": {
    "id": "6910e224ca027ea60bfacfac",
    "razaoSocial": "RAZAO SOCIAL DA EMPRESA",
    "nome": "NOME DA EMPRESA",
    "cnpj": "99268368000100"
  }
}
```

#### 3B.3. Login Automático na Empresa Criada
**Componente**: `CadastroEmpresaComponent`
**Endpoint**: `POST /api/Autenticacao/selecionar-empresa` (CLIENT)

```
Sistema faz login automático no CLIENT com a empresa criada
```

**Resposta**: Mesma do passo 3A

✅ **Token JWT final salvo → Token ADM descartado → Redireciona para Dashboard**

---

## FLUXO DE CADASTRO

### 1. Cadastro de Usuário
**Componente**: `CadastroUsuarioComponent`
**Endpoint**: `POST /api/Usuario/cadastrar` (ADMIN)

```
Usuário preenche:
- Nome
- Email
- CPF
- Celular
- Senha
- Data de Nascimento
```

**Resposta**:
```json
{
  "sucesso": true,
  "mensagem": "Usuário cadastrado com sucesso",
  "data": {
    "id": "6910e2ecca027ea60bfacfaf",
    "nome": "TESTE NOVO USUARIO",
    "email": "51589957024@GMAIL.com",
    "cpf": "51589957024"
  }
}
```

### 2. Login no ADMIN
**Componente**: `CadastroUsuarioComponent` (automático)
**Endpoint**: `POST /api/Autenticacao/login-usuario` (ADMIN)

```
Sistema faz login automático no ADMIN com o usuarioId
```

⚠️ **Token ADM salvo temporariamente em `temp_admin_token`**

### 3. Cadastro de Empresa
**Componente**: `CadastroEmpresaComponent`

Mesmo fluxo do passo 3B.2 e 3B.3 do fluxo de login

✅ **Token JWT final salvo → Token ADM descartado → Redireciona para Dashboard**

---

## Componentes e Responsabilidades

### AuthContainerComponent
- **Responsabilidade**: Gerencia o estado global de autenticação
- **Funcionalidade**: Controla navegação entre as etapas do fluxo
- **Estado**: `AuthState` com informações do usuário e etapa atual

### LoginComponent
- **Responsabilidade**: Tela de login inicial
- **Ação**: Envia credenciais e tipo de validação 2FA
- **Próxima etapa**: Validação 2FA

### Validacao2FAComponent
- **Responsabilidade**: Validação do token de 6 dígitos
- **Ação**: Valida token e recebe lista de empresas
- **Próxima etapa**: Seleção de empresa

### SelecaoEmpresaComponent
- **Responsabilidade**: Seleção ou criação de empresa
- **Ações**:
  - Selecionar empresa existente → Login no CLIENT → Dashboard
  - Criar nova empresa → Login no ADMIN → Cadastro de empresa

### CadastroEmpresaComponent
- **Responsabilidade**: Formulário de cadastro de empresa
- **Requisito**: Token ADM válido
- **Ação**: Cadastra empresa no ADMIN e faz login automático no CLIENT
- **Próxima etapa**: Dashboard

### CadastroUsuarioComponent
- **Responsabilidade**: Formulário de cadastro de novo usuário
- **Ações**:
  1. Cadastra usuário no ADMIN
  2. Faz login no ADMIN automaticamente
  3. Redireciona para cadastro de empresa

---

## Gerenciamento de Tokens

### Token CLIENT (Produção)
- **Armazenamento**: `localStorage.token`
- **Uso**: Acesso ao sistema de produção (empresas)
- **Duração**: Até expiração ou logout

### Token ADMIN (Temporário)
- **Armazenamento**: `localStorage.temp_admin_token`
- **Uso**: Cadastro de empresas apenas
- **Duração**: Até finalizar cadastro de empresa
- **Limpeza**: Automática após login no CLIENT

---

## Endpoints Utilizados

### CLIENT (Ambiente de Produção)
```
POST /api/Autenticacao/login
POST /api/Autenticacao/validar-token-2fa
POST /api/Autenticacao/selecionar-empresa
```

### ADMIN (Ambiente Administrativo)
```
POST /api/Usuario/cadastrar
POST /api/Autenticacao/login-usuario
POST /api/Empresa
```

---

## Fluxograma Simplificado

### FLUXO DE LOGIN
```
Login → Validação 2FA → Seleção de Empresa
                           ├─ Empresa Existente → Dashboard
                           └─ Nova Empresa → Login ADM → Cadastro Empresa → Login CLIENT → Dashboard
```

### FLUXO DE CADASTRO
```
Cadastro Usuário → Login ADM → Cadastro Empresa → Login CLIENT → Dashboard
```

---

## Segurança

1. **Separação de Ambientes**: CLIENT e ADMIN são ambientes distintos
2. **Token Temporário**: Token ADM é descartado após uso
3. **Validação 2FA**: Obrigatória para login (não para cadastro)
4. **Autenticação Automática**: Evita múltiplos logins manuais
5. **JWT**: Tokens seguros com expiração

---

## Próximos Passos para Teste

1. Testar fluxo completo de login com empresa existente
2. Testar fluxo de login com criação de nova empresa
3. Testar fluxo completo de cadastro de novo usuário
4. Verificar limpeza de tokens temporários
5. Testar validações e tratamento de erros
