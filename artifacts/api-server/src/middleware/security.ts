import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Input sanitization to prevent XSS
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potential XSS patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  // Express 5 made req.query a read-only getter — use defineProperty to override
  if (req.query) {
    const sanitized = sanitize(req.query);
    Object.defineProperty(req, 'query', { get: () => sanitized, configurable: true });
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
}

// Prevent common attack patterns
export function preventAttacks(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.get('user-agent') || '';
  const path = req.path.toLowerCase();

  // Block suspicious user agents
  const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'nessus'];
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    logger.warn({ userAgent, ip: req.ip }, 'Blocked suspicious user agent');
    return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }

  // Block common attack paths (not /admin — that's a legitimate app route)
  const attackPaths = [
    '/.env',
    '/phpmy admin',
    '/.git',
    '/wp-admin',
    '/wp-login',
    '/.htaccess',
  ];
  
  if (attackPaths.some(attackPath => path.includes(attackPath))) {
    logger.warn({ path, ip: req.ip }, 'Blocked attack path attempt');
    return res.status(404).json({ success: false, message: 'Not found', code: 'NOT_FOUND' });
  }

  // Block SQL injection patterns in query strings
  const sqlPatterns = [
    'union.*select',
    'drop.*table',
    'insert.*into',
    'delete.*from',
    'update.*set',
    '--',
    ';.*drop',
  ];
  
  const queryString = req.url.toLowerCase();
  if (sqlPatterns.some(pattern => new RegExp(pattern).test(queryString))) {
    logger.warn({ url: req.url, ip: req.ip }, 'Blocked SQL injection attempt');
    return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }

  next();
}

// Add security headers
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}

// Request size limits based on content type
export function validateContentLength(req: Request, res: Response, next: NextFunction) {
  const contentLength = parseInt(req.get('content-length') || '0', 10);
  const maxSize = 10 * 1024 * 1024; // 10MB default
  
  // Stricter limits for certain endpoints
  const strictEndpoints = ['/api/v1/auth', '/api/v1/users/profile'];
  const strictLimit = 100 * 1024; // 100KB
  
  if (strictEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    if (contentLength > strictLimit) {
      logger.warn({ contentLength, path: req.path }, 'Request too large for endpoint');
      return res.status(413).json({ success: false, message: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
    }
  } else if (contentLength > maxSize) {
    logger.warn({ contentLength, path: req.path }, 'Request too large');
    return res.status(413).json({ success: false, message: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
  }

  next();
}

// Monitor for brute force attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function bruteForceProtection(req: Request, res: Response, next: NextFunction) {
  // Only apply to sensitive endpoints
  const protectedPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/reset-password'];
  if (!protectedPaths.includes(req.path)) {
    return next();
  }

  const ip = req.ip || 'unknown';
  const now = Date.now();
  const window = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempt = loginAttempts.get(ip);
  
  if (attempt) {
    if (now > attempt.resetAt) {
      // Window expired, reset
      loginAttempts.set(ip, { count: 1, resetAt: now + window });
    } else if (attempt.count >= maxAttempts) {
      // Too many attempts
      logger.warn({ ip, path: req.path }, 'Brute force attempt blocked');
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.',
        code: 'TOO_MANY_ATTEMPTS',
      });
    } else {
      // Increment counter
      attempt.count++;
    }
  } else {
    // First attempt
    loginAttempts.set(ip, { count: 1, resetAt: now + window });
  }

  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    const keysToDelete: string[] = [];
    loginAttempts.forEach((value, key) => {
      if (now > value.resetAt) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => loginAttempts.delete(key));
  }

  next();
}
