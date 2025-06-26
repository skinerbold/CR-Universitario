// Service Worker robusto para desenvolvimento e produção
const CACHE_NAME = 'cr-calc-v1.2.1';
const STATIC_CACHE = 'cr-calc-static-v1.2.1';
const DYNAMIC_CACHE = 'cr-calc-dynamic-v1.2.1';

// Recursos básicos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Padrões a ignorar em desenvolvimento
const DEV_PATTERNS = [
  '/@vite/',
  '/src/',
  '?t=',
  'chrome-extension:',
  'ws://',
  'wss://',
  '/node_modules/'
];

console.log('🚀 Service Worker carregado com sucesso! Versão 1.2.1');

// Instalação
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando versão 1.2.1...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cache inicial criado');
        // Tenta adicionar ao cache, mas não falha se algum recurso não estiver disponível
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => cache.add(asset))
        ).then(results => {
          const failed = results.filter(r => r.status === 'rejected');
          if (failed.length > 0) {
            console.warn('⚠️ Alguns recursos não puderam ser cacheados:', failed);
          }
        });
      })
      .catch((error) => {
        console.warn('⚠️ Erro no cache inicial (não crítico):', error);
      })
  );
  
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando versão 1.2.1...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v1.2.1')) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker ativado e assumiu controle');
        return self.clients.claim();
      })
      .catch((error) => {
        console.warn('⚠️ Erro na ativação (não crítico):', error);
      })
  );
});

// Interceptação de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições de desenvolvimento e especiais
  if (shouldIgnoreRequest(url, request)) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

function shouldIgnoreRequest(url, request) {
  // Ignora protocolos não HTTP
  if (!url.protocol.startsWith('http')) {
    return true;
  }
  
  // Ignora padrões de desenvolvimento
  const urlString = url.href;
  if (DEV_PATTERNS.some(pattern => urlString.includes(pattern))) {
    return true;
  }
  
  // Ignora requisições cross-origin
  if (url.hostname !== location.hostname) {
    return true;
  }
  
  return false;
}

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Para documentos HTML, tenta rede primeiro
    if (request.destination === 'document' || url.pathname.endsWith('.html')) {
      return await networkFirstStrategy(request);
    }
    
    // Para assets estáticos, tenta cache primeiro
    if (isStaticAsset(url.pathname)) {
      return await cacheFirstStrategy(request);
    }
    
    // Para outros recursos, tenta rede primeiro com fallback
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.warn('⚠️ Erro na requisição:', request.url, error.message);
    return createFallbackResponse(request);
  }
}

function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.includes('/assets/') ||
         pathname.includes('/icons/');
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok && response.status < 400) {
      // Salva no cache se a resposta for válida
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, response.clone());
      } catch (cacheError) {
        console.warn('⚠️ Erro ao salvar no cache:', cacheError.message);
      }
    }
    
    return response;
  } catch (networkError) {
    // Se a rede falhar, tenta o cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw networkError;
  }
}

async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok && response.status < 400) {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response.clone());
      } catch (cacheError) {
        console.warn('⚠️ Erro ao salvar asset no cache:', cacheError.message);
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

function createFallbackResponse(request) {
  if (request.destination === 'document') {
    return new Response(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Calculadora CR - Offline</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 2rem; 
              text-align: center; 
              background: #f9fafb;
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container { 
              max-width: 400px; 
              margin: 0 auto; 
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            .message { color: #666; margin-bottom: 1rem; }
            .button { 
              background: #3b82f6; 
              color: white; 
              padding: 0.75rem 1.5rem; 
              border: none; 
              border-radius: 0.375rem; 
              cursor: pointer; 
              font-size: 1rem;
              margin: 0.5rem;
              transition: background-color 0.2s;
            }
            .button:hover { background: #2563eb; }
            .secondary { background: #6b7280; }
            .secondary:hover { background: #4b5563; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>Calculadora CR</h1>
            <p class="message">Você está offline. A aplicação pode não estar funcionando corretamente.</p>
            <button class="button" onclick="location.reload()">Tentar Novamente</button>
            <button class="button secondary" onclick="clearAndReload()">Limpar Cache</button>
            <script>
              function clearAndReload() {
                if ('caches' in window) {
                  caches.keys().then(names => {
                    Promise.all(names.map(name => caches.delete(name)))
                      .then(() => location.reload());
                  });
                } else {
                  location.reload();
                }
              }
            </script>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  // Para outros tipos de recursos
  return new Response(null, { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}
