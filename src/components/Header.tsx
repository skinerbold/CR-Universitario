
import React from 'react';
import { Calculator, GraduationCap, Smartphone } from 'lucide-react';
import { usePWA } from './PWAProvider';

const Header = () => {
  const { isStandalone, isInstalled } = usePWA();

  return (
    <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-8 px-6 shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-4 relative">
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Calculadora de Rendimento Universitário
          </h1>
          
          {/* Indicador PWA */}
          {isStandalone && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              <span>PWA</span>
            </div>
          )}
        </div>
        <p className="text-center text-blue-100 text-lg">
          Calcule sua média ponderada de forma rápida e precisa
          {isStandalone && (
            <span className="block text-sm mt-1 text-blue-200">
              🚀 Funcionando offline!
            </span>
          )}
        </p>
      </div>
    </header>
  );
};

export default Header;
