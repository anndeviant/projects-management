import jsPDF from 'jspdf';
import { Invoice } from '@/lib/types/invoice';
import { Project } from '@/lib/types/project';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from './format';

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

        // Helper function to add text with word wrap
        const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line: string, index: number) => {
                doc.text(line, x, y + (index * lineHeight));
            });
            return y + (lines.length * lineHeight);
        };

        // Header with company info
        doc.setFontSize(24);
        doc.setTextColor(primaryColor);
        doc.text('INVOICE', margin, 30);

        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(project?.name || 'Project Name', margin, 40);

        if (project?.customer_name) {
            doc.text(`Customer: ${project.customer_name}`, margin, 46);
        }

        // Invoice details (right side)
        const rightX = pageWidth - margin - 60;
        doc.setFontSize(10);
        doc.text(`Invoice #: ${invoiceNumber}`, rightX, 30);

        const formattedInvoiceDate = format(new Date(invoiceDate), 'dd MMMM yyyy', { locale: id });
        doc.text(`Tanggal: ${formattedInvoiceDate}`, rightX, 36);

        // Line separator
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 60, pageWidth - margin, 60);

        // Bill To section
        let currentY = 75;
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text('Bill To:', margin, currentY);

        currentY += 8;
        doc.setFontSize(10);
        doc.setTextColor(textColor);

        if (project?.customer_name) {
            doc.text(project.customer_name, margin, currentY);
            currentY += 6;
        }

        if (project?.customer_desc) {
            currentY = addWrappedText(project.customer_desc, margin, currentY, 80, 5);
            currentY += 5;
        }

        // Project details section
        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text('Project Details:', margin, currentY);

        currentY += 8;
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(`Project: ${project?.name || 'N/A'}`, margin, currentY);
        currentY += 6;

        if (project?.description) {
            currentY = addWrappedText(`Description: ${project.description}`, margin, currentY, pageWidth - 2 * margin, 5);
            currentY += 5;
        }

        // Invoice items table
        currentY += 15;

        // Table header
        const tableStartY = currentY;
        const tableWidth = pageWidth - 2 * margin;
        const colWidths = [80, 25, 25, 30]; // Description, Price, Qty, Amount

        doc.setFillColor(240, 240, 240);
        doc.rect(margin, currentY, tableWidth, 10, 'F');

        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text('Description', margin + 2, currentY + 6);
        doc.text('Price', margin + colWidths[0] + 2, currentY + 6);
        doc.text('Qty', margin + colWidths[0] + colWidths[1] + 2, currentY + 6);
        doc.text('Amount', margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, currentY + 6);

        currentY += 10;

        // Table rows (all invoice items)
        let totalAmount = 0;
        const rowHeight = 12;

        invoiceItems.forEach((item, index) => {
            // Alternate row colors
            doc.setFillColor(index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 250);
            doc.rect(margin, currentY, tableWidth, rowHeight, 'F');

            // Row content
            doc.setFontSize(9);
            doc.setTextColor(textColor);

            // Description (with word wrap if needed)
            const maxDescWidth = colWidths[0] - 4;
            const descLines = doc.splitTextToSize(item.description, maxDescWidth);
            doc.text(descLines[0], margin + 2, currentY + 7);
            if (descLines.length > 1) {
                doc.text('...', margin + 2, currentY + 11);
            }

            // Price
            doc.text(formatCurrency(item.price), margin + colWidths[0] + 2, currentY + 7);

            // Quantity
            doc.text(item.quantity.toString(), margin + colWidths[0] + colWidths[1] + 2, currentY + 7);

            // Amount
            doc.text(formatCurrency(item.total_amount), margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, currentY + 7);

            totalAmount += item.total_amount;
            currentY += rowHeight;
        });

        // Draw table borders
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);

        // Outer border
        const tableHeight = 10 + (invoiceItems.length * rowHeight);
        doc.rect(margin, tableStartY, tableWidth, tableHeight);

        // Vertical lines
        doc.line(margin + colWidths[0], tableStartY, margin + colWidths[0], tableStartY + tableHeight);
        doc.line(margin + colWidths[0] + colWidths[1], tableStartY, margin + colWidths[0] + colWidths[1], tableStartY + tableHeight);
        doc.line(margin + colWidths[0] + colWidths[1] + colWidths[2], tableStartY, margin + colWidths[0] + colWidths[1] + colWidths[2], tableStartY + tableHeight);

        // Header separator line
        doc.line(margin, tableStartY + 10, pageWidth - margin, tableStartY + 10);

        // Row separator lines
        for (let i = 1; i <= invoiceItems.length; i++) {
            const y = tableStartY + 10 + (i * rowHeight);
            doc.line(margin, y, pageWidth - margin, y);
        }

        currentY += 10;

        // Total section
        const totalSectionX = pageWidth - margin - 60;
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.text('Total:', totalSectionX, currentY);
        doc.text(formatCurrency(totalAmount), totalSectionX + 20, currentY);

        // Add border around total
        doc.setLineWidth(0.5);
        doc.setDrawColor(primaryColor);
        doc.rect(totalSectionX - 5, currentY - 8, 65, 12);

        // Footer
        const footerY = pageHeight - 30;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, margin, footerY);
        doc.text('Project Management System', pageWidth - margin - 40, footerY);

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
