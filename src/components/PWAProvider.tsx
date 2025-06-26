import { useEffect, useState } from 'react';

interface PWAProps {
  children: React.ReactNode;
}

export const PWAProvider = ({ children }: PWAProps) => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Só registra Service Worker em produção ou quando explicitamente habilitado
      const isDev = import.meta.env.DEV;
      const forceServiceWorker = typeof localStorage !== 'undefined' && 
        localStorage.getItem('enableServiceWorker') === 'true';
      
      if ('serviceWorker' in navigator && (!isDev || forceServiceWorker)) {
        const registerSW = () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('✅ Service Worker registrado:', registration);
            })
            .catch((error) => {
              console.error('❌ Falha ao registrar Service Worker:', error);
              // Não define hasError para não quebrar a aplicação
            });
        };

        if (document.readyState === 'loading') {
          window.addEventListener('load', registerSW);
        } else {
          registerSW();
        }
      } else if (isDev) {
        console.log('🚧 Service Worker desabilitado em desenvolvimento');
        console.log('💡 Para habilitar: localStorage.setItem("enableServiceWorker", "true")');
      }
    } catch (error) {
      console.error('❌ Erro ao configurar PWA:', error);
      setHasError(true);
    }

    try {
      // Detectar se app é instalável
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Detectar quando app foi instalado
      window.addEventListener('appinstalled', () => {
        console.log('🎉 PWA foi instalada!');
        setIsInstallable(false);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    } catch (error) {
      console.error('❌ Erro ao configurar eventos PWA:', error);
    }
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Usuário aceitou instalar a PWA');
        } else {
          console.log('❌ Usuário recusou instalar a PWA');
        }
        
        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (error) {
        console.error('❌ Erro ao instalar PWA:', error);
      }
    }
  };

  // Se houver erro crítico, ainda renderiza o children
  if (hasError) {
    console.warn('⚠️ PWA com erro, mas aplicação continuará funcionando');
  }

  return (
    <>
      {children}
      {isInstallable && <InstallPrompt onInstall={installApp} />}
    </>
  );
};

interface InstallPromptProps {
  onInstall: () => void;
}

const InstallPrompt = ({ onInstall }: InstallPromptProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Instalar App</h3>
          <p className="text-xs opacity-90">
            Adicione à tela inicial para acesso rápido!
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onInstall}
            className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
          >
            Instalar
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200 text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para verificar se está rodando como PWA
export const usePWA = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    try {
      // Verifica se está rodando em modo standalone (PWA instalada)
      const checkStandalone = () => {
        return window.matchMedia('(display-mode: standalone)').matches ||
               (window.navigator as any).standalone === true;
      };

      setIsStandalone(checkStandalone());
      setIsInstalled(checkStandalone());

      // Listener para mudanças no display mode
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsStandalone(e.matches);
        setIsInstalled(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.error('❌ Erro no hook usePWA:', error);
      return () => {}; // cleanup vazio em caso de erro
    }
  }, []);

  return {
    isStandalone,
    isInstalled,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
};

export default PWAProvider;
