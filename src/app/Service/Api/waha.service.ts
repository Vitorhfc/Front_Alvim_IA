import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../Environment/Environment';
import { BaseApiService } from './base-api.service';
import { LocalStorageService } from '../Local/local-storage';
import {
  WAHAQRCodeResponse,
  WAHAStatusResponse,
  WAHAActionResponse,
  WAHASessionInfo,
  WAHAAccountInfo,
  WAHAHealthInfo,
  WAHASessionStatus
} from '../../Models/Objetos/waha.model';

/**
 * Service para integração com a API WAHA (WhatsApp HTTP API)
 * Endpoints: /api/whatsapp
 * Controller: WAHAController.cs
 */
@Injectable({
  providedIn: 'root'
})
export class WahaService extends BaseApiService {
  protected override baseUrl = environment.url_Client;
  private readonly apiPrefix = '/whatsapp';

  constructor(
    protected override http: HttpClient,
    protected override localStorageService: LocalStorageService
  ) {
    super(http, localStorageService);
  }

  // ==================== GERENCIAMENTO DE SESSÃO ====================

  /**
   * Inicia uma nova sessão do WhatsApp e retorna o QR Code para escaneamento
   * @param sessionName Nome único da sessão (recomendado usar o ID do cliente/empresa)
   * @returns QR Code para escaneamento no WhatsApp
   */
  async iniciarSessao(sessionName: string): Promise<WAHAQRCodeResponse> {
    try {
      const response = await this.post<void, WAHAQRCodeResponse>(
        `${this.apiPrefix}/sessao/${sessionName}/iniciar`,
        null as any
      );

      // Mapeia 'qr' para 'qrCode' se necessário (compatibilidade com backend)
      if (response.qr && !response.qrCode) {
        response.qrCode = response.qr;
      }

      return response;
    } catch (error: any) {
      console.error('Erro ao iniciar sessão WAHA:', error);
      throw new Error(error.message || 'Erro ao iniciar sessão do WhatsApp');
    }
  }

  /**
   * Obtém o QR Code de uma sessão existente
   * @param sessionName Nome da sessão
   * @returns QR Code da sessão
   */
  async obterQRCode(sessionName: string): Promise<WAHAQRCodeResponse> {
    try {
      const response = await this.get<WAHAQRCodeResponse>(
        `${this.apiPrefix}/sessao/${sessionName}/qrcode`
      );

      // Mapeia 'qr' para 'qrCode' se necessário (compatibilidade com backend)
      if (response.qr && !response.qrCode) {
        response.qrCode = response.qr;
      }

      return response;
    } catch (error: any) {
      console.error('Erro ao obter QR Code:', error);
      throw new Error(error.message || 'Erro ao obter QR Code');
    }
  }

  /**
   * Verifica o status de uma sessão WAHA
   * @param sessionName Nome da sessão
   * @returns Status atual da sessão (STARTING, SCAN_QR_CODE, WORKING, FAILED, STOPPED)
   */
  async obterStatus(sessionName: string): Promise<WAHAStatusResponse> {
    try {
      return await this.get<WAHAStatusResponse>(
        `${this.apiPrefix}/sessao/${sessionName}/status`
      );
    } catch (error: any) {
      console.error('Erro ao obter status da sessão:', error);
      throw new Error(error.message || 'Erro ao verificar status da sessão');
    }
  }

  /**
   * Para/desconecta uma sessão WAHA ativa
   * @param sessionName Nome da sessão
   * @returns Resultado da operação
   */
  async pararSessao(sessionName: string): Promise<WAHAActionResponse> {
    try {
      return await this.post<void, WAHAActionResponse>(
        `${this.apiPrefix}/sessao/${sessionName}/parar`,
        null as any
      );
    } catch (error: any) {
      console.error('Erro ao parar sessão:', error);
      throw new Error(error.message || 'Erro ao parar sessão do WhatsApp');
    }
  }

  /**
   * Remove completamente uma sessão WAHA
   * ATENÇÃO: Esta operação remove permanentemente a sessão e todos os seus dados
   * @param sessionName Nome da sessão
   * @returns Resultado da operação
   */
  async removerSessao(sessionName: string): Promise<WAHAActionResponse> {
    try {
      const result = await this.delete<WAHAActionResponse>(
        `${this.apiPrefix}/sessao/${sessionName}`
      );

      // Se o delete retornar void, cria uma resposta padrão
      if (!result) {
        return {
          success: true,
          message: 'Sessão removida com sucesso',
          sessionName: sessionName,
          timestamp: new Date()
        };
      }

      return result;
    } catch (error: any) {
      console.error('Erro ao remover sessão:', error);
      throw new Error(error.message || 'Erro ao remover sessão do WhatsApp');
    }
  }

