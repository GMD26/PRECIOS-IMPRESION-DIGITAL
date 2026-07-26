import React from 'react';
import { Settings, History, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface CompanyHeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const CompanyHeader: React.FC<CompanyHeaderProps> = ({
  onOpenSettings,
  onOpenHistory,
  historyCount,
}) => {
  return (
    <header id="company-header" className="bg-white border-b border-gray-200 shadow-xs sticky top-0 z-30">
      {/* Top CMYK Brand Accent Line */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-[#00AEEF]" />
        <div className="h-full w-1/3 bg-[#EC008C]" />
        <div className="h-full w-1/3 bg-[#FFF200]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Company Title Header */}
          <div className="flex items-center gap-4">
            <div className="relative group flex-shrink-0">
              <img
                src="/logo.svg"
                alt="Grupo Más Digital Logo"
                className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
                onError={(e) => {
                  // Fallback if image fails to render
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="border-l border-gray-200 pl-4 py-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                  Grupo Más Digital
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-cyan-50 text-[#00AEEF] border border-cyan-200">
                  Alta Definición
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 sm:text-sm">
                Centro de Impresión Fotográfica y Fine Art
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                <MapPin className="w-3 h-3 text-[#EC008C]" />
                <span>Matriz Puebla: Ave. Ignacio Zaragoza 2-1, C.P. 72520</span>
              </div>
            </div>
          </div>

          {/* Contact Details & Quick Action Modals */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
            {/* Quick Contact Chips */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
              <a
                href="https://wa.me/5212212615111"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                title="Contactar por WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 fill-emerald-100" />
                <span>+52 1 221 261 5111</span>
              </a>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <a
                href="https://www.grupomasdigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#00AEEF] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden lg:inline">www.grupomasdigital.com</span>
                <span className="lg:hidden">Web</span>
              </a>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <a
                href="mailto:ventas@grupomasdigital.com"
                className="inline-flex items-center gap-1 hover:text-[#EC008C] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden xl:inline">ventas@grupomasdigital.com</span>
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                id="btn-open-history"
                onClick={onOpenHistory}
                className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors shadow-2xs"
                title="Ver historial de cotizaciones"
              >
                <History className="w-4 h-4 text-gray-600" />
                <span className="hidden sm:inline">Historial</span>
                {historyCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-[#EC008C] text-white rounded-full">
                    {historyCount}
                  </span>
                )}
              </button>

              <button
                id="btn-open-settings"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-[#00AEEF] hover:bg-cyan-600 transition-colors shadow-2xs"
                title="Configuración de precios y rollos"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Precios</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
