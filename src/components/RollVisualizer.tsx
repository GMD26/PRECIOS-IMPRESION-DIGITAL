import React from 'react';
import { CalculatedItem } from '../types';
import { RotateCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RollVisualizerProps {
  item: CalculatedItem;
}

export const RollVisualizer: React.FC<RollVisualizerProps> = ({ item }) => {
  if (item.exceedsMaxRoll) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center text-amber-800 text-xs">
        <div className="flex items-center justify-center gap-2 font-bold mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>¡Dimensión excede los anchos de rollo disponibles!</span>
        </div>
        <p>
          Las medidas ingresadas ({item.side1Orig}{item.unitOrig} x {item.side2Orig}{item.unitOrig}) superan el ancho máximo usable ({item.maxAvailableRollCm} cm).
        </p>
      </div>
    );
  }

  const rollWidth = item.selectedRollWidthCm; // e.g. 61, 91, 107, 111
  const pieceWidth = item.widthCm;
  const pieceLength = item.lengthCm;
  const billableLength = item.billableLengthCm;

  const isMinLengthEnforced = billableLength > pieceLength;
  const widthPercentage = Math.min(100, Math.max(5, (pieceWidth / rollWidth) * 100));
  const wasteWidthCm = Math.max(0, rollWidth - pieceWidth);

  return (
    <div className="bg-gray-900 rounded-xl p-4 text-white shadow-inner">
      <div className="flex items-center justify-between text-xs mb-3 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#00AEEF]">Esquema de Rollo:</span>
          <span className="bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-mono border border-cyan-700/50">
            Rollo {rollWidth} cm
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-300 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-[#EC008C]" />
            Orientación: {item.orientationUsed === 'rotated' ? 'Rotado 90°' : 'Directo'}
          </span>
        </div>
      </div>

      {/* Roll Graphical Canvas */}
      <div className="relative bg-gray-800/80 rounded-lg p-3 border border-gray-700 overflow-hidden">
        
        {/* Roll Top Bar Header */}
        <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-mono">
          <span>0 cm</span>
          <span className="text-cyan-400 font-bold">◄ Ancho de Rollo: {rollWidth} cm ►</span>
          <span>{rollWidth} cm</span>
        </div>

        {/* Outer Roll Container */}
        <div className="relative h-28 bg-gray-950 rounded border border-gray-700 flex overflow-hidden">
          
          {/* Print Piece */}
          <div
            style={{ width: `${widthPercentage}%` }}
            className="h-full bg-linear-to-br from-cyan-600 via-sky-600 to-blue-700 p-2 flex flex-col justify-between border-r-2 border-dashed border-white/60 relative group transition-all duration-300"
          >
            <div className="flex items-center justify-between text-white text-[10px] font-bold">
              <span className="truncate pr-1">{item.description}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-300 flex-shrink-0" />
            </div>

            <div className="text-center my-auto">
              <p className="text-xs font-mono font-black text-white drop-shadow-xs">
                {pieceWidth.toFixed(1)} cm
              </p>
              <p className="text-[10px] text-cyan-100 font-mono">
                Ancho impreso
              </p>
            </div>

            <div className="text-[9px] text-cyan-200 font-mono text-center">
              Largo real: {pieceLength.toFixed(1)} cm
            </div>

            {/* Min length bar indicator overlay */}
            {isMinLengthEnforced && (
              <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 text-amber-950 font-bold text-[9px] py-0.5 text-center">
                Mínimo facturable aplicado (25.4 cm / 10")
              </div>
            )}
          </div>

          {/* Waste / Surplus Margin Area */}
          {wasteWidthCm > 0.5 && (
            <div className="flex-1 h-full bg-stripe-pattern bg-gray-900/90 flex flex-col items-center justify-center text-gray-500 text-[10px] font-mono p-1 text-center border-l border-gray-800">
              <span className="text-gray-400 font-semibold">{wasteWidthCm.toFixed(1)} cm</span>
              <span className="text-[9px] text-gray-500">Sobrante de rollo</span>
            </div>
          )}
        </div>

        {/* Bottom Dimension Indicator */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-1 border-t border-gray-800/80">
          <div>
            <span>Largo Facturable: </span>
            <strong className="text-white font-mono">{billableLength.toFixed(1)} cm ({ (billableLength / 2.54).toFixed(1) }")</strong>
            {isMinLengthEnforced && (
              <span className="ml-1 text-amber-400 text-[10px] font-semibold">(Aplica mínimo 10")</span>
            )}
          </div>

          <div className="text-right">
            <span>Área por pieza: </span>
            <strong className="text-[#00AEEF] font-mono">{item.areaPerPieceM2.toFixed(3)} m²</strong>
          </div>
        </div>

      </div>
    </div>
  );
};
