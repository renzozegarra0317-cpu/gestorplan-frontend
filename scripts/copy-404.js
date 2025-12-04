// Script para copiar index.html a 404.html para GitHub Pages
// Esto permite que GitHub Pages redirija todas las rutas al SPA de Angular

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'frontend', 'browser');
const indexPath = path.join(distPath, 'index.html');
const notFoundPath = path.join(distPath, '404.html');

// También copiar a la raíz del proyecto frontend/ para que GitHub Pages lo use
const frontendRootPath = path.join(__dirname, '..');
const frontend404Path = path.join(frontendRootPath, '404.html');

// Función para esperar a que un archivo exista y tenga contenido (con timeout)
function waitForFile(filePath, maxWait = 20000, interval = 200) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkFile = () => {
      if (fs.existsSync(filePath)) {
        // Verificar que el archivo tenga contenido (no esté vacío)
        try {
          const stats = fs.statSync(filePath);
          if (stats.size > 100) { // Al menos 100 bytes (un HTML mínimo tiene más)
            // Esperar un poco más para asegurar que el archivo esté completamente escrito
            setTimeout(() => {
              const content = fs.readFileSync(filePath, 'utf8');
              if (content && content.trim().length > 0 && content.includes('<html')) {
                resolve();
              } else {
                // El archivo existe pero no tiene contenido válido, seguir esperando
                if (Date.now() - startTime < maxWait) {
                  setTimeout(checkFile, interval);
                } else {
                  reject(new Error(`Timeout: ${filePath} existe pero está vacío o incompleto`));
                }
              }
            }, 500); // Esperar 500ms adicionales para asegurar que esté completo
          } else {
            // Archivo muy pequeño, probablemente aún se está escribiendo
            if (Date.now() - startTime < maxWait) {
              setTimeout(checkFile, interval);
            } else {
              reject(new Error(`Timeout: ${filePath} existe pero es muy pequeño (${stats.size} bytes)`));
            }
          }
        } catch (err) {
          // Error al leer, seguir esperando
          if (Date.now() - startTime < maxWait) {
            setTimeout(checkFile, interval);
          } else {
            reject(new Error(`Error al leer ${filePath}: ${err.message}`));
          }
        }
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error(`Timeout esperando archivo: ${filePath}`));
      } else {
        setTimeout(checkFile, interval);
      }
    };
    
    checkFile();
  });
}

