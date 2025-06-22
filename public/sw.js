// Service Worker para PWA da Calculadora de CR
const CACHE_NAME = 'cr-calc-v1.0.0';
const STATIC_CACHE_NAME = 'cr-calc-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'cr-calc-dynamic-v1.0.0';

// Recursos para cache estático (não mudam frequentemente)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Assets do Vite serão adicionados dinamicamente
];

// URLs que devem ser sempre buscadas da rede
const NETWORK_ONLY = [
  '/api/',
  'chrome-extension://'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('📦 Service Worker: Cache aberto');
      // Cache apenas recursos básicos na instalação
      return cache.addAll(['/', '/index.html', '/manifest.json']);
    }).catch((error) => {
      console.error('❌ Erro ao fazer cache inicial:', error);
    })
  );
  
  // Força ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Reivindica controle de todas as páginas
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignora requisições de extensões e protocolos especiais
  if (!url.protocol.startsWith('http') || 
      NETWORK_ONLY.some(pattern => url.pathname.startsWith(pattern))) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Estratégia: Cache First para assets estáticos
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request);
    }
    
    // Estratégia: Network First para HTML e dados
    if (request.destination === 'document' || url.pathname.endsWith('.html')) {
      return await networkFirst(request);
    }
    
    // Estratégia: Stale While Revalidate para outros recursos
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error('❌ Erro no fetch:', error);
    
    // Fallback para página offline se disponível
    if (request.destination === 'document') {
      const cachedResponse = await caches.match('/');
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Verifica se é um asset estático
function isStaticAsset(pathname) {
  return pathname.includes('/assets/') || 
         pathname.endsWith('.js') || 
         pathname.endsWith('.css') || 
         pathname.endsWith('.png') || 
         pathname.endsWith('.svg') || 
         pathname.endsWith('.ico') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2');
}

// Estratégia: Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Estratégia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Silencia erros de rede para esta estratégia
  });
  
  return cachedResponse || fetchPromise;
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync executado');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Aqui podemos implementar sincronização de dados
  // Por exemplo, sincronizar dados de disciplinas/faltas
  console.log('📡 Executando sincronização em background...');
}

// Notificações Push (preparado para futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nova notificação da Calculadora CR',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icons/icon-96x96.png'
        },
        {
          action: 'close',
          title: 'Fechar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Calculadora CR', options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🚀 Service Worker carregado com sucesso!');