  /**
   * Reinicia uma sessão WAHA existente
   * @param sessionName Nome da sessão
   * @returns Resultado da operação
   */
  async reiniciarSessao(sessionName: string): Promise<WAHAActionResponse> {
    try {
      return await this.post<void, WAHAActionResponse>(
        `${this.apiPrefix}/sessao/${sessionName}/reiniciar`,
        null as any
      );
    } catch (error: any) {
      console.error('Erro ao reiniciar sessão:', error);
      throw new Error(error.message || 'Erro ao reiniciar sessão do WhatsApp');
    }
  }

  /**
   * Lista todas as sessões WAHA disponíveis
   * @returns Lista de sessões
   */
  async listarSessoes(): Promise<WAHASessionInfo[]> {
    try {
      return await this.get<WAHASessionInfo[]>(
        `${this.apiPrefix}/sessoes`
      );
    } catch (error: any) {
      console.error('Erro ao listar sessões:', error);
      throw new Error(error.message || 'Erro ao listar sessões do WhatsApp');
    }
  }

  /**
   * Obtém informações da conta conectada em uma sessão
   * @param sessionName Nome da sessão
   * @returns Informações da conta
   */
  async obterInformacoesConta(sessionName: string): Promise<WAHAAccountInfo> {
    try {
      return await this.get<WAHAAccountInfo>(
        `${this.apiPrefix}/sessao/${sessionName}/conta`
      );
    } catch (error: any) {
      console.error('Erro ao obter informações da conta:', error);
      throw new Error(error.message || 'Erro ao obter informações da conta');
    }
  }

  // ==================== SAÚDE E UTILITÁRIOS ====================

  /**
   * Verifica se há sessões ativas e retorna informações de saúde do WAHA
   * @returns Informações sobre sessões ativas
   */
  async verificarSaude(): Promise<WAHAHealthInfo> {
    try {
      return await this.getPublic<WAHAHealthInfo>(
        `${this.apiPrefix}/health`
      );
    } catch (error: any) {
      console.error('Erro ao verificar saúde do WAHA:', error);
      throw new Error(error.message || 'Erro ao verificar status do WAHA');
    }
  }

  // ==================== HELPERS ====================

  /**
   * Verifica se uma sessão está conectada
   * @param sessionName Nome da sessão
   * @returns true se conectada, false caso contrário
   */
  async estaConectado(sessionName: string): Promise<boolean> {
    try {
      const status = await this.obterStatus(sessionName);
      return status.status === WAHASessionStatus.WORKING;
    } catch (error) {
      return false;
    }
  }

  /**
   * Aguarda até que a sessão esteja conectada ou falhe
   * @param sessionName Nome da sessão
   * @param timeoutMs Timeout em milissegundos (padrão: 60000 - 1 minuto)
   * @param intervalMs Intervalo de verificação em milissegundos (padrão: 2000 - 2 segundos)
   * @returns true se conectou, false se timeout ou falhou
   */
  async aguardarConexao(
    sessionName: string,
    timeoutMs: number = 60000,
    intervalMs: number = 2000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.obterStatus(sessionName);

        if (status.status === WAHASessionStatus.WORKING) {
          return true;
        }

        if (status.status === WAHASessionStatus.FAILED) {
          return false;
        }

        // Aguarda antes da próxima verificação
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    return false;
  }

  /**
   * Gera um nome de sessão no padrão Alvim_{empresaId}_{ddMMyyyy}
   * @param empresaId ID da empresa
   * @returns Nome da sessão gerado
   */
  async gerarNomeSessao(empresaId: string): Promise<string> {
    try {
      // A API retorna o objeto padrão { sucesso, mensagem, data }
      // Então usamos any e extraímos o data
      const response: any = await this.get<any>(
        `${this.apiPrefix}/sessao/gerar-nome/${empresaId}`
      );

      // Se a resposta tem a propriedade data, retorna ela (que é a string do nome)
      if (response && typeof response === 'string') {
        // Caso a API retorne diretamente a string (improvável, mas seguro)
        return response;
      } else if (response && response.data) {
        // Formato padrão da API: { sucesso, mensagem, data }
        return response.data;
      }

      throw new Error('Resposta inválida do servidor');
    } catch (error: any) {
      console.error('Erro ao gerar nome da sessão:', error);
      // Fallback: gera localmente se o backend falhar
      const dataAtual = new Date();
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const ano = dataAtual.getFullYear();
      return `Alvim_${empresaId}_${dia}${mes}${ano}`;
    }
  }

  /**
   * Obtém o nome padrão da sessão baseado na empresa do usuário logado
   * @returns Nome da sessão gerado no padrão Alvim_{empresaId}_{ddMMyyyy}
   */
  async getNomeSessaoPadrao(): Promise<string> {
    const empresaId = this.localStorageService.getEmpresaId();
    if (!empresaId) {
      return 'default-session';
    }
    return await this.gerarNomeSessao(empresaId);
  }
}
