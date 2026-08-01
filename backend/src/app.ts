import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import helmet from "helmet";
import compression from "compression";
import { logger } from "./lib/logger";

// Migrated routes
import router from "./routes/index";
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { requestIdMiddleware } from './middleware/requestId';
import { securityHeaders } from './middleware/security';

const app = express();

app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

app.use(requestIdMiddleware);

app.use(securityHeaders);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(compression() as any);

app.use(generalLimiter);

app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      if (req.path?.includes("webhook")) {
        req.rawBody = buf.toString();
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// Workspace health check convention
app.get("/api/healthz", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// All migrated API v1 routes
app.use("/api/v1", router);

// Root info
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "CommerceFlow API",
    version: "1.0.0",
    health: "/api/healthz",
  });
});

// 404 handler
app.use(notFoundHandler);

// Generic error handler
app.use(errorHandler);

export default app;
