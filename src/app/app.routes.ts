import { Routes } from '@angular/router';
import { deslogadoGuard } from './Guard/deslogado-guard';
import { logadoGuard } from './Guard/logado-guard';
import { AuthContainerComponent } from './Pages/auth/auth-container/auth-container.component';
import { LoginEmpresaComponent } from './Pages/auth/login-empresa/login-empresa.component';
import { CadastroEmpresaComponent } from './Pages/auth/cadastro-empresa/cadastro-empresa.component';
import { HomeComponent } from './Pages/home.component/home.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { ConversasComponent } from './Pages/conversas/conversas.component';
import { AnalisesComponent } from './Pages/analises/analises.component';
import { TemplatesComponent } from './Pages/templates/templates.component';
import { BaseConhecimentoComponent } from './Pages/base-conhecimento/base-conhecimento.component';
import { ConfiguracoesComponent } from './Pages/configuracoes/configuracoes.component';
import { FuncionariosComponent } from './Pages/funcionarios/funcionarios.component';
import { AgendamentosComponent } from './Pages/agendamentos/agendamentos.component';

export const routes: Routes = [
    // ==================== ROTAS PÚBLICAS ====================
    {
        path: '',
        component: HomeComponent,
        canActivate: [deslogadoGuard],
        title: 'Home - AI Agent'
    },
    {
        path: 'auth',
        component: AuthContainerComponent,
        canActivate: [deslogadoGuard],
        title: 'Login e Cadastro - AI Agent'
    },
    {
        path: 'login-empresa/:empresaId',
        component: LoginEmpresaComponent,
        canActivate: [deslogadoGuard],
        title: 'Login Empresa - AI Agent'
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
        path: 'conversas',
        component: ConversasComponent,
        canActivate: [logadoGuard],
        title: 'Conversas - AI Agent'
    },
    // ==================== ROTAS TEMPORARIAMENTE DESABILITADAS ====================
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
    // ==================== ROTAS TEMPORARIAMENTE DESABILITADAS ====================
    // {
    //     path: 'funcionarios',
    //     component: FuncionariosComponent,
    //     canActivate: [logadoGuard],
    //     title: 'Gerenciamento de Funcionários - AI Agent'
    // },
    // {
    //     path: 'agendamentos',
    //     component: AgendamentosComponent,
    //     canActivate: [logadoGuard],
    //     title: 'Agendamentos - AI Agent'
    // },
    // ==================== FIM ROTAS DESABILITADAS ====================
    // ==================== FALLBACK ====================
    {
        path: '**',
        redirectTo: ''
    }
];
