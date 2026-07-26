import React from 'react';
import {
  ProductLineKey,
  ClientTypeKey,
  Quotation,
  PriceConfig
} from '../types';
import {
  PRODUCT_LINE_LABELS,
  CLIENT_TYPE_LABELS,
  formatCurrency
} from '../utils/pricing';
import {
  FileText,
  Send,
  Save,
  RotateCcw,
  CheckCircle,
  Receipt,
  UserCheck,
  Tag
} from 'lucide-react';

interface QuoteSummaryProps {
  clientName: string;
  setClientName: (val: string) => void;
  clientPhone: string;
  setClientPhone: (val: string) => void;
  clientEmail: string;
  setClientEmail: (val: string) => void;
  productLine: ProductLineKey;
  setProductLine: (val: ProductLineKey) => void;
  clientType: ClientTypeKey;
  setClientType: (val: ClientTypeKey) => void;
  requiresInvoice: boolean;
  setRequiresInvoice: (val: boolean) => void;
  quotation: Quotation;
  prices: PriceConfig;
  onGeneratePDF: () => void;
  onSaveHistory: () => void;
  onResetQuote: () => void;
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  productLine,
  setProductLine,
  clientType,
  setClientType,
  requiresInvoice,
  setRequiresInvoice,
  quotation,
  prices,
  onGeneratePDF,
  onSaveHistory,
  onResetQuote,
}) => {
  const currentRatePerM2 = prices[productLine]?.[clientType] || 0;

  // WhatsApp share message
  const handleWhatsAppShare = () => {
    let msg = `*Cotización Grupo Más Digital* - Folio: ${quotation.folio}\n`;
    msg += `Cliente: ${quotation.clientName}\n`;
    msg += `Línea: ${PRODUCT_LINE_LABELS[quotation.productLine]}\n`;
    msg += `Tipo: ${CLIENT_TYPE_LABELS[quotation.clientType]}\n\n`;
    msg += `*Detalle de Piezas:*\n`;

    quotation.items.forEach((item, idx) => {
      msg += `• #${idx + 1} ${item.description}: ${item.quantity} pza(s) de ${item.side1Orig}x${item.side2Orig}${item.unitOrig} -> ${formatCurrency(item.subtotal)}\n`;
    });

    msg += `\n*Área Total:* ${quotation.totalAreaM2.toFixed(3)} m²\n`;
    msg += `*Subtotal:* ${formatCurrency(quotation.subtotal)}\n`;
    if (quotation.requiresInvoice) {
      msg += `*IVA (16%):* ${formatCurrency(quotation.iva)}\n`;
    }
    msg += `*TOTAL:* ${formatCurrency(quotation.total)}\n\n`;
    msg += `_Cotización válida por 15 días. Grupo Más Digital Matriz Puebla._`;

    const encoded = encodeURIComponent(msg);
    const targetPhone = clientPhone.replace(/\D/g, '');
    const url = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
  };

  return (
    <div id="quote-summary-card" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
      
      {/* Header */}
      <div className="bg-linear-to-r from-gray-900 via-gray-900 to-gray-800 text-white p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#00AEEF]" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Resumen de Cotización
          </h2>
        </div>
        <span className="font-mono text-xs text-[#EC008C] font-bold bg-pink-950/60 px-2.5 py-0.5 rounded border border-pink-800/60">
          Folio: {quotation.folio}
        </span>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Client Name & Contact */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nombre del Cliente
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Juan Pérez / Estudio Fotográfico"
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] bg-gray-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                WhatsApp / Teléfono
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+52 222 123 4567"
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00AEEF] bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00AEEF] bg-white"
              />
            </div>
          </div>
        </div>

        {/* Product Line Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Línea de Producto</span>
            <Tag className="w-3.5 h-3.5 text-[#00AEEF]" />
          </label>
          
          <div className="grid grid-cols-1 gap-2">
            
            {/* Foto Option */}
            <button
              type="button"
              onClick={() => setProductLine('foto')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                productLine === 'foto'
                  ? 'border-[#00AEEF] bg-cyan-50/60 ring-2 ring-[#00AEEF]/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-gray-900">Impresión Fotográfica</p>
                <p className="text-[11px] text-gray-500">Rollos 61cm, 91cm, 111cm</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#00AEEF] font-mono">
                  ${prices.foto[clientType]}/m²
                </span>
              </div>
            </button>

            {/* Arte Option */}
            <button
              type="button"
              onClick={() => setProductLine('arte')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                productLine === 'arte'
                  ? 'border-[#EC008C] bg-pink-50/60 ring-2 ring-[#EC008C]/20'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-gray-900">Papel Arte / Canvas / Algodón 100%</p>
                <p className="text-[11px] text-gray-500">Rollos 61cm, 91cm, max 107cm</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#EC008C] font-mono">
                  ${prices.arte[clientType]}/m²
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Client Type Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Tipo de Cliente (Tarifa)</span>
            <UserCheck className="w-3.5 h-3.5 text-[#EC008C]" />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setClientType('publico')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                clientType === 'publico'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Público en General
            </button>

            <button
              type="button"
              onClick={() => setClientType('maquila')}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                clientType === 'maquila'
                  ? 'bg-[#EC008C] text-white border-[#EC008C] shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-pink-50'
              }`}
            >
              Fotógrafo / Maquila
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Tarifa seleccionada: <strong className="text-gray-800 font-mono">${currentRatePerM2} MXN / m²</strong>
          </p>
        </div>

        {/* Invoice Checkbox */}
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={requiresInvoice}
              onChange={(e) => setRequiresInvoice(e.target.checked)}
              className="w-4 h-4 text-[#00AEEF] rounded focus:ring-[#00AEEF] border-gray-300 cursor-pointer"
            />
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                Requiere Factura (+16% IVA)
              </span>
              <span className="text-[10px] text-gray-500 block">
                Agrega el 16% de IVA al subtotal de la cotización
              </span>
            </div>
          </label>
        </div>

        {/* Totals Breakdown Card */}
        <div className="bg-gray-900 text-white p-4 rounded-xl space-y-2 font-mono">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Área Total Facturable:</span>
            <span className="text-cyan-300 font-bold">{quotation.totalAreaM2.toFixed(3)} m²</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Subtotal:</span>
            <span className="text-white font-bold">{formatCurrency(quotation.subtotal)}</span>
          </div>

          {requiresInvoice && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">IVA (16%):</span>
              <span className="text-gray-300">{formatCurrency(quotation.iva)}</span>
            </div>
          )}

          <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-300">TOTAL FINAL:</span>
            <span className="text-lg font-black text-[#EC008C]">
              {formatCurrency(quotation.total)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* PDF Button */}
          <button
            type="button"
            onClick={onGeneratePDF}
            disabled={quotation.items.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              quotation.items.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#00AEEF] hover:bg-cyan-600 active:scale-[0.99]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Generar Cotización PDF</span>
          </button>

          {/* Secondary Action Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              disabled={quotation.items.length === 0}
              className={`py-2.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                quotation.items.length === 0
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={onSaveHistory}
              disabled={quotation.items.length === 0}
              className={`py-2.5 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                quotation.items.length === 0
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onResetQuote}
            className="w-full py-2 px-3 text-xs text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nueva Cotización / Limpiar Todo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
