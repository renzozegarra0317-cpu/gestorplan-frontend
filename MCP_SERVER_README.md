# Servidor MCP para Mejora de Código Frontend

Este servidor MCP (Model Context Protocol) proporciona herramientas y recursos para analizar, mejorar y optimizar el código del frontend Angular.

## 📋 Descripción

El servidor MCP incluye 20 herramientas especializadas para:
- Análisis de calidad de código
- Optimización de rendimiento
- Detección de problemas de seguridad
- Mejoras de accesibilidad
- Refactorización de código
- Análisis de dependencias
- Verificación de mejores prácticas Angular

## 🛠️ Herramientas Disponibles

### Análisis de Código

1. **analyze_code_quality** - Analiza la calidad del código TypeScript/Angular
2. **check_angular_best_practices** - Verifica el cumplimiento de mejores prácticas
3. **check_typescript_strictness** - Verifica el uso correcto de TypeScript
4. **detect_unused_imports** - Detecta imports no utilizados

### Optimización

5. **analyze_bundle_size** - Analiza el tamaño del bundle
6. **suggest_component_optimization** - Sugiere optimizaciones de componentes
7. **analyze_performance_metrics** - Analiza métricas de rendimiento
8. **suggest_code_splitting** - Sugiere estrategias de code splitting

### Refactorización

9. **suggest_refactoring** - Sugiere refactorizaciones
10. **refactor_large_component** - Refactoriza componentes grandes

### Seguridad

11. **check_security_issues** - Detecta problemas de seguridad
12. **check_environment_config** - Verifica configuración de entornos

### Accesibilidad

13. **suggest_accessibility_improvements** - Mejoras de accesibilidad

### Estilos

14. **optimize_scss** - Optimiza archivos SCSS

### RxJS y Servicios

15. **check_rxjs_patterns** - Verifica uso de RxJS
16. **suggest_service_improvements** - Mejora servicios Angular

### Formularios y Rutas

17. **check_form_validation** - Verifica validación de formularios
18. **suggest_routing_optimization** - Optimiza rutas

### Testing y Mantenimiento

19. **detect_memory_leaks** - Detecta memory leaks
20. **suggest_testing_improvements** - Mejora cobertura de pruebas

## 📚 Recursos Disponibles

- **Guía de Calidad de Código** - Mejores prácticas generales
- **Mejores Prácticas Angular** - Específicas de Angular
- **Checklist de Rendimiento** - Optimización de rendimiento
- **Guía de Seguridad** - Directrices de seguridad
- **Estándares de Accesibilidad** - WCAG
- **Patrones de Refactorización** - Patrones comunes
- **Mejores Prácticas RxJS** - Uso correcto de RxJS
- **Estrategias de Testing** - Testing en Angular

## 🚀 Uso Básico

### Ejemplo 1: Analizar calidad de código

```json
{
  "tool": "analyze_code_quality",
  "input": {
    "filePath": "src/app/components/dashboard/dashboard.component.ts",
    "checkType": "all"
  }
}
```

### Ejemplo 2: Sugerir optimizaciones de componente

```json
{
  "tool": "suggest_component_optimization",
  "input": {
    "componentPath": "src/app/trabajadores/nuevo/nuevo.component.ts",
    "optimizationType": "change-detection"
  }
}
```

### Ejemplo 3: Verificar mejores prácticas Angular

```json
{
  "tool": "check_angular_best_practices",
  "input": {
    "componentPath": "src/app/configuracion/configuracion.component.ts"
  }
}
```

### Ejemplo 4: Analizar tamaño del bundle

```json
{
  "tool": "analyze_bundle_size",
  "input": {
    "includeChunks": true
  }
}
```

### Ejemplo 5: Detectar problemas de seguridad

```json
{
  "tool": "check_security_issues",
  "input": {
    "filePath": "src/app/auth/auth.service.ts",
    "checkLevel": "intermediate"
  }
}
```

## ⚙️ Configuración

El servidor incluye reglas de análisis configurables en `configuration.analysisRules`:

- **maxComponentLines**: 500 líneas máximo por componente
- **maxServiceLines**: 300 líneas máximo por servicio
- **maxFunctionLines**: 50 líneas máximo por función
- **maxCyclomaticComplexity**: 10 máximo de complejidad ciclomática
- **preferOnPush**: Preferir ChangeDetectionStrategy.OnPush
- **preferStandalone**: Preferir componentes standalone
- **requireErrorHandling**: Requerir manejo de errores
- **requireTypeSafety**: Requerir seguridad de tipos

### Umbrales de Rendimiento

- **maxInitialBundleSize**: 500KB
- **maxLazyChunkSize**: 200KB
- **maxComponentRenderTime**: 16ms
- **maxApiResponseTime**: 1000ms

### Reglas de Seguridad

- **requireInputSanitization**: Requerir sanitización de inputs
- **requireXssProtection**: Requerir protección XSS
- **requireCsrfProtection**: Requerir protección CSRF
- **forbidEval**: Prohibir uso de eval()
- **forbidInnerHTML**: Permitir innerHTML (con sanitización)

## 🎯 Prompts Disponibles

### improve_component
Mejora un componente Angular específico enfocándose en performance, accesibilidad o mantenibilidad.

### optimize_service
Optimiza un servicio Angular mejorando manejo de errores, caching y patrones observables.

### refactor_large_component
Refactoriza un componente grande dividiéndolo en componentes más pequeños y reutilizables.

### improve_performance
Analiza y mejora el rendimiento general de la aplicación.

### enhance_security
Mejora la seguridad de la aplicación detectando y corrigiendo vulnerabilidades.

## 📝 Notas de Implementación

Este servidor MCP está diseñado para ser usado con:
- Cursor IDE
- Claude Desktop
- Otros clientes MCP compatibles

Para integrar este servidor, configura el cliente MCP para apuntar a `mcp-server.json`.

## 🔄 Actualizaciones

- **Versión 1.0.0** (2025-12-01)
  - Versión inicial con 20 herramientas
  - 8 recursos de documentación
  - 5 prompts predefinidos
  - Configuración completa de reglas

## 📞 Soporte

Para preguntas o sugerencias sobre el uso del servidor MCP, consulta la documentación del proyecto o contacta al equipo de desarrollo.





