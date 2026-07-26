import React, { useState, useEffect } from 'react';
import {
  PriceConfig,
  RollWidthConfig,
  QuoteItemInput,
  CalculatedItem,
  Quotation,
  ProductLineKey,
  ClientTypeKey
} from './types';
import {
  DEFAULT_PRICES,
  DEFAULT_ROLL_WIDTHS,
  calculateQuotation,
  generateFolio
} from './utils/pricing';
import { generateQuotationPDF } from './utils/pdfGenerator';
import { CompanyHeader } from './components/CompanyHeader';
import { ItemForm } from './components/ItemForm';
import { ItemsList } from './components/ItemsList';
import { QuoteSummary } from './components/QuoteSummary';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { CheckCircle2, Info, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_PRICES_KEY = 'gmd_price_config_v1';
const LOCAL_STORAGE_ROLLS_KEY = 'gmd_rolls_config_v1';
const LOCAL_STORAGE_HISTORY_KEY = 'gmd_quote_history_v1';

export default function App() {
  // 1. Settings State with localStorage persistence
  const [prices, setPrices] = useState<PriceConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRICES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PRICES;
    } catch {
      return DEFAULT_PRICES;
    }
  });

  const [rollConfig, setRollConfig] = useState<RollWidthConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ROLLS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ROLL_WIDTHS;
    } catch {
      return DEFAULT_ROLL_WIDTHS;
    }
  });

  // 2. Quote History State
  const [history, setHistory] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Current Quote State
  const [folio, setFolio] = useState<string>(generateFolio());
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [productLine, setProductLine] = useState<ProductLineKey>('foto');
  const [clientType, setClientType] = useState<ClientTypeKey>('publico');
  const [requiresInvoice, setRequiresInvoice] = useState<boolean>(false);

  // Quote Items
  const [quoteItems, setQuoteItems] = useState<QuoteItemInput[]>([
    {
      id: 'default-1',
      description: 'Foto Ampliación 1',
      productLine: 'foto',
      clientType: 'publico',
      side1: 20,
      side2: 30,
      unit: 'cm',
      quantity: 1,
    }
  ]);

  const [editingItem, setEditingItem] = useState<QuoteItemInput | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save to localStorage when settings change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRICES_KEY, JSON.stringify(prices));
    } catch (e) {
      console.error(e);
    }
  }, [prices]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ROLLS_KEY, JSON.stringify(rollConfig));
    } catch (e) {
      console.error(e);
    }
  }, [rollConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Compute live quotation
  const currentQuotation: Quotation = calculateQuotation(
    clientName,
    clientPhone,
    clientEmail,
    productLine,
    clientType,
    requiresInvoice,
    quoteItems,
    prices,
    rollConfig,
    folio
  );

  // Item Handlers
  const handleAddOrUpdateItem = (input: QuoteItemInput) => {
    if (editingItem) {
      setQuoteItems((prev) =>
        prev.map((item) => (item.id === input.id ? input : item))
      );
      setEditingItem(null);
      showToast('Pieza actualizada correctamente');
    } else {
      setQuoteItems((prev) => [...prev, input]);
      showToast('Pieza agregada a la cotización');
    }
  };

  const handleDuplicateItem = (item: CalculatedItem) => {
    const newItem: QuoteItemInput = {
      id: `item-${Date.now()}`,
      description: `${item.description} (Copia)`,
      productLine: item.productLine,
      clientType: item.clientType,
      side1: item.side1Orig,
      side2: item.side2Orig,
      unit: item.unitOrig,
      quantity: item.quantity,
    };
    setQuoteItems((prev) => [...prev, newItem]);
    showToast('Pieza duplicada');
  };

  const handleDeleteItem = (id: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
    if (editingItem?.id === id) {
      setEditingItem(null);
    }
    showToast('Pieza eliminada');
  };

  const handleClearAllItems = () => {
    if (window.confirm('¿Deseas vaciar todas las piezas de la cotización actual?')) {
      setQuoteItems([]);
      setEditingItem(null);
      showToast('Lista vaciada');
    }
  };

  const handleResetQuote = () => {
    setFolio(generateFolio());
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setRequiresInvoice(false);
    setQuoteItems([]);
    setEditingItem(null);
    showToast('Nueva cotización iniciada');
  };

  // PDF Download Handler
  const handleGeneratePDF = async () => {
    if (currentQuotation.items.length === 0) return;
    try {
      showToast('Generando documento PDF...');
      await generateQuotationPDF(currentQuotation);
      showToast('¡Cotización PDF descargada con éxito!');
    } catch (err) {
      console.error(err);
      showToast('Error al generar el PDF');
    }
  };

  // History Handlers
  const handleSaveToHistory = () => {
    if (currentQuotation.items.length === 0) return;

    setHistory((prev) => {
      // Replace if folio exists or prepend
      const existingIdx = prev.findIndex((q) => q.folio === currentQuotation.folio);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = currentQuotation;
        return updated;
      }
      return [currentQuotation, ...prev];
    });

    showToast(`Cotización ${currentQuotation.folio} guardada en el historial`);
  };

  const handleLoadQuoteFromHistory = (quote: Quotation) => {
    setFolio(quote.folio);
    setClientName(quote.clientName || '');
    setClientPhone(quote.clientPhone || '');
    setClientEmail(quote.clientEmail || '');
    setProductLine(quote.productLine);
    setClientType(quote.clientType);
    setRequiresInvoice(quote.requiresInvoice);

    // Map calculated items back to inputs
    const inputs: QuoteItemInput[] = quote.items.map((i) => ({
      id: i.id,
      description: i.description,
      productLine: i.productLine,
      clientType: i.clientType,
      side1: i.side1Orig,
      side2: i.side2Orig,
      unit: i.unitOrig,
      quantity: i.quantity,
    }));

    setQuoteItems(inputs);
    setEditingItem(null);
    showToast(`Cotización ${quote.folio} cargada`);
  };

  const handleDeleteHistoryQuote = (folioToDelete: string) => {
    setHistory((prev) => prev.filter((q) => q.folio !== folioToDelete));
    showToast('Cotización eliminada del historial');
  };

  const handleClearHistory = () => {
    if (window.confirm('¿Deseas eliminar todo el historial de cotizaciones?')) {
      setHistory([]);
      showToast('Historial vaciado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100/70 text-gray-900 font-sans antialiased pb-12 flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-2 animate-bounce text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#00AEEF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Fixed Header */}
      <CompanyHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {/* Banner Notice / Context */}
        <div className="bg-gradient-to-r from-cyan-900 via-sky-900 to-gray-900 text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-md border border-cyan-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFF200]" />
              <h2 className="text-sm font-black uppercase tracking-wide text-cyan-200">
                Calculadora de Impresión por Área (m²) en Rollos
              </h2>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl">
              Optimización automática de anchos de rollo (61cm, 91cm, 107cm, 111cm) con aplicación estricta del largo mínimo facturable (10" / 25.4cm) y generación inmediata de cotización PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs font-mono">
            <span className="text-cyan-300 font-bold">Tarifa Activa:</span>
            <span className="text-white font-bold">
              ${prices[productLine][clientType]} / m²
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Width 7): Form + Added Items List */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Form */}
            <ItemForm
              productLine={productLine}
              clientType={clientType}
              prices={prices}
              rollConfig={rollConfig}
              onAddItem={handleAddOrUpdateItem}
              editingItem={editingItem}
              onCancelEdit={() => setEditingItem(null)}
            />

            {/* Added Items List Table */}
            <ItemsList
              items={currentQuotation.items}
              onEditItem={(item) => setEditingItem(item)}
              onDuplicateItem={handleDuplicateItem}
              onDeleteItem={handleDeleteItem}
              onClearAll={handleClearAllItems}
            />

          </div>

          {/* Right Column (Width 5): Quote Summary & Actions */}
          <div className="lg:col-span-5">
            <QuoteSummary
              clientName={clientName}
              setClientName={setClientName}
              clientPhone={clientPhone}
              setClientPhone={setClientPhone}
              clientEmail={clientEmail}
              setClientEmail={setClientEmail}
              productLine={productLine}
              setProductLine={setProductLine}
              clientType={clientType}
              setClientType={setClientType}
              requiresInvoice={requiresInvoice}
              setRequiresInvoice={setRequiresInvoice}
              quotation={currentQuotation}
              prices={prices}
              onGeneratePDF={handleGeneratePDF}
              onSaveHistory={handleSaveToHistory}
              onResetQuote={handleResetQuote}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-gray-700">
            Grupo Más Digital — Centro de Impresión Alta Definición
          </p>
          <p className="text-[11px] text-gray-500">
            Matriz Puebla: Ave. Ignacio Zaragoza 2-1, Puebla, Pue. C.P. 72520 | WhatsApp: +52 1 221 261 5111
          </p>
          <p className="text-[10px] text-gray-400">
            © {new Date().getFullYear()} Grupo Más Digital. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        prices={prices}
        onSavePrices={setPrices}
        rollConfig={rollConfig}
        onSaveRollConfig={setRollConfig}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadQuote={handleLoadQuoteFromHistory}
        onDeleteQuote={handleDeleteHistoryQuote}
        onClearHistory={handleClearHistory}
      />

    </div>
  );
}
