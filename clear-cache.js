// Script para limpar cache do Service Worker
// Execute no console do navegador para resetar completamente

async function clearServiceWorkerCache() {
  console.log('🧹 Limpando cache do Service Worker...');
  
  try {
    // 1. Desregistrar Service Worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        console.log('🗑️ Desregistrando Service Worker...');
        await registration.unregister();
      }
    }
    
    // 2. Limpar todos os caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (let cacheName of cacheNames) {
        console.log(`🗑️ Removendo cache: ${cacheName}`);
        await caches.delete(cacheName);
      }
    }
    
    // 3. Limpar localStorage e sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ Cache limpo com sucesso!');
    console.log('🔄 Recarregue a página para registrar novo Service Worker');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return false;
  }
}

// Execute esta função no console:
// clearServiceWorkerCache().then(() => location.reload());
