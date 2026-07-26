import {
  PriceConfig,
  RollWidthConfig,
  ProductLineKey,
  ClientTypeKey,
  UnitType,
  QuoteItemInput,
  CalculatedItem,
  Quotation,
  SizePreset
} from '../types';

export const DEFAULT_PRICES: PriceConfig = {
  foto: {
    publico: 666,
    maquila: 490,
  },
  arte: {
    publico: 1699,
    maquila: 1300,
  }
};

export const DEFAULT_ROLL_WIDTHS: RollWidthConfig = {
  foto: [61, 91, 111],
  arte: [61, 91, 107],
  minBillableLengthCm: 25.4 // 10 inches
};

export const PRODUCT_LINE_LABELS: Record<ProductLineKey, string> = {
  foto: 'Impresión Fotográfica',
  arte: 'Papel de Arte / Tela Canvas / Algodón 100%'
};

export const CLIENT_TYPE_LABELS: Record<ClientTypeKey, string> = {
  publico: 'Público en General',
  maquila: 'Fotógrafo / Artista / Maquila'
};

export const SIZE_PRESETS: SizePreset[] = [
  { label: '4 x 6 in (10x15 cm)', side1: 4, side2: 6, unit: 'in', category: 'foto' },
  { label: '5 x 7 in (13x18 cm)', side1: 5, side2: 7, unit: 'in', category: 'foto' },
  { label: '8 x 10 in (20x25 cm)', side1: 8, side2: 10, unit: 'in', category: 'foto' },
  { label: '11 x 14 in (28x35 cm)', side1: 11, side2: 14, unit: 'in', category: 'foto' },
  { label: '12 x 18 in (30x45 cm)', side1: 12, side2: 18, unit: 'in', category: 'foto' },
  { label: '16 x 20 in (40x50 cm)', side1: 16, side2: 20, unit: 'in', category: 'foto' },
  { label: '20 x 24 in (50x60 cm)', side1: 20, side2: 24, unit: 'in', category: 'foto' },
  { label: '24 x 36 in (60x90 cm)', side1: 24, side2: 36, unit: 'in', category: 'foto' },
  { label: '40 x 60 cm', side1: 40, side2: 60, unit: 'cm', category: 'arte' },
  { label: '50 x 70 cm', side1: 50, side2: 70, unit: 'cm', category: 'arte' },
  { label: '60 x 90 cm', side1: 60, side2: 90, unit: 'cm', category: 'arte' },
  { label: '100 x 150 cm', side1: 100, side2: 150, unit: 'cm', category: 'arte' },
];

/**
 * Converts value to centimeters if in inches
 */
export function convertToCm(value: number, unit: UnitType): number {
  if (unit === 'in') {
    return value * 2.54;
  }
  return value;
}

/**
 * Converts centimeters to inches
 */
export function convertCmToInches(cm: number): number {
  return cm / 2.54;
}

/**
 * Format currency in MXN
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format dimension with unit indicator
 */
export function formatDimension(cmValue: number, origValue: number, origUnit: UnitType): string {
  if (origUnit === 'in') {
    return `${origValue.toFixed(1)}" (${cmValue.toFixed(1)} cm)`;
  }
  return `${cmValue.toFixed(1)} cm (${(cmValue / 2.54).toFixed(1)}")`;
}

/**
 * Calculate single item details
 */
