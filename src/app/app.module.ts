// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/trabajadores/lista',
        pathMatch: 'full'
      },
      {
        path: 'trabajadores',
        children: [
          {
            path: 'lista',
            loadComponent: () => import('./trabajadores/lista/lista.component').then(m => m.ListaComponent)
          },
          {
            path: 'nuevo',
            loadComponent: () => import('./trabajadores/nuevo/nuevo.component').then(m => m.NuevoComponent)
          },
          {
            path: 'importar',
            loadComponent: () => import('./trabajadores/importar/importar.component').then(m => m.ImportarComponent)
          }
        ]
      },
      {
        path: '**',
        redirectTo: '/trabajadores/lista'
      }
      
    ])
  ],
  providers: []
})
export class AppModule { }