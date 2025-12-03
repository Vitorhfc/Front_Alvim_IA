import { Routes } from '@angular/router';
import { deslogadoGuard } from './Guard/deslogado-guard';
import { logadoGuard } from './Guard/logado-guard';
import { AuthContainerComponent } from './Pages/auth/auth-container/auth-container.component';
import { LoginEmpresaComponent } from './Pages/auth/login-empresa/login-empresa.component';
import { LoginFixoComponent } from './Pages/auth/login-fixo.component/login-fixo.component';
import { CadastroEmpresaComponent } from './Pages/auth/cadastro-empresa/cadastro-empresa.component';
import { HomeComponent } from './Pages/home.component/home.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { ConversasComponent } from './Pages/conversas/conversas.component';
import { ClienteComponent } from './Pages/cliente/cliente';
import { AnalisesComponent } from './Pages/analises/analises.component';
import { TemplatesComponent } from './Pages/templates/templates.component';
import { BaseConhecimentoComponent } from './Pages/base-conhecimento/base-conhecimento.component';
import { ConfiguracoesComponent } from './Pages/configuracoes/configuracoes.component';
import { FuncionariosComponent } from './Pages/funcionarios/funcionarios.component';
import { AgendamentosComponent } from './Pages/agendamentos/agendamentos.component';
import { WhatsappConfigComponent } from './Pages/whatsapp-config/whatsapp-config';
import { LogWahaView } from './Pages/Pagina logs/log-waha-view/log-waha-view';
import { LogClientView } from './Pages/Pagina logs/log-client-view/log-client-view';
import { MenuConfiguracaoComponent } from './Pages/menu-configuracao/menu-configuracao.component';

export const routes: Routes = [
    // ==================== ROTAS PÚBLICAS ====================
    {
        path: '',
        component: HomeComponent,
        canActivate: [deslogadoGuard],
        title: 'Home - Diana'
    },
    {
        path: 'auth',
        component: AuthContainerComponent,
        canActivate: [deslogadoGuard],
        title: 'Login e Cadastro - AI Agent'
    },
    {
        path: 'login-empresa',
        component: LoginEmpresaComponent,
        canActivate: [deslogadoGuard],
        title: 'Login Empresa - AI Agent'
    },
    {
        path: 'Acesso',
        component: LoginFixoComponent,
        canActivate: [deslogadoGuard],
        title: 'Acesso - Diana IA'
    },
    {
        path: 'Acesso/:empresaId',
        component: LoginFixoComponent,
        canActivate: [deslogadoGuard],
        title: 'Acesso - Diana IA'
    },
    {
        path: 'cadastro-empresa',
        component: CadastroEmpresaComponent,
        // Sem guard - permite acesso tanto logado quanto deslogado
        title: 'Cadastro de Empresa - AI Agent'
    },

    // ==================== ROTAS PROTEGIDAS ====================
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [logadoGuard],
        title: 'Dashboard - AI Agent'
    },
    {
        path: 'LogWhatsapp',
        component: LogWahaView,
        canActivate: [logadoGuard],
        title: 'Log WhatsApp'
    },
    {
        path: 'LogsClient',
        component: LogClientView,
        canActivate: [logadoGuard],
        title: 'Logs Client'
    },
    {
        path: 'conversas',
        component: ConversasComponent,
        canActivate: [logadoGuard],
        title: 'Conversas - AI Agent'
    },
    // ==================== ROTAS TEMPORARIAMENTE DESABILITADAS ====================
    {
        path: 'cliente/:id',
        component: ClienteComponent,
        canActivate: [logadoGuard],
        title: 'Detalhes do Cliente - AI Agent'
    },
    // {
    //     path: 'analises',
    //     component: AnalisesComponent,
    //     canActivate: [logadoGuard],
    //     title: 'Análises Avançadas - AI Agent'
    // },
    // {
    //     path: 'templates',
    //     component: TemplatesComponent,
    //     canActivate: [logadoGuard],
    //     title: 'Templates de Mensagens - AI Agent'
    // },
    // ==================== FIM ROTAS DESABILITADAS ====================
    {
        path: 'base-conhecimento',
        component: BaseConhecimentoComponent,
        canActivate: [logadoGuard],
        title: 'Base de Conhecimento - AI Agent'
    },
    {
        path: 'configuracoes',
        component: ConfiguracoesComponent,
        canActivate: [logadoGuard],
        title: 'Configurações - AI Agent'
    },
    {
        path: 'whatsapp-config',
        component: WhatsappConfigComponent,
        canActivate: [logadoGuard],
        title: 'Configuração WhatsApp - AI Agent'
    },
    {
        path: 'funcionarios',
        component: FuncionariosComponent,
        canActivate: [logadoGuard],
        title: 'Gerenciamento de Funcionários - AI Agent'
    },
    {
        path: 'agendamentos',
        component: AgendamentosComponent,
        canActivate: [logadoGuard],
        title: 'Agendamentos - AI Agent'
    },
    {
        path: 'menu-configuracao',
        component: MenuConfiguracaoComponent,
        canActivate: [logadoGuard],
        title: 'Configuração de Menus - AI Agent'
    },
    {
        path: '**',
        redirectTo: ''
    }
];
