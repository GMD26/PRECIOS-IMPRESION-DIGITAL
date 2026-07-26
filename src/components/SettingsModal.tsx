import React, { useState } from 'react';
import { PriceConfig, RollWidthConfig } from '../types';
import { DEFAULT_PRICES, DEFAULT_ROLL_WIDTHS } from '../utils/pricing';
import { X, Save, RotateCcw, DollarSign, Sliders } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prices: PriceConfig;
  onSavePrices: (newPrices: PriceConfig) => void;
  rollConfig: RollWidthConfig;
  onSaveRollConfig: (newConfig: RollWidthConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  prices,
  onSavePrices,
  rollConfig,
  onSaveRollConfig,
}) => {
  const [fotoPublico, setFotoPublico] = useState(prices.foto.publico);
  const [fotoMaquila, setFotoMaquila] = useState(prices.foto.maquila);
  const [artePublico, setArtePublico] = useState(prices.arte.publico);
  const [arteMaquila, setArteMaquila] = useState(prices.arte.maquila);

  const [fotoRolls, setFotoRolls] = useState(rollConfig.foto.join(', '));
  const [arteRolls, setArteRolls] = useState(rollConfig.arte.join(', '));
  const [minBillableCm, setMinBillableCm] = useState(rollConfig.minBillableLengthCm);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newPrices: PriceConfig = {
      foto: {
        publico: Number(fotoPublico) || DEFAULT_PRICES.foto.publico,
        maquila: Number(fotoMaquila) || DEFAULT_PRICES.foto.maquila,
      },
      arte: {
        publico: Number(artePublico) || DEFAULT_PRICES.arte.publico,
        maquila: Number(arteMaquila) || DEFAULT_PRICES.arte.maquila,
      },
    };

    const parseRolls = (str: string, fallback: number[]) => {
      const arr = str
        .split(',')
        .map((s) => parseFloat(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);
      return arr.length > 0 ? arr.sort((a, b) => a - b) : fallback;
    };

    const newRollConfig: RollWidthConfig = {
      foto: parseRolls(fotoRolls, DEFAULT_ROLL_WIDTHS.foto),
      arte: parseRolls(arteRolls, DEFAULT_ROLL_WIDTHS.arte),
      minBillableLengthCm: Number(minBillableCm) || DEFAULT_ROLL_WIDTHS.minBillableLengthCm,
    };

    onSavePrices(newPrices);
    onSaveRollConfig(newRollConfig);
    onClose();
  };

  const handleReset = () => {
    setFotoPublico(DEFAULT_PRICES.foto.publico);
    setFotoMaquila(DEFAULT_PRICES.foto.maquila);
    setArtePublico(DEFAULT_PRICES.arte.publico);
    setArteMaquila(DEFAULT_PRICES.arte.maquila);

    setFotoRolls(DEFAULT_ROLL_WIDTHS.foto.join(', '));
    setArteRolls(DEFAULT_ROLL_WIDTHS.arte.join(', '));
    setMinBillableCm(DEFAULT_ROLL_WIDTHS.minBillableLengthCm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200">
        
        {/* Modal Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00AEEF]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Configuración de Precios y Rollos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Precios por m2 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">
              <DollarSign className="w-4 h-4 text-[#00AEEF]" />
              <span>Precios por Metro Cuadrado ($ / m²)</span>
            </div>

            {/* Impresión Fotográfica */}
            <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 space-y-3">
              <span className="text-xs font-bold text-cyan-900 block">
                1. Impresión Fotográfica Digital
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Público en General
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      step="1"
                      value={fotoPublico}
                      onChange={(e) => setFotoPublico(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-gray-900 border border-gray-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Predeterminado: $666</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Fotógrafo / Maquila
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      step="1"
                      value={fotoMaquila}
                      onChange={(e) => setFotoMaquila(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-gray-900 border border-gray-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Predeterminado: $490</span>
                </div>
              </div>
            </div>

            {/* Papel de Arte / Canvas */}
            <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 space-y-3">
              <span className="text-xs font-bold text-pink-900 block">
                2. Papel Arte / Tela Canvas / Algodón 100%
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Público en General
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      step="1"
                      value={artePublico}
                      onChange={(e) => setArtePublico(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-gray-900 border border-gray-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Predeterminado: $1699</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Artista / Fotógrafo / Maquila
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      step="1"
                      value={arteMaquila}
                      onChange={(e) => setArteMaquila(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-mono font-bold text-gray-900 border border-gray-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">Predeterminado: $1300</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Anchos de Rollo */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1">
              <Sliders className="w-4 h-4 text-[#EC008C]" />
              <span>Anchos de Rollo y Largo Mínimo</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Anchos de Rollo - Fotográfico (cm, separados por coma)
                </label>
                <input
                  type="text"
                  value={fotoRolls}
                  onChange={(e) => setFotoRolls(e.target.value)}
                  placeholder="Ej: 61, 91, 111"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Anchos de Rollo - Canvas / Algodón (cm, separados por coma)
                </label>
                <input
                  type="text"
                  value={arteRolls}
                  onChange={(e) => setArteRolls(e.target.value)}
                  placeholder="Ej: 61, 91, 107"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Largo Mínimo Facturable (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={minBillableCm}
                  onChange={(e) => setMinBillableCm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg bg-white"
                />
                <span className="text-[10px] text-gray-500">
                  10 pulgadas = 25.4 cm (Requisito mínimo de arrastre del plotter)
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Valores</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#00AEEF] hover:bg-cyan-600 rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
