import { Routes } from '@angular/router';
import { deslogadoGuard } from './Guard/deslogado-guard';
import { logadoGuard } from './Guard/logado-guard';
import { AuthContainerComponent } from './Pages/auth/auth-container/auth-container.component';
import { CadastroEmpresaComponent } from './Pages/Login/cadastro-empresa/cadastro-empresa';
import { HomeComponent } from './Pages/home.component/home.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { AdminDashboardComponent } from './Pages/admin-dashboard/admin-dashboard.component';
import { ConversasComponent } from './Pages/conversas/conversas.component';
import { AnalisesComponent } from './Pages/analises/analises.component';
import { TemplatesComponent } from './Pages/templates/templates.component';
import { BaseConhecimentoComponent } from './Pages/base-conhecimento/base-conhecimento.component';
import { ConfiguracoesComponent } from './Pages/configuracoes/configuracoes.component';

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
        path: 'cadastro-empresa',
        component: CadastroEmpresaComponent,
        canActivate: [deslogadoGuard],
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
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [logadoGuard],
        title: 'Dashboard Administrativa - AI Agent'
    },
    {
        path: 'conversas',
        component: ConversasComponent,
        canActivate: [logadoGuard],
        title: 'Conversas - AI Agent'
    },
    {
        path: 'analises',
        component: AnalisesComponent,
        canActivate: [logadoGuard],
        title: 'Análises Avançadas - AI Agent'
    },
    {
        path: 'templates',
        component: TemplatesComponent,
        canActivate: [logadoGuard],
        title: 'Templates de Mensagens - AI Agent'
    },
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
    // ==================== FALLBACK ====================
    {
        path: '**',
        redirectTo: ''
    }
];
