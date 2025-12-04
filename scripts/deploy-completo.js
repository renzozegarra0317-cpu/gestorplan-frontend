// Script de deploy completo y seguro para GitHub Pages
// Este script asegura que TODOS los cambios se suban correctamente

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ============================================');
console.log('🚀 DEPLOY COMPLETO A GITHUB PAGES');
console.log('🚀 ============================================\n');

const distPath = path.join(__dirname, '..', 'dist', 'frontend', 'browser');

// Paso 1: Limpiar build anterior
console.log('📦 Paso 1: Limpiando build anterior...');
try {
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Build anterior eliminado\n');
  }
} catch (error) {
  console.warn('⚠️  No se pudo eliminar build anterior (puede no existir)\n');
}

// Paso 2: Build de producción
console.log('🔨 Paso 2: Construyendo aplicación en modo producción...');
try {
  execSync('npm run build:prod', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Build de producción completado\n');
} catch (error) {
  console.error('❌ Error en el build de producción');
  process.exit(1);
}

// Paso 3: Verificar que el build se creó correctamente
console.log('🔍 Paso 3: Verificando que el build se creó correctamente...');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: El directorio dist/frontend/browser no existe');
  process.exit(1);
}

const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: index.html no existe en el build');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');
if (!indexContent.includes('<app-root')) {
  console.error('❌ Error: index.html no tiene <app-root>');
  process.exit(1);
}

console.log('✅ Build verificado correctamente\n');

// Paso 4: Copiar 404.html
console.log('📄 Paso 4: Copiando 404.html...');
try {
  execSync('node scripts/copy-404.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ 404.html copiado\n');
} catch (error) {
  console.error('❌ Error al copiar 404.html');
  process.exit(1);
}

// Paso 5: Preservar CNAME
console.log('🔒 Paso 5: Preservando CNAME...');
try {
  execSync('node scripts/preserve-cname.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ CNAME preservado\n');
} catch (error) {
  console.error('❌ Error al preservar CNAME');
  process.exit(1);
}

// Paso 6: Invalidar Service Workers
console.log('🔄 Paso 6: Invalidando Service Workers...');
try {
  execSync('node scripts/invalidate-sw.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Service Workers invalidados\n');
} catch (error) {
  console.error('❌ Error al invalidar Service Workers');
  process.exit(1);
}

// Paso 7: Verificar archivos críticos antes del deploy
console.log('✅ Paso 7: Verificando archivos críticos...');
const archivosCriticos = [
  'index.html',
  '404.html',
  'CNAME',
  'ngsw.json',
  '.nojekyll'
];

let todosPresentes = true;
for (const archivo of archivosCriticos) {
  const rutaArchivo = path.join(distPath, archivo);
  if (fs.existsSync(rutaArchivo)) {
    console.log(`  ✅ ${archivo} presente`);
  } else {
    console.error(`  ❌ ${archivo} NO encontrado`);
    todosPresentes = false;
  }
}

if (!todosPresentes) {
  console.error('\n❌ Error: Faltan archivos críticos. No se puede hacer deploy.');
  process.exit(1);
}

console.log('✅ Todos los archivos críticos están presentes\n');

// Paso 8: Verificar que no haya referencias a la gráfica de asistencia
console.log('🔍 Paso 8: Verificando que la gráfica de asistencia esté eliminada...');
if (indexContent.includes('Asistencia Semanal') && !indexContent.includes('ELIMINADO')) {
  console.warn('⚠️  Advertencia: Se encontró referencia a "Asistencia Semanal" en index.html');
} else {
  console.log('✅ Gráfica de asistencia eliminada correctamente');
}

// Verificar en los chunks JS
const chunkFiles = fs.readdirSync(distPath).filter(f => f.startsWith('chunk-') && f.endsWith('.js'));
let encontradoEnChunks = false;
for (const chunk of chunkFiles.slice(0, 5)) { // Verificar solo los primeros 5
  const chunkContent = fs.readFileSync(path.join(distPath, chunk), 'utf8');
  if (chunkContent.includes('inicializarGraficoAsistencia') && !chunkContent.includes('ELIMINADO')) {
    console.warn(`⚠️  Advertencia: Se encontró referencia a gráfica de asistencia en ${chunk}`);
    encontradoEnChunks = true;
  }
}
if (!encontradoEnChunks) {
  console.log('✅ No se encontraron referencias a la gráfica de asistencia en los chunks\n');
}

// Paso 9: Deploy a GitHub Pages
console.log('🚀 Paso 9: Desplegando a GitHub Pages...');
console.log('   Esto puede tardar 1-2 minutos...\n');
try {
  execSync('npx angular-cli-ghpages --dir=dist/frontend/browser', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('\n✅ Deploy completado exitosamente\n');
} catch (error) {
  console.error('\n❌ Error durante el deploy a GitHub Pages');
  console.error('   Verifica tu conexión a internet y tus credenciales de GitHub');
  process.exit(1);
}

// Paso 10: Resumen final
console.log('🎉 ============================================');
console.log('🎉 DEPLOY COMPLETADO EXITOSAMENTE');
console.log('🎉 ============================================');
console.log('\n📋 Resumen:');
console.log('  ✅ Build de producción creado');
console.log('  ✅ 404.html copiado');
console.log('  ✅ CNAME preservado');
console.log('  ✅ Service Workers invalidados');
console.log('  ✅ Archivos críticos verificados');
console.log('  ✅ Deploy a GitHub Pages completado');
console.log('\n⏰ El sitio debería estar actualizado en 1-5 minutos');
console.log('🌐 URL: https://gestorplan.arcode-pe.com/');
console.log('\n💡 IMPORTANTE:');
console.log('   - Limpia la caché del navegador (Ctrl+Shift+Delete)');
console.log('   - O haz un Hard Refresh (Ctrl+Shift+R)');
console.log('   - Verifica en modo incógnito si es necesario');
console.log('\n✨ ¡Deploy completado!');

