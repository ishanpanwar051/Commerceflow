import { config } from '../config';
import fs from 'fs/promises';
import path from 'path';

interface TemplateVariables {
  [key: string]: string | number | boolean;
}

let baseTemplate: string | null = null;

async function getBaseTemplate(): Promise<string> {
  if (!baseTemplate) {
    try {
      const templatePath = path.join(__dirname, '../templates/email-base.html');
      baseTemplate = await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      // Fallback to inline template if file doesn't exist
      baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        {{content}}
        <div class="footer">
            <p>&copy; {{year}} CommerceFlow. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }
  }
  return baseTemplate;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function replaceVariables(template: string, variables: TemplateVariables): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

export async function renderEmailTemplate(content: string, variables: TemplateVariables = {}): Promise<string> {
  const base = await getBaseTemplate();
  const fullVariables = {
    content,
    frontendUrl: config.frontendUrl,
    year: new Date().getFullYear(),
    ...variables,
  };
  return replaceVariables(base, fullVariables);
}

export function orderConfirmationTemplate(data: {
  firstName: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
        <td>${escapeHtml(item.name)}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">$${(item.price / 100).toFixed(2)}</td>
        <td style="text-align: right;">$${(item.total / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <h1>Thank you for your order, ${escapeHtml(data.firstName)}!</h1>
    <p>Your order <strong>#${escapeHtml(data.orderNumber)}</strong> has been confirmed and is being processed.</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>Order Details</strong></p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHtml}
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                <td style="text-align: right;">$${(data.subtotal / 100).toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Tax:</strong></td>
                <td style="text-align: right;">$${(data.tax / 100).toFixed(2)}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;"><strong>Shipping:</strong></td>
                <td style="text-align: right;">$${(data.shipping / 100).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td style="text-align: right;">$${(data.total / 100).toFixed(2)}</td>
            </tr>
        </tbody>
    </table>
    
    <p>We'll send you another email when your order ships.</p>
    
    <a href="${config.frontendUrl}/orders/${data.orderNumber}" class="button">View Order</a>
    
    <p>If you have any questions, please don't hesitate to contact our support team.</p>
  `;
}

export function welcomeEmailTemplate(data: { firstName: string }): string {
  return `
    <h1>Welcome to CommerceFlow, ${escapeHtml(data.firstName)}! 🎉</h1>
    <p>Your account has been created successfully. We're excited to have you on board!</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>Get Started:</strong></p>
        <ul style="margin: 10px 0;">
            <li>Browse our extensive product catalog</li>
            <li>Add items to your wishlist</li>
            <li>Enjoy fast and secure checkout</li>
            <li>Track your orders in real-time</li>
        </ul>
    </div>
    
    <a href="${config.frontendUrl}/products" class="button">Start Shopping</a>
    
    <p>Thank you for choosing CommerceFlow!</p>
  `;
}

export function passwordResetTemplate(data: { firstName: string; token: string }): string {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${encodeURIComponent(data.token)}`;
  
  return `
    <h1>Password Reset Request</h1>
    <p>Hi ${escapeHtml(data.firstName)},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <a href="${resetUrl}" class="button">Reset Password</a>
    
    <p>This link will expire in <strong>1 hour</strong> for security reasons.</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>⚠️ Security Note:</strong></p>
        <p style="margin: 10px 0 0 0;">If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
    </div>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6B7280; font-size: 12px;">${resetUrl}</p>
  `;
}

export function emailVerificationTemplate(data: { firstName: string; token: string }): string {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${encodeURIComponent(data.token)}`;
  
  return `
    <h1>Verify Your Email Address</h1>
    <p>Hi ${escapeHtml(data.firstName)},</p>
    <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
    
    <a href="${verificationUrl}" class="button">Verify Email</a>
    
    <p>This verification link will expire in <strong>24 hours</strong>.</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>Why verify?</strong></p>
        <p style="margin: 10px 0 0 0;">Email verification helps us ensure account security and enables important order notifications.</p>
    </div>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6B7280; font-size: 12px;">${verificationUrl}</p>
  `;
}

export function paymentConfirmationTemplate(data: {
  firstName: string;
  orderNumber: string;
  amount: number;
  paymentMethod: string;
}): string {
  return `
    <h1>Payment Received</h1>
    <p>Hi ${escapeHtml(data.firstName)},</p>
    <p>We've received your payment for order <strong>#${escapeHtml(data.orderNumber)}</strong>.</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>Payment Details:</strong></p>
        <p style="margin: 5px 0 0 0;">Amount: <strong>$${(data.amount / 100).toFixed(2)}</strong></p>
        <p style="margin: 5px 0 0 0;">Method: <strong>${escapeHtml(data.paymentMethod || 'Credit Card')}</strong></p>
    </div>
    
    <p>Your order is now being processed and will be shipped soon.</p>
    
    <a href="${config.frontendUrl}/orders/${data.orderNumber}" class="button">View Order</a>
  `;
}

export function lowStockAlertTemplate(data: {
  productName: string;
  sku: string;
  stock: number;
  threshold: number;
}): string {
  return `
    <h1>⚠️ Low Stock Alert</h1>
    <p>The following product is running low on inventory:</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>${escapeHtml(data.productName)}</strong></p>
        <p style="margin: 5px 0 0 0;">SKU: ${escapeHtml(data.sku)}</p>
        <p style="margin: 5px 0 0 0;">Current Stock: <strong>${data.stock} units</strong></p>
        <p style="margin: 5px 0 0 0;">Threshold: ${data.threshold} units</p>
    </div>
    
    <p>Please restock this item to avoid running out of inventory.</p>
    
    <a href="${config.frontendUrl}/admin/products" class="button">Manage Inventory</a>
  `;
}

export function orderShippedTemplate(data: {
  firstName: string;
  orderNumber: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}): string {
  return `
    <h1>Your Order Has Shipped! 📦</h1>
    <p>Hi ${escapeHtml(data.firstName)},</p>
    <p>Great news! Your order <strong>#${escapeHtml(data.orderNumber)}</strong> has been shipped and is on its way to you.</p>
    
    ${
      data.trackingNumber
        ? `
    <div class="info-box">
        <p style="margin: 0;"><strong>Tracking Information:</strong></p>
        ${data.carrier ? `<p style="margin: 5px 0 0 0;">Carrier: ${escapeHtml(data.carrier)}</p>` : ''}
        <p style="margin: 5px 0 0 0;">Tracking Number: <strong>${escapeHtml(data.trackingNumber)}</strong></p>
        ${data.estimatedDelivery ? `<p style="margin: 5px 0 0 0;">Estimated Delivery: ${escapeHtml(data.estimatedDelivery)}</p>` : ''}
    </div>
    `
        : ''
    }
    
    <a href="${config.frontendUrl}/orders/${data.orderNumber}" class="button">Track Your Order</a>
    
    <p>Thank you for shopping with us!</p>
  `;
}
