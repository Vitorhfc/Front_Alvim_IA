// Models/Response/api-response.model.ts

/**
 * Interface padrão de resposta da API
 */
export interface ApiResponse<T = any> {
    sucesso: boolean;
    mensagem: string;
    data?: T;
    timestamp: string;
    errorCode?: string;
    errors?: Record<string, string[]>;
}

/**
 * Interface para resposta de erro
 */
export interface ApiErrorResponse {
    sucesso: false;
    mensagem: string;
    errorCode?: string;
    errors?: Record<string, string[]>;
    timestamp: string;
}

/**
 * Interface para resposta de sucesso
 */
export interface ApiSuccessResponse<T = any> {
    sucesso: true;
    mensagem: string;
    data?: T;
    timestamp: string;
}

/**
 * Type guard para verificar se é uma resposta de sucesso
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.sucesso === true;
}

/**
 * Type guard para verificar se é uma resposta de erro
 */
export function isErrorResponse(response: ApiResponse): response is ApiErrorResponse {
    return response.sucesso === false;
}