# Email Configuration Guide

This guide explains how to configure email services for CommerceFlow.

## Table of Contents
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Email Providers](#email-providers)
- [Testing Emails](#testing-emails)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Minimum Configuration

Add to your `.env` file:

```env
# Basic SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

## Development Setup

### Option 1: Local Mail Server (Recommended)

Use a local SMTP server for development that captures emails without sending them.

#### Mailhog (Recommended)

```bash
# Install Mailhog
# macOS
brew install mailhog

# Windows (via Chocolatey)
choco install mailhog

# Or use Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Start Mailhog
mailhog
```

Then configure `.env`:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=dev@commerceflow.local
```

View emails at: http://localhost:8025

#### MailCatcher

```bash
# Install MailCatcher
gem install mailcatcher

# Start MailCatcher
mailcatcher
```

Configure `.env`:
```env
SMTP_HOST=localhost
SMTP_PORT=1025
EMAIL_FROM=dev@commerceflow.local
```

View emails at: http://localhost:1080

### Option 2: Real Email Provider

Use your personal Gmail account for development:

1. Enable 2-factor authentication in your Google account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Generate password for "Mail"
3. Configure `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
```

## Production Setup

For production, use a dedicated email service provider.

### Recommended Providers

| Provider | Reliability | Free Tier | Pricing | Best For |
|----------|------------|-----------|---------|----------|
| **SendGrid** | ⭐⭐⭐⭐⭐ | 100/day | From $15/mo | Enterprise |
| **AWS SES** | ⭐⭐⭐⭐⭐ | 62,000/mo (free with EC2) | $0.10/1000 | AWS users |
| **Mailgun** | ⭐⭐⭐⭐ | 5,000/mo | From $15/mo | Developers |
| **Postmark** | ⭐⭐⭐⭐⭐ | 100/mo | From $15/mo | Transactional |
| **Resend** | ⭐⭐⭐⭐ | 3,000/mo | From $20/mo | Modern API |

## Email Providers

### SendGrid

1. **Sign up**: https://sendgrid.com
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Configure**:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### AWS SES

1. **Sign up**: https://aws.amazon.com/ses/
2. **Verify domain** or email address
3. **Create SMTP credentials**: SES Console → SMTP Settings → Create SMTP Credentials
4. **Configure**:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com
```

**Note**: Start in sandbox mode (limited to verified emails). Request production access.

### Mailgun

1. **Sign up**: https://mailgun.com
2. **Add domain**: Domains → Add New Domain
3. **Get SMTP credentials**: Domain Settings → SMTP
4. **Configure**:

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com
```

### Postmark

1. **Sign up**: https://postmarkapp.com
2. **Add sender signature**: verify email or domain
3. **Get SMTP credentials**: Servers → Credentials
4. **Configure**:

```env
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=your_server_token
SMTP_PASS=your_server_token
EMAIL_FROM=noreply@yourdomain.com
```

### Resend

1. **Sign up**: https://resend.com
2. **Create API Key**: API Keys → Create
3. **Configure**:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### Gmail (Not Recommended for Production)

Only for low-volume applications:

1. Enable 2FA
2. Create App Password
3. **Configure**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Limitations**: 
- Maximum 500 emails/day
- May be flagged as spam
- Account can be suspended

## Testing Emails

### Test Configuration

```bash
# Start the backend
npm run dev

# In another terminal, test the email service
curl -X POST http://localhost:4000/api/v1/test/email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### Manual Testing

1. **Register a new account** - triggers welcome email
2. **Reset password** - triggers password reset email
3. **Place an order** - triggers order confirmation email
4. **Verify payment** - triggers payment confirmation email

### Check Logs

```bash
# Watch application logs
npm run dev

# Look for email-related log entries:
# "Email sent successfully"
# "Email service not configured"
# "Failed to send email"
```

## Email Templates

CommerceFlow includes professional email templates:

- **Welcome Email** - Sent on user registration
- **Email Verification** - Sent to verify email address
- **Password Reset** - Sent when user requests password reset
- **Order Confirmation** - Sent when order is placed
- **Payment Confirmation** - Sent when payment is received
- **Order Shipped** - Sent with tracking information
- **Low Stock Alert** - Sent to admins for inventory management

### Customizing Templates

Templates are located in:
- `src/utils/email-templates.ts` - Template functions
- `src/templates/email-base.html` - Base HTML template

To customize:
1. Edit template functions in `email-templates.ts`
2. Modify styles in `email-base.html`
3. Test changes in development

## Environment Variables

Complete list of email-related environment variables:

```env
# SMTP Server Configuration
SMTP_HOST=smtp.example.com       # SMTP server hostname
SMTP_PORT=587                    # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-username          # SMTP username
SMTP_PASS=your-password          # SMTP password

# Email Settings
EMAIL_FROM=noreply@example.com   # From address for all emails

# Frontend URL (for email links)
FRONTEND_URL=https://example.com
```

## Troubleshooting

### Emails Not Sending

**Check configuration**:
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.SMTP_HOST, process.env.SMTP_USER)"
```

**Check logs**:
```bash
npm run dev
# Look for: "Email service configured" or "SMTP not configured"
```

**Common issues**:
1. Wrong SMTP port (use 587 for most providers)
2. Missing SMTP credentials
3. Firewall blocking port 587
4. Invalid App Password for Gmail

### Emails Go to Spam

**Solutions**:
1. **Verify domain**: Add SPF, DKIM, DMARC records
2. **Use verified sender**: Most providers require domain verification
3. **Warm up IP**: Start with low volume, gradually increase
4. **Check content**: Avoid spam trigger words
5. **Use professional email provider**: Don't use Gmail for production

### Connection Timeout

**Causes**:
- Incorrect SMTP host or port
- Firewall blocking SMTP
- VPS/Cloud provider blocking port 25

**Solutions**:
```env
# Try alternative ports
SMTP_PORT=2525  # Alternative port for some providers
SMTP_PORT=465   # SSL port
```

### Authentication Failed

**Causes**:
- Wrong username or password
- 2FA not set up (for Gmail)
- App password not generated

**Solutions**:
1. Double-check credentials
2. Generate new App Password
3. Use API key instead of password (SendGrid, Mailgun)

### Rate Limiting

Most providers have sending limits:

| Provider | Free Tier Limit | Rate Limit |
|----------|----------------|------------|
| SendGrid | 100/day | 600/minute |
| AWS SES | 62,000/mo | 1/second (initially) |
| Mailgun | 5,000/mo | 100/hour |
| Postmark | 100/mo | 600/minute |

**Solution**: Implement email queue with delays (already built-in via BullMQ)

## Best Practices

### Development
1. ✅ Use local mail server (Mailhog, MailCatcher)
2. ✅ Never use production SMTP in development
3. ✅ Test all email types regularly
4. ✅ Keep templates in version control

### Production
1. ✅ Use dedicated email service provider
2. ✅ Verify domain with SPF/DKIM
3. ✅ Monitor email delivery rates
4. ✅ Set up email bounce handling
5. ✅ Use separate credentials per environment
6. ✅ Enable email queue for reliability
7. ✅ Log all email events

### Security
1. ✅ Never commit SMTP credentials to Git
2. ✅ Use App Passwords instead of real passwords
3. ✅ Rotate credentials regularly
4. ✅ Use environment variables
5. ✅ Enable 2FA on email provider accounts

## Monitoring

### Email Delivery Monitoring

Track email metrics:
- Delivery rate
- Bounce rate
- Open rate (if tracked)
- Click rate (if tracked)

Most providers offer dashboards:
- SendGrid: https://app.sendgrid.com/statistics
- AWS SES: CloudWatch metrics
- Mailgun: Dashboard → Analytics
- Postmark: Activity → Messages

### Application Logs

CommerceFlow logs all email events:
```json
{
  "level": "info",
  "msg": "Email sent successfully",
  "messageId": "abc123",
  "to": "user@example.com",
  "subject": "Order Confirmation",
  "accepted": ["user@example.com"],
  "rejected": []
}
```

## Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid Best Practices](https://docs.sendgrid.com/ui/sending-email/deliverability)
- [AWS SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [Email Deliverability Guide](https://www.validity.com/resource-center/email-deliverability-101/)
