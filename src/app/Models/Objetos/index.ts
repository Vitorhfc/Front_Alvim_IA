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
export * from '../../Service/Api/base-api.service';
export * from '../../Service/Api/client.service';
export * from '../../Service/Api/admin.service';
export * from '../../Service/Api/auth.service';
export * from '../../Service/Api/empresa.service';
export * from '../../Service/Api/conversas.service';
export * from '../../Service/Api/dashboard.service';
export * from '../../Service/Api/email.service';
export * from '../../Service/Api/analises.service';
export * from '../../Service/Api/mensagens.service';
export * from '../../Service/Api/templates.service';
export * from '../../Service/Api/waha.service';

// Types e Interfaces
export * from './api-types';
