/**
 * Barrel export para services da API
 *
 * Este arquivo facilita a importação dos services em qualquer componente:
 *
 * @example
 * // Ao invés de:
 * import { ClientService } from './Service/Api/client.service';
 * import { AdminService } from './Service/Api/admin.service';
 *
 * // Você pode fazer:
 * import { ClientService, AdminService } from './Service/Api';
 */

// Services
export * from './base-api.service';
export * from './client.service';
export * from './admin.service';
export * from './auth.service';
export * from './empresa.service';
export * from './conversas.service';
export * from './dashboard.service';
export * from './email.service';
export * from './analises.service';
export * from './mensagens.service';
export * from './templates.service';
export * from './waha.service';

// Types e Interfaces
export * from './api-types';
