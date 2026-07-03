import pino from 'pino';
import { config } from './index';

export const logger = pino({
  level: config.logging.level,
  transport: config.isDev
    ? { target: 'pino/file', options: { destination: 1 } }
    : undefined,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token'],
    censor: '[REDACTED]',
  },
});
