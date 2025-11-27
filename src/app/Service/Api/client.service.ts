import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../Environment/Environment';
import { BaseApiService } from './base-api.service';
import { LocalStorageService } from '../Local/local-storage';

// Importar modelos de entidades do Cliente
import { Cliente } from '../../Models/Entidades/Client/Cliente';
import { Mensagem, MensagensClienteResponse } from '../../Models/Entidades/Client/Mensagem';
import { Agendamento } from '../../Models/Entidades/Client/Agendamento';
import { Arquivo } from '../../Models/Entidades/Client/Arquivo';
import { ConfiguracaoIA } from '../../Models/Entidades/Client/ConfiguracaoIa';
import { ProcessamentoIA } from '../../Models/Entidades/Client/ProcessamentoIa';
import { Funcionario } from '../../Models/Entidades/Client/Funcionario';
import { LogClient, LogClientPaginado } from '../../Models/Entidades/Client/LogClient';
import { LogWaha, LogWahaPaginado } from '../../Models/Entidades/Client/LogWaha';

/**
 * Service para integração com a API de Cliente
 * Endpoints: https://localhost:5002/api
 */
@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseApiService {
  protected override baseUrl = environment.url_Client;

  constructor(
    protected override http: HttpClient,
    protected override localStorageService: LocalStorageService
  ) {
    super(http, localStorageService);
  }

  // ==================== CLIENTE ====================

  /**
   * Lista todos os clientes da empresa
   */
  async listarClientes(): Promise<Cliente[]> {
    return this.get<Cliente[]>('/Cliente');
  }

  /**
   * Busca cliente por ID
   */
  async buscarClientePorId(id: string): Promise<Cliente> {
    return this.get<Cliente>(`/Cliente/${id}`);
  }

  /**
   * Busca cliente por telefone
   */
  async buscarClientePorTelefone(telefone: string): Promise<Cliente> {
    return this.get<Cliente>(`/Cliente/telefone/${telefone}`);
  }

  /**
   * Cadastra novo cliente
   */
  async cadastrarCliente(cliente: Partial<Cliente>): Promise<Cliente> {
    return this.post<Partial<Cliente>, Cliente>('/Cliente', cliente);
  }

  /**
   * Atualiza dados do cliente
   */
  async atualizarCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    return this.put<Partial<Cliente>, Cliente>(`/Cliente/${id}`, cliente);
  }

  /**
   * Remove cliente
   */
  async removerCliente(id: string): Promise<void> {
    return this.delete(`/Cliente/${id}`);
  }

  // ==================== MENSAGENS ====================

  /**
   * Lista mensagens de uma conversa com informações do cliente
   * @param clienteId ID do cliente
   * @param ordenacao Ordenação das mensagens: 'asc' (mais antigas primeiro) ou 'desc' (mais recentes primeiro)
   */
  async listarMensagensConversa(clienteId: string, ordenacao: 'asc' | 'desc' = 'asc'): Promise<MensagensClienteResponse> {
    return this.get<MensagensClienteResponse>(`/Cliente/${clienteId}/mensagens?ordenacao=${ordenacao}`);
  }

  /**
   * Busca mensagem por ID
   */
  async buscarMensagemPorId(id: string): Promise<Mensagem> {
    return this.get<Mensagem>(`/Mensagem/${id}`);
  }

  /**
   * Envia nova mensagem
   */
  async enviarMensagem(mensagem: Partial<Mensagem>): Promise<Mensagem> {
    return this.post<Partial<Mensagem>, Mensagem>('/Mensagem', mensagem);
  }

  /**
   * Marca mensagens como lidas
   */
  async marcarMensagensComoLidas(clienteId: string): Promise<void> {
    return this.patch(`/Mensagem/marcar-lidas/${clienteId}`, {});
  }

  /**
   * Busca mensagens não lidas de um cliente
   */
  async buscarMensagensNaoLidas(clienteId: string): Promise<Mensagem[]> {
    return this.get<Mensagem[]>(`/Mensagem/nao-lidas/${clienteId}`);
  }

  // ==================== AGENDAMENTOS ====================

  /**
   * Lista agendamentos do cliente
   */
  async listarAgendamentosCliente(clienteId: string): Promise<Agendamento[]> {
    return this.get<Agendamento[]>(`/Agendamento/cliente/${clienteId}`);
  }

  /**
   * Lista todos os agendamentos
   */
  async listarAgendamentos(dataInicio?: string, dataFim?: string): Promise<Agendamento[]> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<Agendamento[]>(`/Agendamento${query}`);
  }

  /**
   * Busca agendamento por ID
   */
  async buscarAgendamentoPorId(id: string): Promise<Agendamento> {
    return this.get<Agendamento>(`/Agendamento/${id}`);
  }

  /**
   * Cria novo agendamento
   */
  async criarAgendamento(agendamento: Partial<Agendamento>): Promise<Agendamento> {
    return this.post<Partial<Agendamento>, Agendamento>('/Agendamento', agendamento);
  }

  /**
   * Atualiza agendamento
   */
  async atualizarAgendamento(id: string, agendamento: Partial<Agendamento>): Promise<Agendamento> {
    return this.put<Partial<Agendamento>, Agendamento>(`/Agendamento/${id}`, agendamento);
  }

  /**
   * Cancela agendamento
   */
  async cancelarAgendamento(id: string): Promise<void> {
    return this.patch(`/Agendamento/${id}/cancelar`, {});
  }

  /**
   * Confirma agendamento
   */
  async confirmarAgendamento(id: string): Promise<void> {
    return this.patch(`/Agendamento/${id}/confirmar`, {});
  }

  // ==================== ARQUIVOS ====================

  /**
   * Lista arquivos de um cliente
   */
  async listarArquivosCliente(clienteId: string): Promise<Arquivo[]> {
    return this.get<Arquivo[]>(`/Arquivo/cliente/${clienteId}`);
  }

  /**
   * Busca arquivo por ID
   */
  async buscarArquivoPorId(id: string): Promise<Arquivo> {
    return this.get<Arquivo>(`/Arquivo/${id}`);
  }

  /**
   * Faz upload de arquivo
   */
  async uploadArquivo(formData: FormData): Promise<Arquivo> {
    // Para upload de arquivo, usa método customizado sem JSON
    const token = this.localStorageService.getToken();
    const headers = {
      'Authorization': token ? `Bearer ${token}` : ''
    };

    try {
      const response = await fetch(`${this.baseUrl}/Arquivo/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      const result = await response.json();

      if (!result.sucesso) {
        throw new Error(result.mensagem || 'Erro ao fazer upload');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer upload do arquivo');
    }
  }

  /**
   * Remove arquivo
   */
  async removerArquivo(id: string): Promise<void> {
    return this.delete(`/Arquivo/${id}`);
  }

  // ==================== CONFIGURAÇÃO IA ====================

  /**
   * Busca configuração de IA da empresa
   */
  async buscarConfiguracaoIa(): Promise<ConfiguracaoIA | null> {
    try {
      return await this.get<ConfiguracaoIA>('/ConfiguracaoIA');
    } catch (error) {
      console.log('Nenhuma configuração de IA encontrada');
      return null;
    }
  }

  /**
   * Cria configuração de IA da empresa
   */
  async criarConfiguracaoIa(config: Partial<ConfiguracaoIA>): Promise<ConfiguracaoIA> {
    return this.post<Partial<ConfiguracaoIA>, ConfiguracaoIA>('/ConfiguracaoIA', config);
  }

  /**
   * Atualiza configuração de IA
   */
  async atualizarConfiguracaoIa(id: string, config: Partial<ConfiguracaoIA>): Promise<ConfiguracaoIA> {
    return this.put<Partial<ConfiguracaoIA>, ConfiguracaoIA>(`/ConfiguracaoIA/${id}`, config);
  }

  /**
   * Testa configuração de IA com uma mensagem
   */
  async testarConfiguracaoIa(mensagemTeste: string): Promise<any> {
    return this.post('/ConfiguracaoIa/testar', { mensagem: mensagemTeste });
  }

  // ==================== PROCESSAMENTO IA ====================

  /**
   * Lista processamentos de IA
   */
  async listarProcessamentosIa(limit?: number, offset?: number): Promise<ProcessamentoIA[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<ProcessamentoIA[]>(`/ProcessamentoIa${query}`);
  }

  /**
   * Busca processamento de IA por ID
   */
  async buscarProcessamentoIaPorId(id: string): Promise<ProcessamentoIA> {
    return this.get<ProcessamentoIA>(`/ProcessamentoIa/${id}`);
  }

  /**
   * Lista processamentos de IA de um cliente
   */
  async listarProcessamentosIaPorCliente(clienteId: string): Promise<ProcessamentoIA[]> {
    return this.get<ProcessamentoIA[]>(`/ProcessamentoIa/cliente/${clienteId}`);
  }

  // ==================== FUNCIONÁRIOS ====================

  /**
   * Lista funcionários da empresa
   */
  async listarFuncionarios(): Promise<Funcionario[]> {
    return this.get<Funcionario[]>('/Funcionario');
  }

  /**
   * Busca funcionário por ID
   */
  async buscarFuncionarioPorId(id: string): Promise<Funcionario> {
    return this.get<Funcionario>(`/Funcionario/${id}`);
  }

  /**
   * Cadastra novo funcionário
   */
  async cadastrarFuncionario(funcionario: Partial<Funcionario>): Promise<Funcionario> {
    return this.post<Partial<Funcionario>, Funcionario>('/Funcionario', funcionario);
  }

  /**
   * Atualiza funcionário
   */
  async atualizarFuncionario(id: string, funcionario: Partial<Funcionario>): Promise<Funcionario> {
    return this.put<Partial<Funcionario>, Funcionario>(`/Funcionario/${id}`, funcionario);
  }

  /**
   * Remove funcionário
   */
  async removerFuncionario(id: string): Promise<void> {
    return this.delete(`/Funcionario/${id}`);
  }

  /**
   * Ativa/Desativa funcionário
   */
  async toggleStatusFuncionario(id: string, ativo: boolean): Promise<void> {
    return this.patch(`/Funcionario/${id}/status`, { ativo });
  }

  // ==================== LOGS ====================

  /**
   * Lista logs do cliente
   */
  async listarLogs(tipo?: string, dataInicio?: string, dataFim?: string): Promise<LogClient[]> {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<LogClient[]>(`/Log${query}`);
  }

  /**
   * Busca log por ID
   */
  async buscarLogPorId(id: string): Promise<LogClient> {
    return this.get<LogClient>(`/Log/${id}`);
  }

  /**
   * Lista logs do WAHA com paginação
   */
  async listarLogsWaha(page: number = 1, pageSize: number = 80): Promise<LogWahaPaginado> {
    return this.get<LogWahaPaginado>(`/Log/waha?page=${page}&pageSize=${pageSize}`);
  }

  /**
   * Lista logs do cliente com paginação
   */
  async listarLogsClient(page: number = 1, pageSize: number = 50): Promise<LogClientPaginado> {
    return this.get<LogClientPaginado>(`/Log/client?page=${page}&pageSize=${pageSize}`);
  }

  // ==================== ESTATÍSTICAS ====================

  /**
   * Busca estatísticas gerais
   */
  async buscarEstatisticas(): Promise<any> {
    return this.get<any>('/Dashboard/estatisticas');
  }

  /**
   * Busca estatísticas de atendimento
   */
  async buscarEstatisticasAtendimento(dataInicio?: string, dataFim?: string): Promise<any> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<any>(`/Dashboard/atendimento${query}`);
  }

  /**
   * Busca estatísticas de IA
   */
  async buscarEstatisticasIa(dataInicio?: string, dataFim?: string): Promise<any> {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get<any>(`/Dashboard/ia${query}`);
  }
}
