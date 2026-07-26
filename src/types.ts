/**
 * Types & Interfaces for Calculadora de Precios de Impresión Fotográfica - Grupo Más Digital
 */

export type ProductLineKey = 'foto' | 'arte';
export type ClientTypeKey = 'publico' | 'maquila';
export type UnitType = 'cm' | 'in';

export interface PriceConfig {
  foto: {
    publico: number;  // Default: 666
    maquila: number;  // Default: 490
  };
  arte: {
    publico: number;  // Default: 1699
    maquila: number;  // Default: 1300
  };
}

export interface RollWidthConfig {
  foto: number[]; // Default: [61, 91, 111]
  arte: number[]; // Default: [61, 91, 107]
  minBillableLengthCm: number; // Default: 25.4 cm (10 in)
}

export interface QuoteItemInput {
  id: string;
  description: string;
  productLine: ProductLineKey;
  clientType: ClientTypeKey;
  side1: number;
  side2: number;
  unit: UnitType;
  quantity: number;
}

export interface CalculatedItem {
  id: string;
  description: string;
  productLine: ProductLineKey;
  clientType: ClientTypeKey;
  side1Orig: number;
  side2Orig: number;
  unitOrig: UnitType;
  
  // Normalized in cm
  widthCm: number;
  lengthCm: number;
  
  // Selected roll parameters
  selectedRollWidthCm: number;
  billableLengthCm: number;
  orientationUsed: 'normal' | 'rotated'; // normal: side1 along roll width, rotated: side2 along roll width
  exceedsMaxRoll: boolean;
  maxAvailableRollCm: number;

  // Financials
  quantity: number;
  areaPerPieceM2: number;
  totalAreaM2: number;
  appliedPricePerM2: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quotation {
  folio: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  productLine: ProductLineKey;
  clientType: ClientTypeKey;
  requiresInvoice: boolean;
  items: CalculatedItem[];
  totalAreaM2: number;
  subtotal: number;
  iva: number;
  total: number;
  notes?: string;
}

export interface SizePreset {
  label: string;
  side1: number;
  side2: number;
  unit: UnitType;
  category: 'foto' | 'cuadros' | 'arte';
}
