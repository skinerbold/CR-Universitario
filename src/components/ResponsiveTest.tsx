import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

const ResponsiveTest = () => {
  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-50">
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Smartphone className="w-3 h-3 text-blue-500 sm:hidden" />
          <Tablet className="w-3 h-3 text-green-500 hidden sm:block md:hidden" />
          <Monitor className="w-3 h-3 text-purple-500 hidden md:block" />
        </div>
        <div className="text-gray-600">
          <span className="sm:hidden">Mobile</span>
          <span className="hidden sm:block md:hidden">Tablet</span>
          <span className="hidden md:block">Desktop</span>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;
