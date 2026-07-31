import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import helmet from "helmet";
import compression from "compression";
import { logger } from "./lib/logger";

// Migrated routes
import router from "./routes/index";

const app = express();

app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

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

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found", code: "NOT_FOUND" });
});

// Generic error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || err.status || 500;
  logger.error({ err }, "Unhandled error");
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR",
  });
});

export default app;
