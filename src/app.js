import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { CLIENT_URL, NODE_ENV } from "./config/env.js";
import { getConnectionStateLabel } from "./database/mongodb.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

/*
Trust the first proxy hop (Render/Railway/Heroku/Nginx, etc.) so
req.ip reflects the real client address. Without this, every request
behind a reverse proxy looks like it comes from the same IP, which
would silently break Arcjet's per-IP rate limiting.
*/
app.set("trust proxy", 1);

/*
Deliberately mounted before any security/rate-limiting middleware:
infrastructure health checks (load balancers, uptime monitors, container
orchestrators) poll this frequently and should never be blocked by CORS,
bot detection, or rate limits.
*/
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SubVault API is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: getConnectionStateLabel(),
    },
  });
});

app.use(helmet());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(compression());
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());

app.use(arcjetMiddleware);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the SubVault API",
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
