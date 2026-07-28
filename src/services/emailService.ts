import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../config/logger';
import PDFDocument from 'pdfkit';
import {
  renderEmailTemplate,
  orderConfirmationTemplate,
  welcomeEmailTemplate,
  passwordResetTemplate,
  emailVerificationTemplate,
  paymentConfirmationTemplate,
  lowStockAlertTemplate,
  orderShippedTemplate,
} from '../utils/email-templates';

let transporter: nodemailer.Transporter | null = null;
let emailConfigured = false;

function isEmailConfigured(): boolean {
  return emailConfigured;
}

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    // Production: Require SMTP configuration
    if (config.smtp.user && config.smtp.pass) {
      try {
        transporter = nodemailer.createTransport({
          host: config.smtp.host,
          port: config.smtp.port,
          secure: config.smtp.port === 465, // true for 465, false for other ports
          auth: { 
            user: config.smtp.user, 
            pass: config.smtp.pass 
          },
          // Connection timeout
          connectionTimeout: 10000,
          // Socket timeout
          socketTimeout: 10000,
        });
        emailConfigured = true;
        logger.info({ host: config.smtp.host, port: config.smtp.port }, 'Email service configured');
      } catch (error) {
        logger.error({ error }, 'Failed to configure email service');
        emailConfigured = false;
      }
    } else {
      // Development: Use local mail server (Mailhog, MailCatcher, etc.)
      if (config.isProd) {
        logger.error('SMTP not configured in production — emails will not be sent');
        emailConfigured = false;
      } else {
        try {
          transporter = nodemailer.createTransport({
            host: config.smtp.host || 'localhost',
            port: config.smtp.port || 1025,
            ignoreTLS: true,
          });
          emailConfigured = true;
          logger.warn('Using local mail server for development (configure SMTP for production)');
        } catch (error) {
          logger.error({ error }, 'Failed to configure local mail server');
          emailConfigured = false;
        }
      }
    }
  }
  return transporter!;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export async function sendOrderConfirmation(data: { 
  email: string; 
  orderNumber: string; 
  firstName: string;
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  subtotal: number;
  taxAmount: number;
  shippingCharge: number;
  total: number;
}) {
  const subject = `Order #${data.orderNumber} Confirmed`;
  const content = orderConfirmationTemplate({
    firstName: data.firstName,
    orderNumber: data.orderNumber,
    items: data.items,
    subtotal: data.subtotal,
    tax: data.taxAmount,
    shipping: data.shippingCharge,
    total: data.total,
  });
  const html = await renderEmailTemplate(content, { email: data.email });
  await sendEmail({ to: data.email, subject, html });
  logger.info({ orderNumber: data.orderNumber, email: data.email }, 'Order confirmation email sent');
}

export async function sendWelcomeEmail(data: { email: string; firstName: string }) {
  const subject = 'Welcome to CommerceFlow!';
  const content = welcomeEmailTemplate({ firstName: data.firstName });
  const html = await renderEmailTemplate(content, { email: data.email });
  await sendEmail({ to: data.email, subject, html });
  logger.info({ email: data.email }, 'Welcome email sent');
}

export async function sendPasswordReset(data: { email: string; token: string; firstName: string }) {
  const subject = 'Reset Your Password';
  const content = passwordResetTemplate({ firstName: data.firstName, token: data.token });
  const html = await renderEmailTemplate(content, { email: data.email });
  await sendEmail({ to: data.email, subject, html });
  logger.info({ email: data.email }, 'Password reset email sent');
}

export async function sendEmailVerification(data: { email: string; token: string; firstName: string }) {
  const subject = 'Verify Your Email';
  const content = emailVerificationTemplate({ firstName: data.firstName, token: data.token });
  const html = await renderEmailTemplate(content, { email: data.email });
  await sendEmail({ to: data.email, subject, html });
  logger.info({ email: data.email }, 'Verification email sent');
}

export async function sendPaymentConfirmation(data: {
  email: string;
  firstName: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
}) {
  const subject = `Payment Received - Order #${data.orderNumber}`;
  const content = paymentConfirmationTemplate({
    firstName: data.firstName,
    orderNumber: data.orderNumber,
    amount: data.amount,
    paymentMethod: data.paymentMethod,
  });
  const html = await renderEmailTemplate(content, { email: data.email });
  await sendEmail({ to: data.email, subject, html });
  logger.info({ orderNumber: data.orderNumber, email: data.email }, 'Payment confirmation email sent');
}

export async function sendOrderShipped(data: {
  email: string;
  firstName: string;
  orderNumber: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}) {
  const subject = `Your Order #${data.orderNumber} Has Shipped!`;
  const content = orderShippedTemplate({
    firstName: data.firstName,
    orderNumber: data.orderNumber,
    trackingNumber: data.trackingNumber,
    carrier: data.carrier,
    estimatedDelivery: data.estimatedDelivery,
  });
  const html = await renderEmailTemplate(content, { email: data.email });
  await sendEmail({ to: data.email, subject, html });
  logger.info({ orderNumber: data.orderNumber, email: data.email }, 'Order shipped email sent');
}

export async function sendLowStockNotification(data: { 
  productName: string; 
  sku: string; 
  stock: number;
  threshold: number;
}) {
  const subject = `Low Stock Alert: ${data.productName}`;
  const content = lowStockAlertTemplate({
    productName: data.productName,
    sku: data.sku,
    stock: data.stock,
    threshold: data.threshold,
  });
  const html = await renderEmailTemplate(content);
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

async function sendEmail({ to, subject, html, attachments }: { 
  to: string; 
  subject: string; 
  html: string; 
  attachments?: Array<{ filename: string; content: Buffer | string }> 
}) {
  // Check if email is configured
  if (!isEmailConfigured()) {
    logger.warn({ to, subject }, 'Email service not configured, skipping email');
    return;
  }

  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
      attachments,
    });
    
    logger.info({ 
      messageId: info.messageId, 
      to, 
      subject,
      accepted: info.accepted,
      rejected: info.rejected 
    }, 'Email sent successfully');
    
    return info;
  } catch (error) {
    logger.error({ error, to, subject }, 'Failed to send email');
    // Don't throw in production to prevent email failures from breaking the app
    if (!config.isProd) {
      throw error;
    }
  }
}

// Export verification function
export { getTransporter, isEmailConfigured };
