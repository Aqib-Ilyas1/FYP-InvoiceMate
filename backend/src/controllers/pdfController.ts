import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

export const generateInvoicePDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const invoiceId = parseInt(req.params.id as string);

    // Fetch invoice with all details
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        client: true,
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
        user: {
          select: {
            fullName: true,
            companyName: true,
            email: true,
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: invoice.currency,
      }).format(amount);
    };

    // Helper function to format date
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(date));
    };

    // Colors
    const primaryColor = '#2563eb';
    const grayColor = '#6b7280';
    const darkColor = '#111827';

    // Header
    doc
      .fontSize(28)
      .fillColor(primaryColor)
      .text('INVOICE', 50, 50);

    // Company Info (right side)
    const companyName = invoice.user.companyName || invoice.user.fullName || 'Your Company';
    doc
      .fontSize(12)
      .fillColor(darkColor)
      .text(companyName, 350, 50, { align: 'right', width: 200 });

    if (invoice.user.email) {
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text(invoice.user.email, 350, 68, { align: 'right', width: 200 });
    }

    // Invoice details box
    doc
      .fontSize(10)
      .fillColor(grayColor)
      .text('Invoice Number:', 50, 120)
      .fillColor(darkColor)
      .text(invoice.invoiceNumber, 150, 120);

    doc
      .fillColor(grayColor)
      .text('Invoice Date:', 50, 138)
      .fillColor(darkColor)
      .text(formatDate(invoice.invoiceDate), 150, 138);

    if (invoice.dueDate) {
      doc
        .fillColor(grayColor)
        .text('Due Date:', 50, 156)
        .fillColor(darkColor)
        .text(formatDate(invoice.dueDate), 150, 156);
    }

    // Status badge
    const statusY = 120;
    const statusColors: any = {
      draft: '#fbbf24',
      sent: '#3b82f6',
      paid: '#10b981',
      overdue: '#ef4444',
      cancelled: '#6b7280',
    };

    doc
      .roundedRect(400, statusY, 100, 25, 3)
      .fillAndStroke(statusColors[invoice.status] || '#6b7280', statusColors[invoice.status] || '#6b7280');

    doc
      .fontSize(10)
      .fillColor('#ffffff')
      .text(invoice.status.toUpperCase(), 400, statusY + 7, { width: 100, align: 'center' });

    // Bill To section
    doc
      .fontSize(12)
      .fillColor(grayColor)
      .text('BILL TO:', 50, 200);

    let billToY = 220;
    if (invoice.client) {
      doc
        .fontSize(11)
        .fillColor(darkColor)
        .text(invoice.client.clientName, 50, billToY);

      billToY += 18;

      if (invoice.client.clientEmail) {
        doc.fontSize(10).fillColor(grayColor).text(invoice.client.clientEmail, 50, billToY);
        billToY += 15;
      }

      if (invoice.client.clientAddress) {
        doc.text(invoice.client.clientAddress, 50, billToY);
        billToY += 15;
      }

      if (invoice.client.clientPhone) {
        doc.text(invoice.client.clientPhone, 50, billToY);
        billToY += 15;
      }
    } else {
      doc.fontSize(10).fillColor(grayColor).text('No client assigned', 50, billToY);
      billToY += 20;
    }

    // Line items table
    const tableTop = billToY + 30;
    doc.fontSize(10).fillColor(darkColor);

    // Table header
    doc
      .rect(50, tableTop, 495, 30)
      .fillAndStroke('#f3f4f6', '#e5e7eb');

    doc
      .fillColor(darkColor)
      .fontSize(10)
      .text('Description', 60, tableTop + 10, { width: 200 })
      .text('Qty', 280, tableTop + 10, { width: 40, align: 'right' })
      .text('Price', 330, tableTop + 10, { width: 60, align: 'right' })
      .text('Tax', 400, tableTop + 10, { width: 40, align: 'right' })
      .text('Total', 460, tableTop + 10, { width: 75, align: 'right' });

    // Table rows
    let currentY = tableTop + 40;

    invoice.lineItems.forEach((item, index) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      doc.rect(50, currentY - 5, 495, 30).fillAndStroke(bgColor, bgColor);

      doc
        .fillColor(darkColor)
        .fontSize(9)
        .text(item.description, 60, currentY, { width: 200 })
        .text(item.quantity.toString(), 280, currentY, { width: 40, align: 'right' })
        .text(formatCurrency(Number(item.unitPrice)), 330, currentY, { width: 60, align: 'right' })
        .text(`${item.taxRate}%`, 400, currentY, { width: 40, align: 'right' })
        .text(formatCurrency(Number(item.lineTotal || 0)), 460, currentY, { width: 75, align: 'right' });

      currentY += 30;
    });

    // Totals section
    currentY += 20;

    // Subtotal
    doc
      .fontSize(10)
      .fillColor(grayColor)
      .text('Subtotal:', 380, currentY, { width: 80, align: 'right' })
      .fillColor(darkColor)
      .text(formatCurrency(Number(invoice.subtotal)), 460, currentY, { width: 75, align: 'right' });

    currentY += 20;

    // Tax
    doc
      .fillColor(grayColor)
      .text('Tax:', 380, currentY, { width: 80, align: 'right' })
      .fillColor(darkColor)
      .text(formatCurrency(Number(invoice.totalTax)), 460, currentY, { width: 75, align: 'right' });

    currentY += 25;

    // Total (larger and bold)
    doc
      .fontSize(14)
      .fillColor(darkColor)
      .text('TOTAL:', 380, currentY, { width: 80, align: 'right' })
      .text(formatCurrency(Number(invoice.total)), 460, currentY, { width: 75, align: 'right' });

    // Payment terms
    if (invoice.paymentTerms) {
      currentY += 40;
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text('Payment Terms:', 50, currentY)
        .fillColor(darkColor)
        .text(invoice.paymentTerms, 50, currentY + 15);
    }

    // Notes
    if (invoice.notes) {
      currentY += (invoice.paymentTerms ? 45 : 40);
      doc
        .fontSize(10)
        .fillColor(grayColor)
        .text('Notes:', 50, currentY)
        .fillColor(darkColor)
        .text(invoice.notes, 50, currentY + 15, { width: 495 });
    }

    // Footer
    doc
      .fontSize(8)
      .fillColor(grayColor)
      .text(
        'Thank you for your business!',
        50,
        750,
        { align: 'center', width: 495 }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    if (error instanceof Error) {
      console.error('PDF Error:', error.message);
      return res.status(500).json({
        error: 'Failed to generate PDF',
        details: error.message
      });
    }
    next(error);
  }
};
