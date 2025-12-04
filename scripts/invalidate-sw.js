// Script para invalidar Service Workers antiguos
// Crea un archivo ngsw.json vacío para que los navegadores detecten que el SW está invalidado
// Esto es necesario para eliminar Service Workers antiguos que puedan estar cacheados

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'frontend', 'browser');
const ngswJsonPath = path.join(distPath, 'ngsw.json');

async function invalidateSW() {
  try {
    console.log('🔄 Invalidando Service Workers antiguos...');
    
    // Asegurar que el directorio dist existe
    if (!fs.existsSync(distPath)) {
      console.error('❌ Error: El directorio dist/frontend/browser no existe');
      console.log('💡 Asegúrate de ejecutar "ng build" primero');
      process.exit(1);
    }
    
    // Crear ngsw.json vacío (solo {})
    // Esto indica a los navegadores que el Service Worker está invalidado
    const emptySW = {};
    fs.writeFileSync(ngswJsonPath, JSON.stringify(emptySW, null, 2), 'utf8');
    
    console.log(`✅ ngsw.json creado en: ${ngswJsonPath}`);
    console.log('   Contenido: {}');
    console.log('   Esto invalidará cualquier Service Worker antiguo');
    
    // Verificar que se creó correctamente
    const verifyContent = fs.readFileSync(ngswJsonPath, 'utf8');
    const parsed = JSON.parse(verifyContent);
    
    if (Object.keys(parsed).length !== 0) {
      console.error('❌ Error: ngsw.json no está vacío');
      process.exit(1);
    }
    
    console.log('✅ Service Workers invalidados correctamente.');
    console.log('✅ Los navegadores detectarán automáticamente que el SW está invalidado.');
  } catch (error) {
    console.error('❌ Error al invalidar Service Workers:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar la función
invalidateSW();

