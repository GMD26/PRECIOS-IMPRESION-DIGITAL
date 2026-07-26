import React from 'react';
import { CalculatedItem, QuoteItemInput } from '../types';
import { formatCurrency } from '../utils/pricing';
import { Trash2, Edit3, Copy, AlertCircle, Layers } from 'lucide-react';

interface ItemsListProps {
  items: CalculatedItem[];
  onEditItem: (input: QuoteItemInput) => void;
  onDuplicateItem: (item: CalculatedItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  onEditItem,
  onDuplicateItem,
  onDeleteItem,
  onClearAll,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-cyan-50 text-[#00AEEF] flex items-center justify-center mx-auto mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800">No hay piezas agregadas aún</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Ingresa las dimensiones de la imagen en el formulario para calcular el costo de impresión por m² y optimización de rollo.
        </p>
      </div>
    );
  }

  const totalArea = items.reduce((acc, curr) => acc + curr.totalAreaM2, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Piezas en la Cotización ({items.length})
          </h3>
          <span className="bg-cyan-100 text-[#00AEEF] font-mono font-bold text-xs px-2 py-0.5 rounded-full">
            {totalArea.toFixed(3)} m² Totales
          </span>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors cursor-pointer"
        >
          Vaciar Lista
        </button>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-100/80 text-gray-600 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-4"># / Etiqueta</th>
              <th className="py-2.5 px-3 text-center">Cant.</th>
              <th className="py-2.5 px-3 text-center">Medida Solicitada</th>
              <th className="py-2.5 px-3 text-center">Ancho Rollo</th>
              <th className="py-2.5 px-3 text-center">Largo Fact.</th>
              <th className="py-2.5 px-3 text-right">Área Piece</th>
              <th className="py-2.5 px-3 text-right">Precio m²</th>
              <th className="py-2.5 px-4 text-right">Subtotal</th>
              <th className="py-2.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 font-medium">
            {items.map((item, idx) => {
              const isMinLength = item.billableLengthCm > item.lengthCm;

              return (
                <tr key={item.id} className="hover:bg-cyan-50/30 transition-colors">
                  
                  {/* Item Description */}
                  <td className="py-3 px-4 font-bold text-gray-900">
                    <span className="text-[#00AEEF] font-mono mr-1">#{idx + 1}</span>
                    {item.description}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 text-center font-bold font-mono">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {item.quantity}
                    </span>
                  </td>

                  {/* Original Dimensions */}
                  <td className="py-3 px-3 text-center font-mono">
                    {item.side1Orig} x {item.side2Orig} {item.unitOrig}
                  </td>

                  {/* Roll Selected */}
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                      {item.selectedRollWidthCm} cm
                    </span>
                  </td>

                  {/* Billable Length */}
                  <td className="py-3 px-3 text-center font-mono">
                    <span className={`inline-block px-1.5 py-0.5 rounded ${isMinLength ? 'bg-amber-100 text-amber-900 font-bold' : ''}`}>
                      {item.billableLengthCm.toFixed(1)} cm
                    </span>
                    {isMinLength && (
                      <span
                        className="ml-1 text-[10px] text-amber-600 font-bold inline-block"
                        title="Mínimo facturable aplicado (10 pulgadas = 25.4cm)"
                      >
                        (10")
                      </span>
                    )}
                  </td>

                  {/* Area */}
                  <td className="py-3 px-3 text-right font-mono font-semibold text-gray-800">
                    {item.totalAreaM2.toFixed(3)} m²
                  </td>

                  {/* Price per m2 */}
                  <td className="py-3 px-3 text-right font-mono text-gray-600">
                    {formatCurrency(item.appliedPricePerM2)}
                  </td>

                  {/* Subtotal */}
                  <td className="py-3 px-4 text-right font-bold font-mono text-[#00AEEF]">
                    {formatCurrency(item.subtotal)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onEditItem({
                            id: item.id,
                            description: item.description,
                            productLine: item.productLine,
                            clientType: item.clientType,
                            side1: item.side1Orig,
                            side2: item.side2Orig,
                            unit: item.unitOrig,
                            quantity: item.quantity,
                          })
                        }
                        className="p-1 rounded text-gray-500 hover:text-[#00AEEF] hover:bg-cyan-50 transition-colors cursor-pointer"
                        title="Editar pieza"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateItem(item)}
                        className="p-1 rounded text-gray-500 hover:text-[#EC008C] hover:bg-pink-50 transition-colors cursor-pointer"
                        title="Duplicar pieza"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Eliminar pieza"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
