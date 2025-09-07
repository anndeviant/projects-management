import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/lib/types/invoice';
import { Project } from '@/lib/types/project';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from './format';

// Helper function to load image as base64
const loadImageAsBase64 = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            try {
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataURL);
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
};

export const generateInvoicePDF = async (
    invoiceItems: Invoice[],
    project: Project | null,
    invoiceNumber: string,
    invoiceDate: string,
    isPreview: boolean = false
) => {
    try {
        // Validate required parameters
        if (!invoiceItems || invoiceItems.length === 0) {
            throw new Error('Invoice items are required');
        }

        if (!invoiceNumber.trim()) {
            throw new Error('Invoice number is required');
        }

        if (!invoiceDate) {
            throw new Error('Invoice date is required');
        }

        // Create new PDF document in A4 format
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;

        // Colors
        const primaryColor = '#10b981'; // emerald-600
        const textColor = '#1f2937'; // gray-800
        const grayColor = '#6b7280'; // gray-500

        let currentY = 30;

        // === HEADER SECTION USING TABLE ===
        // Create header table with logo, company info, and INVOICE
        let logoBase64 = '';
        try {
            logoBase64 = await loadImageAsBase64('/images/logo-rs.jpg');
        } catch (error) {
            console.warn('Logo could not be loaded:', error);
        }

        // Prepare header table data
        const headerTableData = [
            [
                logoBase64 ? 'LOGO' : '', // Placeholder for logo
                'RS TechForge\nTechnology Services',
                'INVOICE'
            ]
        ];

        // Generate header table without borders
        autoTable(doc, {
            body: headerTableData,
            startY: currentY - 5,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 1, // Will be overridden per cell
                textColor: [255, 255, 255], // White text (invisible)
                lineColor: [255, 255, 255], // White lines (invisible)
                lineWidth: 0,
                cellPadding: 0,
            },
            columnStyles: {
                0: { cellWidth: 20, halign: 'left' }, // Logo column
                1: { cellWidth: 80, halign: 'left' }, // Company info column
                2: { cellWidth: 70, halign: 'center' } // Invoice column
            },
            tableLineColor: [255, 255, 255], // White table lines (invisible)
            tableLineWidth: 0,
            theme: 'plain',
            didDrawCell: function (data) {
                if (data.column.index === 0 && logoBase64) {
                    // Add logo in first column
                    const logoSize = 15;
                    doc.addImage(logoBase64, 'JPEG', data.cell.x + 2, data.cell.y + 2, logoSize, logoSize);
                } else if (data.column.index === 1) {
                    // Add company info in second column
                    doc.setFontSize(18);
                    doc.setTextColor(textColor);
                    doc.setFont('helvetica', 'bold');
                    doc.text('RS TechForge', data.cell.x + 2, data.cell.y + 8);

                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(grayColor);
                    doc.text('Technology Services', data.cell.x + 2, data.cell.y + 16);
                } else if (data.column.index === 2) {
                    // Add INVOICE header in third column
                    doc.setFontSize(48);
                    doc.setTextColor(primaryColor);
                    doc.setFont('helvetica', 'bold');
                    const invoiceText = 'INVOICE';
                    const textWidth = doc.getTextWidth(invoiceText);
                    const centerX = data.cell.x + (data.cell.width - textWidth) / 2;
                    doc.text(invoiceText, centerX, data.cell.y + 16);
                }
            }
        });

        // Update currentY after header table
        currentY += 10;

        // Invoice details on the right side - positioned with proper margin from edge
        const rightSectionX = pageWidth - margin - 80; // More margin from right edge
        let rightCurrentY = currentY + 20; // Move down from the INVOICE header

        doc.setFontSize(11); // Increased from 10
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');

        doc.text('Invoice #:', rightSectionX, rightCurrentY);
        doc.setFont('helvetica', 'bold');
        doc.text(invoiceNumber, rightSectionX + 30, rightCurrentY);

        rightCurrentY += 8; // Increased spacing
        doc.setFont('helvetica', 'normal');
        doc.text('Date:', rightSectionX, rightCurrentY);
        doc.setFont('helvetica', 'bold');
        const formattedInvoiceDate = format(new Date(invoiceDate), 'dd MMMM yyyy', { locale: id });
        doc.text(formattedInvoiceDate, rightSectionX + 30, rightCurrentY);

        rightCurrentY += 8; // Increased spacing
        doc.setFont('helvetica', 'normal');
        doc.text('Customer:', rightSectionX, rightCurrentY);
        doc.setFont('helvetica', 'bold');
        doc.text(project?.customer_name || 'N/A', rightSectionX + 30, rightCurrentY);

        // Add project title before separator line
        currentY = Math.max(rightCurrentY + 10, 80);
        doc.setFontSize(14); // Increased from 12
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Proyek:', margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        doc.text(project?.name || 'N/A', margin + 22, currentY); // Reduced from 30 to 22

        // Separator line
        currentY += 10;
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);

        // === MAIN TABLE SECTION ===
        currentY += 10;

        // Calculate totals
        let subtotal = 0;
        invoiceItems.forEach(item => {
            subtotal += item.total_amount;
        });

        const tax = subtotal * 0.11; // 11% tax
        const total = subtotal + tax;

        // Prepare table data
        const tableData = invoiceItems.map(item => [
            item.description,
            formatCurrency(item.price),
            item.quantity.toString(),
            formatCurrency(item.total_amount)
        ]);

        // Generate table using jspdf-autotable
        autoTable(doc, {
            head: [['Description', 'Price', 'Qty.', 'Amount']],
            body: tableData,
            startY: currentY,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 11, // Increased from 10
                textColor: textColor,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: textColor,
                fontStyle: 'bold',
                halign: 'left', // All headers aligned left
                fontSize: 12, // Slightly larger for headers
            },
            columnStyles: {
                0: { cellWidth: 90, halign: 'left' }, // Description - wider and left aligned
                1: { cellWidth: 30, halign: 'left' }, // Price - left aligned
                2: { cellWidth: 20, halign: 'left' }, // Qty - left aligned
                3: { cellWidth: 30, halign: 'left' } // Amount - left aligned
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            tableLineColor: [200, 200, 200],
            tableLineWidth: 0.1,
            tableWidth: 'wrap', // Remove extra space
        });

        // Estimate Y position after the table (header + items + spacing)
        currentY = currentY + 15 + (invoiceItems.length * 10); // Reduced spacing after table

        // Separator line after table
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);

        currentY += 15; // Reduced from 18 to 15 for more balanced spacing

        // === FOOTER SECTION ===
        // Left side - Contact info
        doc.setFontSize(14); // Increased from 12
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Contact Info:', margin, currentY);

        currentY += 8;
        doc.setFontSize(11); // Increased from 10
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        doc.text('Rahul Subagio', margin, currentY);

        currentY += 7;
        doc.text('rahulsubagio99@gmail.com', margin, currentY);

        currentY += 7;
        doc.text('+6282296365028', margin, currentY);

        // Right side - Totals aligned with invoice details section
        const totalsX = rightSectionX; // Use same X position as invoice details for consistency
        let totalsY = currentY - 24; // Start from same level as Info section

        doc.setFontSize(11); // Increased from 10
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');

        // Calculate right alignment position for currency values
        const currencyAlignX = pageWidth - margin - 10; // Right align the currency values

        // Subtotal
        doc.text('Subtotal', totalsX, totalsY);
        doc.text(':', totalsX + 35, totalsY);
        doc.setFont('helvetica', 'bold');
        const subtotalText = formatCurrency(subtotal);
        const subtotalWidth = doc.getTextWidth(subtotalText);
        doc.text(subtotalText, currencyAlignX - subtotalWidth, totalsY);

        totalsY += 8; // Increased spacing
        doc.setFont('helvetica', 'normal');
        doc.text('Tax (11%)', totalsX, totalsY);
        doc.text(':', totalsX + 35, totalsY);
        doc.setFont('helvetica', 'bold');
        const taxText = formatCurrency(tax);
        const taxWidth = doc.getTextWidth(taxText);
        doc.text(taxText, currencyAlignX - taxWidth, totalsY);

        totalsY += 8; // Increased spacing
        // Total (without background highlight)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.setFontSize(12); // Slightly larger for total
        doc.text('Total', totalsX, totalsY);
        doc.text(':', totalsX + 35, totalsY);
        const totalText = formatCurrency(total);
        const totalWidth = doc.getTextWidth(totalText);
        doc.text(totalText, currencyAlignX - totalWidth, totalsY);

        // Thank you message at the bottom
        const thankYouY = pageHeight - 30;
        doc.setFontSize(14); // Increased from 12
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        const thankYouText = 'Terima kasih atas kepercayaan Anda!';
        const thankYouWidth = doc.getTextWidth(thankYouText);
        doc.text(thankYouText, (pageWidth - thankYouWidth) / 2, thankYouY);

        // doc.setFontSize(11); // Increased from 10
        // doc.setTextColor(grayColor);
        // doc.setFont('helvetica', 'normal');
        // const appreciationText = 'Kami sangat menghargai kerjasama yang baik ini.';
        // const appreciationWidth = doc.getTextWidth(appreciationText);
        // doc.text(appreciationText, (pageWidth - appreciationWidth) / 2, thankYouY + 7);

        // Footer with generation info
        const footerY = pageHeight - 15;
        doc.setFontSize(9); // Increased from 8
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, margin, footerY);
        doc.text('RS TechForge Technology Services', pageWidth - margin - 45, footerY);

        // Generate filename
        const filename = `invoice-${invoiceNumber}-${format(new Date(), 'yyyyMMdd')}.pdf`;

        if (isPreview) {
            // Open in new window for preview
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
        } else {
            // Download the PDF
            doc.save(filename);
        }

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};
