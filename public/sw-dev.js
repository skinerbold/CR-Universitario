// Service Worker simplificado para desenvolvimento e produção
const CACHE_NAME = 'cr-calc-v1.1.0';
const STATIC_CACHE = 'cr-calc-static-v1.1.0';
const DYNAMIC_CACHE = 'cr-calc-dynamic-v1.1.0';

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
  'wss://'
];

console.log('🚀 Service Worker carregado com sucesso!');

// Instalação
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Service Worker: Cache inicial criado');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.warn('⚠️ Erro no cache inicial:', error);
      })
  );
  
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes('v1.1.0')) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
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
          <title>Aplicativo Offline</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; text-align: center; }
            .container { max-width: 400px; margin: 0 auto; }
            .icon { font-size: 3rem; margin-bottom: 1rem; }
            .message { color: #666; margin-bottom: 1rem; }
            .button { 
              background: #3b82f6; color: white; padding: 0.5rem 1rem; 
              border: none; border-radius: 0.25rem; cursor: pointer; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>Aplicativo Offline</h1>
            <p class="message">Você está offline. Alguns recursos podem não estar disponíveis.</p>
            <button class="button" onclick="location.reload()">Tentar Novamente</button>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  // Para outros tipos de recursos
  return new Response(null, { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}
