import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CampoMelhoramento {
  idCampo: number;
  texto: string;
}

export interface MelhoramentoRequest {
  idCampo: number;
  textoCampoAtual: string;
  Campos: CampoMelhoramento[];
}

export interface MelhoramentoResponse {
  Resposta: string;
}

@Injectable({
  providedIn: 'root'
})
export class IaMelhoramentoService {
  private readonly webhookUrl = 'http://65.21.61.206:5678/webhook/0dc16337-718d-479d-a218-1a32b226d3d4';

  constructor(private http: HttpClient) {}

  /**
   * Envia texto para melhoramento via IA
   * @param idCampo ID do campo que está sendo melhorado
   * @param textoCampoAtual Texto atual do campo
   * @param todosCampos Array com todos os campos para contexto
   * @returns Texto melhorado
   */
  async melhorarTexto(
    idCampo: number,
    textoCampoAtual: string,
    todosCampos: CampoMelhoramento[]
  ): Promise<string> {
    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      const payload: MelhoramentoRequest = {
        idCampo,
        textoCampoAtual,
        Campos: todosCampos
      };

      const response = await firstValueFrom(
        this.http.post<MelhoramentoResponse>(this.webhookUrl, payload, { headers })
      );

      return response.Resposta;
    } catch (error: any) {
      console.error('Erro ao melhorar texto:', error);
      throw new Error('Erro ao processar melhoramento de texto. Tente novamente.');
    }
  }
}
