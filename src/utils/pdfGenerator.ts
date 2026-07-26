import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quotation } from '../types';
import { formatCurrency, PRODUCT_LINE_LABELS, CLIENT_TYPE_LABELS } from './pricing';

/**
 * Creates an SVG base64 image or canvas image for the logo to embed in PDF
 */
async function getLogoBase64(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 600;
      canvas.height = img.height || 180;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
    };
    img.onerror = () => {
      resolve('');
    };
    img.src = '/logo.svg';
  });
}

/**
 * Generates and triggers download of Quotation PDF
 */
export async function generateQuotationPDF(quotation: Quotation): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const logoDataUrl = await getLogoBase64();

  // Color Palette CMYK / Brand
  const cyanColor: [number, number, number] = [0, 174, 239]; // #00AEEF
  const magentaColor: [number, number, number] = [236, 0, 140]; // #EC008C
  const darkColor: [number, number, number] = [17, 24, 39]; // #111827
  const grayColor: [number, number, number] = [107, 114, 128]; // #6B7280

  // Top CMYK Accent Strip
  doc.setFillColor(...cyanColor);
  doc.rect(0, 0, 70, 3, 'F');
  doc.setFillColor(...magentaColor);
  doc.rect(70, 0, 70, 3, 'F');
  doc.setFillColor(255, 242, 0); // Yellow
  doc.rect(140, 0, 70, 3, 'F');

  let currentY = 12;

  // 1. Company Logo & Header Text
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 14, currentY, 52, 16);
    } catch {
      // Fallback text if logo fails
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...darkColor);
      doc.text('GRUPO + DIGITAL', 14, currentY + 10);
    }
  } else {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    doc.text('GRUPO + DIGITAL', 14, currentY + 10);
  }

  // Header Details (Right side or next to logo)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text('Grupo Más Digital — Centro de Impresión Alta Definición', 72, currentY + 4);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text('Matriz Puebla: Ave. Ignacio Zaragoza 2-1, Puebla, Pue. C.P. 72520', 72, currentY + 9);
  doc.text('WhatsApp: +52 1 221 261 5111  |  www.grupomasdigital.com', 72, currentY + 13.5);
  doc.text('ventas@grupomasdigital.com', 72, currentY + 18);

  currentY += 24;

  // Divider Line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(14, currentY, 196, currentY);

  currentY += 6;

  // 2. Quotation Title & Folio Badge
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...darkColor);
  doc.text('COTIZACIÓN DE IMPRESIÓN', 14, currentY);

  // Folio box
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(140, currentY - 5, 56, 12, 2, 2, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...magentaColor);
  doc.text(`Folio: ${quotation.folio}`, 144, currentY + 2);

  currentY += 10;

  // 3. Client & Order Info Box
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, currentY, 182, 28, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);

  doc.text('Cliente:', 18, currentY + 6);
  doc.setFont('Helvetica', 'normal');
  doc.text(quotation.clientName, 36, currentY + 6);

  if (quotation.clientPhone) {
    doc.setFont('Helvetica', 'bold');
    doc.text('WhatsApp:', 110, currentY + 6);
    doc.setFont('Helvetica', 'normal');
    doc.text(quotation.clientPhone, 132, currentY + 6);
  }

  doc.setFont('Helvetica', 'bold');
  doc.text('Línea:', 18, currentY + 13);
  doc.setFont('Helvetica', 'normal');
  doc.text(PRODUCT_LINE_LABELS[quotation.productLine], 36, currentY + 13);

  doc.setFont('Helvetica', 'bold');
  doc.text('Tipo Cliente:', 110, currentY + 13);
  doc.setFont('Helvetica', 'normal');
  doc.text(CLIENT_TYPE_LABELS[quotation.clientType], 132, currentY + 13);

  doc.setFont('Helvetica', 'bold');
  doc.text('Fecha:', 18, currentY + 20);
  doc.setFont('Helvetica', 'normal');
  doc.text(quotation.date, 36, currentY + 20);

  doc.setFont('Helvetica', 'bold');
  doc.text('Facturación:', 110, currentY + 20);
  doc.setFont('Helvetica', 'normal');
  doc.text(quotation.requiresInvoice ? 'Requiere Factura (+16% IVA)' : 'Precio Final (Sin factura)', 132, currentY + 20);

  currentY += 34;

  // 4. Items Table
  const tableData = quotation.items.map((item, idx) => {
    const medOrig = `${item.side1Orig}${item.unitOrig} x ${item.side2Orig}${item.unitOrig}`;
    const rolloUsado = `${item.selectedRollWidthCm} cm`;
    const largoFact = `${item.billableLengthCm.toFixed(1)} cm (${(item.billableLengthCm / 2.54).toFixed(1)}")`;
    const areaM2 = `${item.totalAreaM2.toFixed(3)} m²`;
    const precioM2 = formatCurrency(item.appliedPricePerM2);
    const subtotal = formatCurrency(item.subtotal);

    return [
      `#${idx + 1} - ${item.description}`,
      item.quantity.toString(),
      medOrig,
      rolloUsado,
      largoFact,
      areaM2,
      precioM2,
      subtotal
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Descripción / Imagen', 'Cant.', 'Medida', 'Ancho Rollo', 'Largo Fact.', 'Área m²', 'Precio m²', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: cyanColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor
    },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { halign: 'center', cellWidth: 12 },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'center', cellWidth: 22 },
      4: { halign: 'center', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 20 },
      6: { halign: 'right', cellWidth: 20 },
      7: { halign: 'right', cellWidth: 20 }
    },
    margin: { left: 14, right: 14 },
  });

  // Get table bottom Y position
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  currentY = finalY;

  // 5. Totals Box (Right aligned)
  const totalBoxX = 120;
  const totalBoxWidth = 76;

  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(totalBoxX, currentY, totalBoxWidth, quotation.requiresInvoice ? 28 : 22, 2, 2, 'FD');

  let boxTextY = currentY + 6;

  // Total Area m²
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...grayColor);
  doc.text('Área Total Facturable:', totalBoxX + 4, boxTextY);
  doc.text(`${quotation.totalAreaM2.toFixed(3)} m²`, totalBoxX + totalBoxWidth - 4, boxTextY, { align: 'right' });
  boxTextY += 5;

  // Subtotal
  doc.text('Subtotal:', totalBoxX + 4, boxTextY);
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(quotation.subtotal), totalBoxX + totalBoxWidth - 4, boxTextY, { align: 'right' });
  boxTextY += 5;

  if (quotation.requiresInvoice) {
    doc.setTextColor(...grayColor);
    doc.text('IVA (16%):', totalBoxX + 4, boxTextY);
    doc.setTextColor(...darkColor);
    doc.text(formatCurrency(quotation.iva), totalBoxX + totalBoxWidth - 4, boxTextY, { align: 'right' });
    boxTextY += 6;
  }

  // Line before Total
  doc.setDrawColor(209, 213, 219);
  doc.line(totalBoxX + 4, boxTextY - 2, totalBoxX + totalBoxWidth - 4, boxTextY - 2);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...magentaColor);
  doc.text('TOTAL:', totalBoxX + 4, boxTextY + 2);
  doc.text(formatCurrency(quotation.total), totalBoxX + totalBoxWidth - 4, boxTextY + 2, { align: 'right' });

  // 6. Notes & Terms (Left side)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text('Términos y Condiciones:', 14, currentY + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('• Cotización válida por 15 días naturales a partir de la fecha de expedición.', 14, currentY + 11);
  doc.text('• Mínimo facturable por pieza: 10 pulgadas (25.4 cm) de largo.', 14, currentY + 15);
  doc.text('• Impresión de alta definición realizada en Plotter Epson Fine Art.', 14, currentY + 19);
  doc.text('• Precios expresados en Moneda Nacional (MXN).', 14, currentY + 23);

  // Footer text
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...cyanColor);
  doc.text('¡Gracias por su preferencia! Grupo Más Digital — Calidad Fotográfica Profesional.', 105, 285, { align: 'center' });

  // Save the PDF file
  doc.save(`Cotizacion_${quotation.folio}_${quotation.clientName.replace(/\s+/g, '_')}.pdf`);
}
