// Script para preservar el archivo CNAME durante el deploy
// GitHub Pages necesita este archivo para mantener el dominio personalizado activo
// Este script se ejecuta ANTES del deploy para asegurar que el CNAME esté presente

const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'frontend', 'browser');
const cnamePath = path.join(distPath, 'CNAME');
const frontendRootPath = path.join(__dirname, '..');
const frontendCnamePath = path.join(frontendRootPath, 'CNAME');

// Dominio personalizado del usuario
const DOMINIO = 'gestorplan.arcode-pe.com';

async function preserveCNAME() {
  try {
    console.log('🔒 Preservando archivo CNAME para GitHub Pages...');
    console.log('   Este archivo es CRÍTICO para mantener el dominio personalizado activo.');
    
    // Verificar si existe un CNAME en la raíz del proyecto frontend
    let cnameContent = DOMINIO;
    
    if (fs.existsSync(frontendCnamePath)) {
      const existingContent = fs.readFileSync(frontendCnamePath, 'utf8').trim();
      if (existingContent) {
        cnameContent = existingContent;
        console.log(`📖 CNAME encontrado en la raíz: ${cnameContent}`);
      }
    } else {
      console.log(`📝 Creando CNAME con dominio: ${cnameContent}`);
    }
    
    // Asegurar que el directorio dist existe
    if (!fs.existsSync(distPath)) {
      console.error('❌ Error: El directorio dist/frontend/browser no existe');
      console.log('💡 Asegúrate de ejecutar "ng build" primero');
      process.exit(1);
    }
    
    // Escribir CNAME en el directorio de dist (donde se hace el deploy)
    // IMPORTANTE: Este archivo debe estar ANTES de que angular-cli-ghpages haga el deploy
    fs.writeFileSync(cnamePath, cnameContent + '\n', 'utf8');
    console.log(`✅ CNAME creado en dist: ${cnamePath}`);
    console.log(`   Contenido: ${cnameContent}`);
    
    // Verificar que se creó correctamente
    const verifyContent = fs.readFileSync(cnamePath, 'utf8').trim();
    if (verifyContent !== cnameContent) {
      console.error('❌ Error: El contenido del CNAME no coincide');
      process.exit(1);
    }
    
    // También crear/actualizar CNAME en la raíz del proyecto para referencia y versionado
    fs.writeFileSync(frontendCnamePath, cnameContent + '\n', 'utf8');
    console.log(`✅ CNAME creado/actualizado en la raíz: ${frontendCnamePath}`);
    console.log('   (Este archivo se versiona en Git para referencia futura)');
    
    console.log('');
    console.log('✅ CNAME preservado correctamente.');
    console.log(`✅ Dominio configurado: ${cnameContent}`);
    console.log('✅ El archivo CNAME estará presente durante el deploy a GitHub Pages.');
    console.log('⚠️  NOTA: Si angular-cli-ghpages borra el CNAME, GitHub Pages lo restaurará automáticamente');
    console.log('   desde la configuración del repositorio, pero es mejor tenerlo en el código.');
  } catch (error) {
    console.error('❌ Error al preservar CNAME:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar la función
preserveCNAME();

