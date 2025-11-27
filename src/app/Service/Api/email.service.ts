import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../Environment/Environment';
import { LocalStorageService } from '../Local/local-storage';
import { ApiResponse } from '../../Models/Objetos/resposta.model';
import { SpinnerService } from '../Local/spinner';

// ==================== INTERFACES ====================

export interface EnviarEmailRequest {
  destinatarios: string[];
  assunto: string;
  corpo: string;
  corpoHTML?: boolean;
  destinatariosCopiaOculta?: string[];
  emailRemetente?: string;
  nomeRemetente?: string;
  anexos?: AnexoEmail[];
}

export interface AnexoEmail {
  nomeArquivo: string;
  conteudoBase64: string;
  tipoMime: string;
}

export interface EnviarEmailResponse {
  sucesso: boolean;
  mensagem: string;
  idEnvio?: string;
  dataEnvio: Date;
  erro?: string;
}

export interface EmailTemplate {
  tipo: 'boas-vindas' | 'recuperacao-senha' | 'confirmacao-cadastro' | 'notificacao' | 'relatorio';
  destinatario: string;
  dados: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly CLIENT_API = environment.url_Client;
  private readonly ADMIN_API = environment.url_ADMIN;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private spinnerService: SpinnerService
  ) {}

  // ==================== HEADERS ====================

  private getHeaders(): HttpHeaders {
    const token = this.localStorageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== ENVIO DE EMAIL ====================

  /**
   * Envia email personalizado
   */
  async enviarEmail(request: EnviarEmailRequest): Promise<EnviarEmailResponse> {
    this.spinnerService.show();

    try {
      const headers = this.getHeaders();
      const response = await firstValueFrom(
        this.http.post<ApiResponse<EnviarEmailResponse>>(
          `${this.CLIENT_API}/Email/Enviar`,
          request,
          { headers }
        )
      );

      if (response.sucesso) {
        return response.data;
      }

      throw new Error(response.mensagem || 'Erro ao enviar email');
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      throw new Error(
        error.error?.mensagem ||
        error.message ||
        'Erro ao enviar email'
      );
    } finally {
      this.spinnerService.hidden();
    }
  }

  /**
   * Envia email simples (texto plano)
   */
  async enviarEmailSimples(
    destinatario: string,
    assunto: string,
    corpo: string
  ): Promise<EnviarEmailResponse> {
    return this.enviarEmail({
      destinatarios: [destinatario],
      assunto,
      corpo,
      corpoHTML: false
    });
  }

  /**
   * Envia email HTML
   */
  async enviarEmailHTML(
    destinatarios: string[],
    assunto: string,
    corpoHTML: string
  ): Promise<EnviarEmailResponse> {
    return this.enviarEmail({
      destinatarios,
      assunto,
      corpo: corpoHTML,
      corpoHTML: true
    });
  }

  /**
   * Envia email com anexos
   */
  async enviarEmailComAnexos(
    destinatarios: string[],
    assunto: string,
    corpo: string,
    anexos: AnexoEmail[]
  ): Promise<EnviarEmailResponse> {
    return this.enviarEmail({
      destinatarios,
      assunto,
      corpo,
      corpoHTML: true,
      anexos
    });
  }

  // ==================== EMAILS DE TEMPLATE ====================

  /**
   * Envia email de boas-vindas
   */
  async enviarEmailBoasVindas(
    destinatario: string,
    nomeUsuario: string
  ): Promise<EnviarEmailResponse> {
    const corpoHTML = this.gerarTemplateBoasVindas(nomeUsuario);

    return this.enviarEmailHTML(
      [destinatario],
      'Bem-vindo ao AI Agent!',
      corpoHTML
    );
  }

  /**
   * Envia email de recuperação de senha
   */
  async enviarEmailRecuperacaoSenha(
    destinatario: string,
    nomeUsuario: string,
    tokenRecuperacao: string
  ): Promise<EnviarEmailResponse> {
    const corpoHTML = this.gerarTemplateRecuperacaoSenha(nomeUsuario, tokenRecuperacao);

    return this.enviarEmailHTML(
      [destinatario],
      'Recuperação de Senha - AI Agent',
      corpoHTML
    );
  }

  /**
   * Envia email de confirmação de cadastro
   */
  async enviarEmailConfirmacaoCadastro(
    destinatario: string,
    nomeUsuario: string,
    linkConfirmacao: string
  ): Promise<EnviarEmailResponse> {
    const corpoHTML = this.gerarTemplateConfirmacaoCadastro(nomeUsuario, linkConfirmacao);

    return this.enviarEmailHTML(
      [destinatario],
      'Confirme seu cadastro - AI Agent',
      corpoHTML
    );
  }

  /**
   * Envia email de notificação
   */
  async enviarEmailNotificacao(
    destinatario: string,
    titulo: string,
    mensagem: string
  ): Promise<EnviarEmailResponse> {
    const corpoHTML = this.gerarTemplateNotificacao(titulo, mensagem);

    return this.enviarEmailHTML(
      [destinatario],
      titulo,
      corpoHTML
    );
  }

  // ==================== TEMPLATES HTML ====================

  private gerarTemplateBoasVindas(nomeUsuario: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F85FF, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #4F85FF; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo ao AI Agent!</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${nomeUsuario}</strong>!</p>
            <p>É um prazer tê-lo conosco! Seu cadastro foi realizado com sucesso.</p>
            <p>Com o AI Agent, você poderá:</p>
            <ul>
              <li>Automatizar atendimento via WhatsApp</li>
              <li>Gerenciar conversas em tempo real</li>
              <li>Analisar métricas e sentimentos</li>
              <li>Criar templates de respostas</li>
            </ul>
            <p>Pronto para começar?</p>
            <a href="${environment.url_Client}/dashboard" class="button">Acessar Dashboard</a>
          </div>
          <div class="footer">
            <p>AI Agent - Atendimento Inteligente com IA</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private gerarTemplateRecuperacaoSenha(nomeUsuario: string, token: string): string {
    const linkRecuperacao = `${environment.url_Client}/recuperar-senha?token=${token}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F85FF, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #4F85FF; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperação de Senha</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${nomeUsuario}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${linkRecuperacao}" class="button">Redefinir Senha</a>
            <div class="alert">
              <strong>Atenção:</strong> Este link expira em 1 hora por segurança.
            </div>
            <p>Se você não solicitou esta recuperação, ignore este email.</p>
          </div>
          <div class="footer">
            <p>AI Agent - Atendimento Inteligente com IA</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private gerarTemplateConfirmacaoCadastro(nomeUsuario: string, linkConfirmacao: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F85FF, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Confirme seu Cadastro</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${nomeUsuario}</strong>!</p>
            <p>Estamos quase lá! Para ativar sua conta, clique no botão abaixo:</p>
            <a href="${linkConfirmacao}" class="button">Confirmar Cadastro</a>
            <p>Após a confirmação, você terá acesso completo ao AI Agent.</p>
          </div>
          <div class="footer">
            <p>AI Agent - Atendimento Inteligente com IA</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private gerarTemplateNotificacao(titulo: string, mensagem: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F85FF, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${titulo}</h1>
          </div>
          <div class="content">
            ${mensagem}
          </div>
          <div class="footer">
            <p>AI Agent - Atendimento Inteligente com IA</p>
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