async function copy404() {
  try {
    // Esperar a que el index.html exista (por si el build aún no terminó)
    // Aumentar el timeout para asegurar que Angular termine completamente
    console.log('⏳ Esperando a que index.html esté disponible y completo...');
    await waitForFile(indexPath, 30000, 500); // 30 segundos, verificar cada 500ms
    
    // Verificar que existe el index.html
    if (!fs.existsSync(indexPath)) {
      console.error('❌ Error: index.html no encontrado en:', indexPath);
      console.log('💡 Asegúrate de ejecutar "ng build" primero');
      process.exit(1);
    }

    // Leer el contenido de index.html
    console.log('📖 Leyendo index.html...');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Verificar que el contenido no esté vacío y tenga los elementos esenciales
    if (!indexContent || indexContent.trim().length === 0) {
      console.error('❌ Error: index.html está vacío');
      process.exit(1);
    }
    
    // Verificar que tenga los elementos esenciales
    const tieneScripts = indexContent.includes('<script');
    const tienePolyfills = indexContent.includes('polyfills') || indexContent.includes('Polyfills');
    const tieneMain = indexContent.includes('main-') || indexContent.includes('main.js');
    const tieneChunks = (indexContent.match(/chunk-/g) || []).length > 0;
    const tieneAppRoot = indexContent.includes('<app-root');
    const tieneBaseHref = indexContent.includes('<base href');
    const tieneStyles = indexContent.includes('styles-') || indexContent.includes('styles.css');
    
    // Validaciones críticas
    if (!tieneScripts) {
      console.error('❌ Error: index.html NO tiene scripts');
      process.exit(1);
    }
    
    if (!tieneAppRoot) {
      console.error('❌ Error: index.html NO tiene app-root');
      process.exit(1);
    }
    
    if (!tieneBaseHref) {
      console.warn('⚠️ Advertencia: index.html no tiene base href');
    }
    
    // Contar scripts y chunks
    const numScripts = (indexContent.match(/<script/g) || []).length;
    const numChunks = (indexContent.match(/chunk-/g) || []).length;
    const numModulePreloads = (indexContent.match(/modulepreload/g) || []).length;
    
    console.log(`📊 Scripts encontrados: ${numScripts}`);
    console.log(`📊 Chunks encontrados: ${numChunks}`);
    console.log(`📊 Module preloads: ${numModulePreloads}`);
    
    if (!tienePolyfills) {
      console.warn('⚠️ Advertencia: No se encontró polyfills.js');
    }
    
    if (!tieneMain) {
      console.warn('⚠️ Advertencia: No se encontró main.js');
    }
    
    if (!tieneChunks) {
      console.warn('⚠️ Advertencia: No se encontraron chunks');
    }
    
    if (!tieneStyles) {
      console.warn('⚠️ Advertencia: No se encontró styles.css');
    }
    
    console.log(`📊 Tamaño del index.html: ${(indexContent.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Líneas en index.html: ${indexContent.split('\n').length}`);

    // Escribir el mismo contenido como 404.html (COMPLETO, sin modificaciones)
    console.log('📝 Copiando index.html completo a 404.html...');
    fs.writeFileSync(notFoundPath, indexContent, 'utf8');
    
    // Verificar que se copió correctamente
    const copiedContent = fs.readFileSync(notFoundPath, 'utf8');
    if (copiedContent !== indexContent) {
      console.error('❌ Error: El contenido copiado no coincide con el original');
      console.error(`Original: ${indexContent.length} bytes, Copiado: ${copiedContent.length} bytes`);
      process.exit(1);
    }
    
    // Verificar que el 404.html copiado tenga todos los elementos esenciales
    const copiaTieneScripts = copiedContent.includes('<script');
    const copiaTieneAppRoot = copiedContent.includes('<app-root');
    const copiaTienePolyfills = copiedContent.includes('polyfills');
    const copiaTieneMain = copiedContent.includes('main-');
    const copiaNumChunks = (copiedContent.match(/chunk-/g) || []).length;
    
    if (!copiaTieneScripts || !copiaTieneAppRoot) {
      console.error('❌ Error: 404.html copiado NO tiene elementos esenciales');
      process.exit(1);
    }
    
    console.log(`✅ 404.html creado en dist: ${(copiedContent.length / 1024).toFixed(2)} KB, ${copiedContent.split('\n').length} líneas`);
    console.log(`✅ 404.html tiene ${copiaNumChunks} chunks, polyfills: ${copiaTienePolyfills ? '✅' : '❌'}, main: ${copiaTieneMain ? '✅' : '❌'}`);
    
    // También copiar a la raíz de frontend/ para que GitHub Pages lo use directamente
    console.log('📝 Copiando 404.html a la raíz del proyecto frontend/...');
    fs.writeFileSync(frontend404Path, indexContent, 'utf8');
    
    // Verificar que se copió correctamente en la raíz también
    const frontend404Content = fs.readFileSync(frontend404Path, 'utf8');
    if (frontend404Content !== indexContent) {
      console.error('❌ Error: El 404.html en la raíz no coincide con el original');
      process.exit(1);
    }
    
    console.log(`✅ 404.html copiado a la raíz: ${(frontend404Content.length / 1024).toFixed(2)} KB`);
    console.log('✅ 404.html es una copia IDÉNTICA y COMPLETA de index.html (en dist y en raíz)');

    // Crear archivo .nojekyll para deshabilitar Jekyll en GitHub Pages
    const nojekyllPath = path.join(distPath, '.nojekyll');
    fs.writeFileSync(nojekyllPath, '', 'utf8');
    
    // También crear .nojekyll en la raíz si no existe
    const nojekyllRootPath = path.join(frontendRootPath, '.nojekyll');
    if (!fs.existsSync(nojekyllRootPath)) {
      fs.writeFileSync(nojekyllRootPath, '', 'utf8');
      console.log('✅ .nojekyll creado en la raíz del proyecto');
    }

    console.log('✅ .nojekyll creado exitosamente');
    console.log('✅ GitHub Pages ahora redirigirá todas las rutas al SPA de Angular');
    console.log('✅ 404.html está completo en dist/frontend/browser/ y en frontend/ (raíz)');
  } catch (error) {
    console.error('❌ Error al copiar index.html a 404.html:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar la función
copy404();

