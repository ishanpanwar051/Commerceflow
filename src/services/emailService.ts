import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../config/logger';
import PDFDocument from 'pdfkit';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (config.isProd && config.smtp.user) {
      transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        ignoreTLS: true,
      });
    }
  }
  return transporter;
}

export async function sendOrderConfirmation(data: { email: string; orderNumber: string; total: number; firstName: string }) {
  const subject = `Order #${data.orderNumber} Confirmed`;
  const html = `
    <h1>Thank you for your order, ${data.firstName}!</h1>
    <p>Order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
    <p>Total: <strong>$${data.total.toFixed(2)}</strong></p>
    <p>We'll notify you when your order ships.</p>
  `;
  await sendEmail({ to: data.email, subject, html });
  logger.info({ orderNumber: data.orderNumber, email: data.email }, 'Order confirmation email sent');
}

export async function sendWelcomeEmail(data: { email: string; firstName: string }) {
  const subject = 'Welcome to CommerceFlow!';
  const html = `<h1>Welcome, ${data.firstName}!</h1><p>Your account has been created successfully.</p>`;
  await sendEmail({ to: data.email, subject, html });
  logger.info({ email: data.email }, 'Welcome email sent');
}

export async function sendPasswordReset(data: { email: string; token: string; firstName: string }) {
  const resetUrl = `${config.isProd ? 'https://commerceflow.dev' : 'http://localhost:4000'}/auth/reset-password?token=${data.token}`;
  const subject = 'Reset Your Password';
  const html = `<h1>Hi ${data.firstName}</h1><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`;
  await sendEmail({ to: data.email, subject, html });
  logger.info({ email: data.email }, 'Password reset email sent');
}

export async function sendEmailVerification(data: { email: string; firstName: string }) {
  const subject = 'Verify Your Email';
  const html = `<h1>Hi ${data.firstName}</h1><p>Please verify your email address to complete registration.</p>`;
  await sendEmail({ to: data.email, subject, html });
  logger.info({ email: data.email }, 'Verification email sent');
}

export async function sendLowStockNotification(data: { productName: string; sku: string; stock: number }) {
  const subject = `Low Stock Alert: ${data.productName}`;
  const html = `<h1>Low Stock Alert</h1><p>Product <strong>${data.productName}</strong> (SKU: ${data.sku}) has only ${data.stock} units left.</p>`;
  await sendEmail({ to: 'admin@commerceflow.dev', subject, html });
  logger.info({ productName: data.productName }, 'Low stock notification sent');
}

export async function generateInvoicePdf(data: { orderNumber: string; items: { name: string; price: number; quantity: number; total: number }[]; grandTotal: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(24).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Order #${data.orderNumber}`);
    doc.moveDown();
    doc.fontSize(10);

    const tableTop = doc.y;
    doc.text('Item', 50, tableTop);
    doc.text('Price', 300, tableTop);
    doc.text('Qty', 400, tableTop);
    doc.text('Total', 470, tableTop);
    doc.moveDown();

    let y = doc.y;
    for (const item of data.items) {
      doc.text(item.name, 50, y);
      doc.text(`$${item.price.toFixed(2)}`, 300, y);
      doc.text(String(item.quantity), 400, y);
      doc.text(`$${item.total.toFixed(2)}`, 470, y);
      y += 20;
    }

    doc.moveDown(2);
    doc.fontSize(14).text(`Grand Total: $${data.grandTotal.toFixed(2)}`, { align: 'right' });
    doc.end();
  });
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const transport = getTransporter();
  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });
}