export function calculateItem(
  input: QuoteItemInput,
  prices: PriceConfig,
  rollConfig: RollWidthConfig
): CalculatedItem {
  const side1Cm = convertToCm(input.side1, input.unit);
  const side2Cm = convertToCm(input.side2, input.unit);

  const availableRolls = [...(rollConfig[input.productLine] || DEFAULT_ROLL_WIDTHS[input.productLine])]
    .sort((a, b) => a - b);
  
  const maxAvailableRollCm = availableRolls.length > 0 ? availableRolls[availableRolls.length - 1] : 111;
  const minLengthCm = rollConfig.minBillableLengthCm || 25.4;

  // Evaluate Orientation 1: side1 along roll width, side2 along roll length
  const fit1Roll = availableRolls.find(r => r >= side1Cm);
  const length1Cm = Math.max(side2Cm, minLengthCm);
  const area1 = fit1Roll ? (fit1Roll / 100) * (length1Cm / 100) : Infinity;

  // Evaluate Orientation 2: side2 along roll width, side1 along roll length
  const fit2Roll = availableRolls.find(r => r >= side2Cm);
  const length2Cm = Math.max(side1Cm, minLengthCm);
  const area2 = fit2Roll ? (fit2Roll / 100) * (length2Cm / 100) : Infinity;

  let selectedRollWidthCm = 0;
  let billableLengthCm = 0;
  let orientationUsed: 'normal' | 'rotated' = 'normal';
  let exceedsMaxRoll = false;

  if (fit1Roll === undefined && fit2Roll === undefined) {
    exceedsMaxRoll = true;
    selectedRollWidthCm = maxAvailableRollCm;
    billableLengthCm = Math.max(Math.min(side1Cm, side2Cm), minLengthCm);
  } else if (fit1Roll !== undefined && fit2Roll !== undefined) {
    // Both fit, pick the option with smaller billable roll width or smaller billable area
    if (area1 <= area2) {
      selectedRollWidthCm = fit1Roll;
      billableLengthCm = length1Cm;
      orientationUsed = 'normal';
    } else {
      selectedRollWidthCm = fit2Roll;
      billableLengthCm = length2Cm;
      orientationUsed = 'rotated';
    }
  } else if (fit1Roll !== undefined) {
    selectedRollWidthCm = fit1Roll;
    billableLengthCm = length1Cm;
    orientationUsed = 'normal';
  } else {
    selectedRollWidthCm = fit2Roll!;
    billableLengthCm = length2Cm;
    orientationUsed = 'rotated';
  }

  const areaPerPieceM2 = (selectedRollWidthCm / 100) * (billableLengthCm / 100);
  const quantity = Math.max(1, input.quantity || 1);
  const totalAreaM2 = areaPerPieceM2 * quantity;

  const rateGroup = prices[input.productLine] || DEFAULT_PRICES[input.productLine];
  const appliedPricePerM2 = rateGroup[input.clientType] || rateGroup.publico;

  const unitPrice = areaPerPieceM2 * appliedPricePerM2;
  const subtotal = totalAreaM2 * appliedPricePerM2;

  const widthCm = orientationUsed === 'normal' ? side1Cm : side2Cm;
  const lengthCm = orientationUsed === 'normal' ? side2Cm : side1Cm;

  return {
    id: input.id,
    description: input.description || 'Pieza sin título',
    productLine: input.productLine,
    clientType: input.clientType,
    side1Orig: input.side1,
    side2Orig: input.side2,
    unitOrig: input.unit,
    widthCm,
    lengthCm,
    selectedRollWidthCm,
    billableLengthCm,
    orientationUsed,
    exceedsMaxRoll,
    maxAvailableRollCm,
    quantity,
    areaPerPieceM2,
    totalAreaM2,
    appliedPricePerM2,
    unitPrice,
    subtotal,
  };
}

/**
 * Generate unique folio number
 */
export function generateFolio(): string {
  const date = new Date();
  const year = date.getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `GMD-${year}-${randomNum}`;
}

/**
 * Calculate complete quotation breakdown
 */
export function calculateQuotation(
  clientName: string,
  clientPhone: string,
  clientEmail: string,
  productLine: ProductLineKey,
  clientType: ClientTypeKey,
  requiresInvoice: boolean,
  inputs: QuoteItemInput[],
  prices: PriceConfig,
  rollConfig: RollWidthConfig,
  folio?: string
): Quotation {
  const items = inputs.map(item => calculateItem(item, prices, rollConfig));

  const totalAreaM2 = items.reduce((sum, item) => sum + item.totalAreaM2, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const iva = requiresInvoice ? subtotal * 0.16 : 0;
  const total = subtotal + iva;

  return {
    folio: folio || generateFolio(),
    date: new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    clientName: clientName.trim() || 'Cliente General',
    clientPhone: clientPhone.trim(),
    clientEmail: clientEmail.trim(),
    productLine,
    clientType,
    requiresInvoice,
    items,
    totalAreaM2,
    subtotal,
    iva,
    total
  };
}
