import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface BookingDetails {
  bookingId: string;
  bookingType: 'match' | 'practice';
  sport: string;
  date: string;
  slot: string;
  name: string;
  mobile: string;
  email: string;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  couponCode?: string;
  couponDiscount?: number;
  bookingCharge: number;
  totalPrice: number;
  advancePayment: number;
  remainingPayment: number;
  createdAt: Date;
}

export async function generateBookingPDF(
  bookingDetails: BookingDetails
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  
  // Colors
  const green = rgb(0.09, 0.64, 0.29);
  const darkGreen = rgb(0.02, 0.37, 0.17);
  const orange = rgb(0.92, 0.35, 0.05);
  const gray = rgb(0.42, 0.45, 0.49);
  const darkGray = rgb(0.12, 0.16, 0.21);
  const lightGreen = rgb(0.82, 0.98, 0.87);
  const lightOrange = rgb(0.99, 0.84, 0.67);
  
  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: green,
  });
  
  // Add logo (after background so it's visible) - circular style
  let logoLoaded = false;
  const circleCenterX = 75;
  const circleCenterY = height - 60;
  const circleRadius = 40;
  
  try {
    const logoPath = path.join(process.cwd(), 'public', 'cwpa.jpg');
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedJpg(logoBytes);
      
      // Draw white circular background
      page.drawCircle({
        x: circleCenterX,
        y: circleCenterY,
        size: circleRadius,
        color: rgb(1, 1, 1),
      });
      
      // Draw logo image (sized to fit mostly within circle)
      const logoSize = circleRadius * 1.4;
      page.drawImage(logoImage, {
        x: circleCenterX - logoSize / 2,
        y: circleCenterY - logoSize / 2,
        width: logoSize,
        height: logoSize,
      });
      
      // Draw circular border on top to create rounded clipping effect
      // This covers the square corners of the image
      const borderWidth = 8;
      page.drawCircle({
        x: circleCenterX,
        y: circleCenterY,
        size: circleRadius + borderWidth / 2,
        borderColor: rgb(1, 1, 1),
        borderWidth: borderWidth,
      });
      
      // Draw green outer ring for clean circular look
      page.drawCircle({
        x: circleCenterX,
        y: circleCenterY,
        size: circleRadius + borderWidth,
        borderColor: green,
        borderWidth: 3,
      });
      
      logoLoaded = true;
    }
  } catch (error) {
    console.error('Error loading logo:', error);
  }
  
  // Title - position based on whether logo was loaded
  const textStartX = logoLoaded ? 125 : 50;
  
  page.drawText('Cricket Wala Play Arena', {
    x: textStartX,
    y: height - 50,
    size: 26,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  page.drawText('Booking Confirmation Receipt', {
    x: textStartX,
    y: height - 80,
    size: 14,
    font: helvetica,
    color: rgb(0.82, 0.98, 0.87),
  });
  
  // Booking Reference
  let yPos = height - 160;
  
  page.drawText('Booking Reference:', {
    x: 50,
    y: yPos,
    size: 12,
    font: helvetica,
    color: gray,
  });
  
  page.drawText(bookingDetails.bookingId, {
    x: 180,
    y: yPos,
    size: 12,
    font: helveticaBold,
    color: green,
  });
  
  yPos -= 20;
  page.drawText(`Date: ${new Date(bookingDetails.createdAt).toLocaleString('en-IN')}`, {
    x: 50,
    y: yPos,
    size: 10,
    font: helvetica,
    color: gray,
  });
  
  // Booking Details Section
  yPos -= 40;
  page.drawText('Booking Details', {
    x: 50,
    y: yPos,
    size: 16,
    font: helveticaBold,
    color: darkGray,
  });
  
  // Line
  yPos -= 15;
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: 545, y: yPos },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  // Details rows
  const addRow = (label: string, value: string, bold = false) => {
    yPos -= 25;
    page.drawText(label, {
      x: 50,
      y: yPos,
      size: 11,
      font: helvetica,
      color: gray,
    });
    page.drawText(value, {
      x: 300,
      y: yPos,
      size: 11,
      font: bold ? helveticaBold : helvetica,
      color: darkGray,
    });
  };
  
  addRow('Customer Name:', bookingDetails.name, true);
  addRow('Mobile Number:', `+91 ${bookingDetails.mobile}`);
  addRow('Email Address:', bookingDetails.email);
  addRow('Booking Type:', bookingDetails.bookingType === 'match' ? 'Main Turf' : 'Practice Turf', true);
  addRow('Sport:', bookingDetails.sport);
  addRow('Date:', bookingDetails.date);
  
  // Handle time slots with text wrapping
  yPos -= 25;
  page.drawText('Time Slot:', {
    x: 50,
    y: yPos,
    size: 11,
    font: helvetica,
    color: gray,
  });
  
  // Split slots into multiple lines if too long
  const maxWidth = 245; // Width available for slot text
  const slotText = bookingDetails.slot;
  const slots = slotText.split(', ');
  let currentLine = '';
  const lines: string[] = [];
  
  slots.forEach((slot, index) => {
    const testLine = currentLine ? `${currentLine}, ${slot}` : slot;
    const testWidth = helvetica.widthOfTextAtSize(testLine, 11);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = slot;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Draw each line
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: 300,
      y: yPos - (index * 15),
      size: 11,
      font: helvetica,
      color: darkGray,
    });
  });
  
  // Adjust yPos based on number of lines (subtract extra space for additional lines)
  if (lines.length > 1) {
    yPos -= (lines.length - 1) * 15;
  }
  
  // Payment Details Section
  yPos -= 40;
  page.drawText('Payment Details', {
    x: 50,
    y: yPos,
    size: 16,
    font: helveticaBold,
    color: darkGray,
  });
  
  yPos -= 15;
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: 545, y: yPos },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  // Pricing rows
  const addPriceRow = (label: string, value: string) => {
    yPos -= 25;
    page.drawText(label, {
      x: 50,
      y: yPos,
      size: 11,
      font: helvetica,
      color: gray,
    });
    page.drawText(value, {
      x: 300,
      y: yPos,
      size: 11,
      font: helvetica,
      color: darkGray,
    });
  };
  
  addPriceRow('Base Price:', `Rs. ${bookingDetails.basePrice}`);
  
  if (bookingDetails.discountPercentage > 0) {
    const discount = bookingDetails.basePrice - bookingDetails.finalPrice - (bookingDetails.couponDiscount || 0);
    addPriceRow(`Weekly Discount (${bookingDetails.discountPercentage}%):`, `-Rs. ${discount.toFixed(0)}`);
  }
  
  if (bookingDetails.couponCode && bookingDetails.couponDiscount) {
    addPriceRow(`Coupon (${bookingDetails.couponCode}):`, `-Rs. ${bookingDetails.couponDiscount}`);
  }
  
  // Total
  yPos -= 10;
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: 545, y: yPos },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
  
  yPos -= 25;
  page.drawText('Total Amount:', {
    x: 50,
    y: yPos,
    size: 13,
    font: helveticaBold,
    color: darkGray,
  });
  page.drawText(`Rs. ${bookingDetails.totalPrice}`, {
    x: 300,
    y: yPos,
    size: 13,
    font: helveticaBold,
    color: green,
  });
  
  // Paid Online Box (Green)
  yPos -= 40;
  page.drawRectangle({
    x: 50,
    y: yPos - 40,
    width: 495,
    height: 50,
    color: lightGreen,
  });
  
  page.drawText('PAID ONLINE (Advance):', {
    x: 65,
    y: yPos - 20,
    size: 13,
    font: helveticaBold,
    color: darkGreen,
  });
  
  page.drawText(`Rs. ${bookingDetails.advancePayment}`, {
    x: 400,
    y: yPos - 22,
    size: 18,
    font: helveticaBold,
    color: green,
  });
  
  // Remaining Payment Box (Orange) - if applicable
  if (bookingDetails.remainingPayment > 0) {
    yPos -= 60;
    page.drawRectangle({
      x: 50,
      y: yPos - 40,
      width: 495,
      height: 50,
      color: lightOrange,
    });
    
    page.drawText('PAY AT TURF (Remaining):', {
      x: 65,
      y: yPos - 20,
      size: 13,
      font: helveticaBold,
      color: rgb(0.6, 0.17, 0.07),
    });
    
    page.drawText(`Rs. ${bookingDetails.remainingPayment}`, {
      x: 400,
      y: yPos - 22,
      size: 18,
      font: helveticaBold,
      color: orange,
    });
    
    yPos -= 50;
    // Important note - centered and properly positioned
    const importantText = 'Important: Please pay the remaining amount when you visit the turf.';
    const importantTextWidth = helveticaBold.widthOfTextAtSize(importantText, 11);
    const centeredX = (width - importantTextWidth) / 2;
    
    page.drawText(importantText, {
      x: centeredX,
      y: yPos,
      size: 11,
      font: helveticaBold,
      color: rgb(0.8, 0.3, 0.0),
    });
    
    yPos -= 30;
  }
  
  // Footer
  const footerY = 60;
  page.drawLine({
    start: { x: 50, y: footerY + 30 },
    end: { x: 545, y: footerY + 30 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  // Footer text - centered
  const footerTexts = [
    'Cricket Wala Play Arena',
    'Kanti Factory, Patna, Bihar - 800007',
    'Phone: +91-8340296635'
  ];
  
  let footerYPos = footerY + 10;
  footerTexts.forEach((text) => {
    const textWidth = helvetica.widthOfTextAtSize(text, 10);
    const centeredFooterX = (width - textWidth) / 2;
    
    page.drawText(text, {
      x: centeredFooterX,
      y: footerYPos,
      size: 10,
      font: helvetica,
      color: gray,
    });
    
    footerYPos -= 12;
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
