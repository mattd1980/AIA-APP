#!/usr/bin/env node

/**
 * Script de diagnostic MCP pour Cursor
 * Vérifie la configuration et la disponibilité des outils MCP
 */

const { execSync } = require('child_process');
const os = require('os');

console.log('🔍 Diagnostic MCP - Cursor\n');
console.log('='.repeat(50));

// 1. Vérifier Node.js
console.log('\n1. Vérification Node.js:');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
  const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  
  if (majorVersion >= 22) {
    console.log(`   ✅ Node.js ${nodeVersion} (OK - version 22+ requise)`);
  } else {
    console.log(`   ❌ Node.js ${nodeVersion} (NOK - version 22+ requise)`);
    console.log('   💡 Solution: nvm install 22 ou nvm install lts/iron');
  }
} catch (error) {
  console.log('   ❌ Node.js non trouvé');
}

// 2. Vérifier npm
console.log('\n2. Vérification npm:');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`   ✅ npm ${npmVersion}`);
} catch (error) {
  console.log('   ❌ npm non trouvé');
}

// 3. Vérifier le chemin utilisateur
console.log('\n3. Vérification chemin utilisateur:');
const userHome = os.homedir();
const hasSpaces = userHome.includes(' ');
if (hasSpaces) {
  console.log(`   ⚠️  Chemin avec espaces: ${userHome}`);
  console.log('   💡 Les espaces peuvent causer des problèmes avec npx');
} else {
  console.log(`   ✅ Chemin OK: ${userHome}`);
}

// 4. Vérifier npx
console.log('\n4. Vérification npx:');
try {
  const npxVersion = execSync('npx --version', { encoding: 'utf-8' }).trim();
  console.log(`   ✅ npx ${npxVersion}`);
} catch (error) {
  console.log('   ❌ npx non trouvé');
}

// 5. Tester un package MCP commun
console.log('\n5. Test package MCP:');
try {
  console.log('   Test de @playwright/mcp...');
  execSync('npx --yes @playwright/mcp@latest --version', { 
    encoding: 'utf-8',
    stdio: 'pipe',
    timeout: 10000
  });
  console.log('   ✅ Package MCP accessible');
} catch (error) {
  console.log('   ⚠️  Package MCP non accessible (peut être normal)');
  console.log(`   Erreur: ${error.message}`);
}

// 6. Vérifier les variables d'environnement
console.log('\n6. Variables d\'environnement:');
const nodePath = process.env.NODE_PATH || 'non définie';
const pathEnv = process.env.PATH || '';
const hasNodeInPath = pathEnv.includes('node') || pathEnv.includes('Node');

console.log(`   NODE_PATH: ${nodePath}`);
console.log(`   PATH contient Node: ${hasNodeInPath ? '✅' : '⚠️'}`);

// 7. Résumé
console.log('\n' + '='.repeat(50));
console.log('\n📋 Résumé:');
console.log('   - Si tous les checks sont ✅, MCP devrait fonctionner');
console.log('   - Si des ❌ apparaissent, corriger les problèmes');
console.log('   - Redémarrer Cursor après corrections');
console.log('\n💡 Commandes utiles:');
console.log('   - nvm install 22 (si Node.js < 22)');
console.log('   - nvm use 22 (pour utiliser Node.js 22)');
console.log('   - Redémarrer Cursor');
