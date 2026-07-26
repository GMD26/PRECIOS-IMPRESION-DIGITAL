import React from 'react';
import { Quotation } from '../types';
import { formatCurrency } from '../utils/pricing';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import { X, History, Download, Play, Trash2, Calendar, User } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: Quotation[];
  onLoadQuote: (quote: Quotation) => void;
  onDeleteQuote: (folio: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadQuote,
  onDeleteQuote,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Modal Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#EC008C]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Historial de Cotizaciones Guardadas ({history.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <History className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">No hay cotizaciones en el historial</p>
              <p className="text-xs text-gray-400">
                Las cotizaciones guardadas aparecerán aquí para fácil consulta o regeneración de PDF.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((quote) => (
                <div
                  key={quote.folio}
                  className="bg-gray-50 border border-gray-200 hover:border-cyan-300 rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-cyan-100 text-[#00AEEF] px-2 py-0.5 rounded">
                        {quote.folio}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {quote.clientName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {quote.date}
                      </span>
                      <span>•</span>
                      <span>{quote.items.length} pieza(s)</span>
                      <span>•</span>
                      <span>{quote.totalAreaM2.toFixed(3)} m²</span>
                    </div>
                  </div>

                  {/* Right Price & Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block font-mono">Total</span>
                      <span className="text-sm font-black text-[#EC008C] font-mono">
                        {formatCurrency(quote.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadQuote(quote);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Cargar esta cotización en la calculadora"
                      >
                        <Play className="w-3.5 h-3.5 text-[#00AEEF]" />
                        <span>Cargar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => generateQuotationPDF(quote)}
                        className="px-2.5 py-1.5 text-xs font-bold text-white bg-[#00AEEF] hover:bg-cyan-600 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteQuote(quote.folio)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar del historial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        {history.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer"
            >
              Vaciar Todo el Historial
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg bg-white"
            >
              Cerrar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
