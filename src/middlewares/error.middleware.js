import { NODE_ENV } from "../config/env.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";
import AppError from "../utils/appError.js";

const handleCastErrorDB = (err) =>
  new AppError(
    `Invalid value for "${err.path}": ${err.value}`,
    HTTP_STATUS.BAD_REQUEST,
  );

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue ?? {})[0];
  const message = field
    ? `An account or record with that ${field} already exists.`
    : "Duplicate field value entered.";
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join(". ");
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", HTTP_STATUS.UNAUTHORIZED);

const handleJWTExpiredError = () =>
  new AppError(
    "Your session has expired. Please log in again.",
    HTTP_STATUS.UNAUTHORIZED,
  );

/**
Single, centralized error handler. Every thrown/forwarded error in the
app ends up here. Known error types (bad ObjectId, duplicate key,
Mongoose validation, JWT issues) are translated into clean, operational
AppErrors; anything else is treated as an unexpected error and, outside
development, is never shown to the client verbatim.
 */
const errorMiddleware = (err, req, res, _next) => {
  let error = err;

  if (err.name === "CastError") error = handleCastErrorDB(err);
  else if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  else if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  else if (err.name === "JsonWebTokenError") error = handleJWTError();
  else if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isOperational = error.isOperational ?? false;

  if (!isOperational) {
    // Unexpected/programming errors are always logged in full server-side.
    console.error("💥 UNEXPECTED ERROR:", err);
  } else if (NODE_ENV === "development") {
    console.error("ERROR:", error);
  }

  const clientMessage =
    isOperational || NODE_ENV !== "production"
      ? error.message
      : "Something went wrong. Please try again later.";

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;
