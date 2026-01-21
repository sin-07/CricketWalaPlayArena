import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
  
  // Title
  page.drawText('Cricket Wala Play Arena', {
    x: 50,
    y: height - 50,
    size: 28,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });
  
  page.drawText('Booking Confirmation Receipt', {
    x: 50,
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
  addRow('Booking Type:', bookingDetails.bookingType.toUpperCase(), true);
  addRow('Sport:', bookingDetails.sport);
  addRow('Date:', bookingDetails.date);
  addRow('Time Slot:', bookingDetails.slot);
  
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
  
  addPriceRow('Booking Charge:', `Rs. ${bookingDetails.bookingCharge}`);
  
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
    
    yPos -= 60;
    page.drawText('Important: Please pay the remaining amount when you visit the turf.', {
      x: 50,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: rgb(0.49, 0.18, 0.07),
    });
  }
  
  // Footer
  const footerY = 80;
  page.drawLine({
    start: { x: 50, y: footerY + 30 },
    end: { x: 545, y: footerY + 30 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  
  page.drawText('Cricket Wala Play Arena', {
    x: 220,
    y: footerY + 10,
    size: 10,
    font: helvetica,
    color: gray,
  });
  
  page.drawText('Kanti Factory, Patna, Bihar - 800007', {
    x: 195,
    y: footerY - 5,
    size: 10,
    font: helvetica,
    color: gray,
  });
  
  page.drawText('Phone: +91-8340296635', {
    x: 230,
    y: footerY - 20,
    size: 10,
    font: helvetica,
    color: gray,
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
