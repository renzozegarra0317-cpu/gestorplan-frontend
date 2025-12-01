import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { AdminGuard } from './guards/admin.guard';
import { RrhhGuard } from './guards/rrhh.guard';


export const routes: Routes = [
  // ==================== LOGIN ====================
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  
  // ==================== RUTAS PROTEGIDAS ====================
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      // ==================== TRABAJADORES ====================
      {
        path: 'trabajadores',
        canActivate: [RoleGuard],
        data: { roles: ['Administrador', 'RRHH', 'Gerencia', 'DEMO'] },
        children: [
          {
            path: 'lista',
            loadComponent: () => import('./trabajadores/lista/lista.component').then(m => m.ListaComponent)
          },
          {
            path: 'nuevo',
            canActivate: [RrhhGuard],
            loadComponent: () => import('./trabajadores/nuevo/nuevo.component').then(m => m.NuevoComponent)
          },
          {
            path: 'importar',
            canActivate: [RrhhGuard],
            loadComponent: () => import('./trabajadores/importar/importar.component').then(m => m.ImportarComponent)
          },
          // TEMPORALES - Muestran dashboard hasta que crees los componentes
          {
            path: 'editar/:id',
            canActivate: [RrhhGuard],
            loadComponent: () => import('./trabajadores/editar/editar.component').then(m => m.EditarComponent)
          },
          {
            path: 'detalle/:id',
            component: DashboardComponent  // TEMPORAL
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full'
          }
        ]
      },
      // ==================== ASISTENCIA ====================
      {
        path: 'asistencia',
        children: [
          {
            path: 'registro',
            loadComponent: () => import('./asistencias/registro/registro.component').then(m => m.RegistroComponent)
          },
          {
            path: 'resumen',
            loadComponent: () => import('./asistencias/resumen/resumen.component').then(m => m.ResumenComponent)
          },
          {
            path: 'tardanzas',
            loadComponent: () => import('./asistencias/tardanzas/tardanzas.component').then(m => m.TardanzasComponent)
          },
          {
            path: '',
            redirectTo: 'registro',
            pathMatch: 'full'
          }
        ]
      },
      
      // ==================== PLANILLAS (TEMPORALES) ====================
      {
        path: 'planillas',
        children: [
          {
            path: 'generar',
            loadComponent: () => import('./planillas/generar/generar.component').then(m => m.GenerarComponent)
          },
          {
            path: 'historial',
            loadComponent: () => import('./planillas/historial/historial.component').then(m => m.HistorialComponent)
          },
          {
            path: 'conceptos',
            loadComponent: () => import('./planillas/conceptos/conceptos.component').then(m => m.ConceptosComponent)
          },
          {
            path: 'boletas',
            loadComponent: () => import('./planillas/boletas/boletas.component').then(m => m.BoletasComponent)
          },
          {
            path: '',
            redirectTo: 'generar',
            pathMatch: 'full'
          }
        ]
      },
      
      // ==================== BENEFICIOS (TEMPORALES) ====================
      {
        path: 'beneficios',
        children: [
          {
            path: 'cts',
            loadComponent: () => import('./beneficios/cts/cts.component').then(m => m.CtsComponent)
          },
          {
            path: 'gratificaciones',
            loadComponent: () => import('./beneficios/gratificaciones/gratificaciones.component').then(m => m.GratificacionesComponent)
          },
          {
            path: 'vacaciones',
            loadComponent: () => import('./beneficios/vacaciones/vacaciones.component').then(m => m.VacacionesComponent)
          },
          {
            path: 'utilidades',
            loadComponent: () => import('./beneficios/utilidades/utilidades.component').then(m => m.UtilidadesComponent)
          },
          {
            path: '',
            redirectTo: 'cts',
            pathMatch: 'full'
          }
        ]
      },
      
      // ==================== PRÉSTAMOS ====================
      {
        path: 'prestamos',
        loadComponent: () => import('./prestamos/prestamos.component').then(m => m.PrestamosComponent)
      },
      
      // ==================== REPORTES (TEMPORAL) ====================
      {
        path: 'reportes',
        loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent)
      },
      
      // ==================== CONFIGURACIÓN ====================
      {
        path: 'configuracion',
        canActivate: [AdminGuard],
        loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
      }
    ]
  },
  
  // ==================== 404 ====================
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];