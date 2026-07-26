import React, { useState, useEffect } from 'react';
import {
  QuoteItemInput,
  ProductLineKey,
  ClientTypeKey,
  UnitType,
  PriceConfig,
  RollWidthConfig,
  CalculatedItem
} from '../types';
import { SIZE_PRESETS, calculateItem, convertToCm } from '../utils/pricing';
import { RollVisualizer } from './RollVisualizer';
import { PlusCircle, Sparkles, Check, RefreshCw } from 'lucide-react';

interface ItemFormProps {
  productLine: ProductLineKey;
  clientType: ClientTypeKey;
  prices: PriceConfig;
  rollConfig: RollWidthConfig;
  onAddItem: (item: QuoteItemInput) => void;
  editingItem: QuoteItemInput | null;
  onCancelEdit?: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({
  productLine,
  clientType,
  prices,
  rollConfig,
  onAddItem,
  editingItem,
  onCancelEdit,
}) => {
  const [description, setDescription] = useState('Foto 01');
  const [side1, setSide1] = useState<number>(20);
  const [side2, setSide2] = useState<number>(30);
  const [unit, setUnit] = useState<UnitType>('cm');
  const [quantity, setQuantity] = useState<number>(1);

  // Load editing item into form if editing
  useEffect(() => {
    if (editingItem) {
      setDescription(editingItem.description);
      setSide1(editingItem.side1);
      setSide2(editingItem.side2);
      setUnit(editingItem.unit);
      setQuantity(editingItem.quantity);
    }
  }, [editingItem]);

  // Current item object
  const currentInput: QuoteItemInput = {
    id: editingItem ? editingItem.id : `item-${Date.now()}`,
    description: description.trim() || 'Impresión',
    productLine,
    clientType,
    side1: Number(side1) || 0,
    side2: Number(side2) || 0,
    unit,
    quantity: Number(quantity) || 1,
  };

  // Calculated preview item
  const calculatedPreview: CalculatedItem = calculateItem(currentInput, prices, rollConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (side1 <= 0 || side2 <= 0) return;

    onAddItem(currentInput);

    // Reset form for next item
    if (!editingItem) {
      setDescription(`Foto 0${Math.floor(Math.random() * 89 + 10)}`);
      // Keep unit and sizes or reset to default
    }
  };

  const applyPreset = (presetSide1: number, presetSide2: number, presetUnit: UnitType, label: string) => {
    setSide1(presetSide1);
    setSide2(presetSide2);
    setUnit(presetUnit);
    if (!editingItem) {
      setDescription(`Foto (${label.split(' ')[0]})`);
    }
  };

  return (
    <div id="item-form-card" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00AEEF] animate-pulse" />
          <h2 className="text-sm font-bold tracking-wide uppercase">
            {editingItem ? 'Editar Pieza / Imagen' : 'Agregar Pieza a la Cotización'}
          </h2>
        </div>

        {editingItem && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-gray-300 hover:text-white underline cursor-pointer"
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Item Label / Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Etiqueta / Nombre de la Imagen
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Foto Retrato, Canvas Sala, Cuadro 1"
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] transition-all bg-gray-50/50"
            required
          />
        </div>

        {/* Preset Quick Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#EC008C]" />
              Medidas Frecuentes / Estándar:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SIZE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.side1, p.side2, p.unit, p.label)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-gray-200 bg-gray-50 hover:bg-cyan-50 hover:border-cyan-300 hover:text-[#00AEEF] transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-200/80">
          
          {/* Side 1 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Lado 1
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={side1 || ''}
                onChange={(e) => setSide1(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] bg-white"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                {unit}
              </span>
            </div>
            {side1 > 0 && unit === 'in' && (
              <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                ≈ {convertToCm(side1, 'in').toFixed(1)} cm
              </span>
            )}
          </div>

          {/* Side 2 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Lado 2
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={side2 || ''}
                onChange={(e) => setSide2(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] bg-white"
                required
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                {unit}
              </span>
            </div>
            {side2 > 0 && unit === 'in' && (
              <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                ≈ {convertToCm(side2, 'in').toFixed(1)} cm
              </span>
            )}
          </div>

          {/* Unit Toggle & Quantity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Unidad
              </label>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden p-0.5 bg-white">
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`flex-1 py-1.5 text-xs font-bold transition-all rounded ${
                    unit === 'cm'
                      ? 'bg-[#00AEEF] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`flex-1 py-1.5 text-xs font-bold transition-all rounded ${
                    unit === 'in'
                      ? 'bg-[#00AEEF] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  pulg (in)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Cant.
              </label>
              <input
                type="number"
                min="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm font-mono font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-[#00AEEF] bg-white text-center"
                required
              />
            </div>
          </div>

        </div>

        {/* Interactive Roll Graphic Visualizer */}
        <RollVisualizer item={calculatedPreview} />

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={calculatedPreview.exceedsMaxRoll || side1 <= 0 || side2 <= 0}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
            calculatedPreview.exceedsMaxRoll
              ? 'bg-gray-400 cursor-not-allowed'
              : editingItem
              ? 'bg-[#EC008C] hover:bg-pink-700 active:scale-[0.99]'
              : 'bg-[#00AEEF] hover:bg-cyan-600 active:scale-[0.99]'
          }`}
        >
          {editingItem ? (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Actualizar Pieza</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Agregar a la Cotización ({calculatedPreview.subtotal > 0 ? `$${calculatedPreview.subtotal.toFixed(2)} MXN` : '$0.00'})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
