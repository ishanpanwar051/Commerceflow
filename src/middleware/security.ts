import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Simple sanitization without ReDoS-vulnerable regex patterns
function sanitizeValue(value: string): string {
  let result = value;
  // Remove <script> tags using simple string operations (no catastrophic backtracking)
  while (result.includes('<script') || result.includes('<SCRIPT')) {
    const scriptOpen = result.toLowerCase().indexOf('<script');
    if (scriptOpen === -1) break;
    const scriptClose = result.toLowerCase().indexOf('</script>', scriptOpen);
    if (scriptClose === -1) {
      result = result.substring(0, scriptOpen);
    } else {
      result = result.substring(0, scriptOpen) + result.substring(scriptClose + 9);
    }
  }
  // Remove javascript: protocol references
  result = result.replace(/javascript\s*:/gi, '');
  // Remove event handlers (onclick, onload, etc.) - simple string check without ReDoS
  const eventHandlerPatterns = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onsubmit', 'onchange', 'onkeydown', 'onkeypress', 'onkeyup', 'ondblclick', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave', 'onresize', 'onscroll', 'oninput', 'oninvalid', 'onselect', 'onwheel', 'oncontextmenu', 'onauxclick', 'ongotpointercapture', 'onlostpointercapture', 'onpointerdown', 'onpointermove', 'onpointerup', 'onpointercancel', 'onpointerover', 'onpointerout', 'onpointerenter', 'onpointerleave', 'ontouchcancel', 'ontouchend', 'ontouchmove', 'ontouchstart', 'onanimationend', 'onanimationiteration', 'onanimationstart', 'ontransitionend', 'ontransitionrun', 'ontransitionstart'];
  for (const handler of eventHandlerPatterns) {
    while (result.toLowerCase().includes(handler)) {
      const idx = result.toLowerCase().indexOf(handler);
      const eqIdx = result.indexOf('=', idx);
      if (eqIdx === -1) break;
      // Find the end of the attribute value
      const afterEq = result[eqIdx + 1];
      let endIdx;
      if (afterEq === '"') {
        endIdx = result.indexOf('"', eqIdx + 2);
        if (endIdx === -1) endIdx = result.length;
        else endIdx = endIdx + 1;
      } else if (afterEq === "'") {
        endIdx = result.indexOf("'", eqIdx + 2);
        if (endIdx === -1) endIdx = result.length;
        else endIdx = endIdx + 1;
      } else {
        // Unquoted value - find next space or end
        endIdx = result.indexOf(' ', eqIdx + 1);
        if (endIdx === -1) endIdx = result.indexOf('>', eqIdx + 1);
        if (endIdx === -1) endIdx = result.length;
      }
      result = result.substring(0, idx) + result.substring(endIdx);
    }
  }
  return result;
}

function sanitize(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeValue(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitize((obj as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  return obj;
}

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitize(req.body) as typeof req.body;
    }
    // Do NOT reassign req.query or req.params - they are read-only getters in Express
    next();
  } catch (error) {
    logger.error({ error }, 'Sanitize middleware error - allowing request to proceed');
    next();
  }
}

// Block common attack patterns
const SUSPICIOUS_AGENTS = ['sqlmap', 'nikto', 'nmap', 'masscan', 'nessus'];
const ATTACK_PATHS = ['/.env', '/phpmyadmin', '/.git', '/wp-admin', '/wp-login', '/.htaccess'];
const SQL_PATTERNS = [
  /union\s+.*select/i,
  /drop\s+.*table/i,
  /insert\s+.*into/i,
  /delete\s+.*from/i,
  /update\s+.*set/i,
  /;\s*drop/i,
];

export function preventAttacks(req: Request, res: Response, next: NextFunction): void {
  try {
    const userAgent = (req.get('user-agent') || '').toLowerCase();

    // Block suspicious user agents
    if (SUSPICIOUS_AGENTS.some(agent => userAgent.includes(agent))) {
      logger.warn({ userAgent: req.get('user-agent'), ip: req.ip }, 'Blocked suspicious user agent');
      res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    // Block common attack paths
    const path = req.path.toLowerCase();
    if (ATTACK_PATHS.some(attackPath => path === attackPath || path.startsWith(attackPath + '/'))) {
      logger.warn({ path, ip: req.ip }, 'Blocked attack path attempt');
      res.status(404).json({ success: false, message: 'Not found', code: 'NOT_FOUND' });
      return;
    }

    // Block SQL injection patterns in query strings
    const queryString = req.url.toLowerCase();
    if (SQL_PATTERNS.some(pattern => pattern.test(queryString))) {
      logger.warn({ url: req.url, ip: req.ip }, 'Blocked SQL injection attempt');
      res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    next();
  } catch (error) {
    next();
  }
}

// Add security headers
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  } catch (error) {
    next();
  }
}

// Request size limits based on content type
const MAX_SIZE = 10 * 1024 * 1024; // 10MB default
const STRICT_MAX_SIZE = 100 * 1024; // 100KB
const STRICT_ENDPOINTS = ['/api/v1/auth', '/api/v1/users/profile'];

export function validateContentLength(req: Request, res: Response, next: NextFunction): void {
  try {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    if (contentLength === 0) {
      next();
      return;
    }

    const isStrict = STRICT_ENDPOINTS.some(endpoint => req.path.startsWith(endpoint));
    const maxSize = isStrict ? STRICT_MAX_SIZE : MAX_SIZE;

    if (contentLength > maxSize) {
      logger.warn({ contentLength, path: req.path, maxSize }, 'Request too large');
      res.status(413).json({ success: false, message: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
      return;
    }

    next();
  } catch (error) {
    next();
  }
}


// Monitor for brute force attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const BRUTE_FORCE_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const PROTECTED_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/reset-password'];

export function bruteForceProtection(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!PROTECTED_PATHS.includes(req.path)) {
      next();
      return;
    }

    const ip = req.ip || 'unknown';
    const now = Date.now();

    let attempt = loginAttempts.get(ip);

    if (!attempt || now > attempt.resetAt) {
      loginAttempts.set(ip, { count: 1, resetAt: now + BRUTE_FORCE_WINDOW });
      next();
      return;
    }

    if (attempt.count >= MAX_ATTEMPTS) {
      logger.warn({ ip, path: req.path }, 'Brute force attempt blocked');
      res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        code: 'TOO_MANY_ATTEMPTS',
      });
      return;
    }

    attempt.count++;
    next();
  } catch (error) {
    next();
  }
}

// Periodic cleanup of old entries (runs every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts) {
    if (now > value.resetAt) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

