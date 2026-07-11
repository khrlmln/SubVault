import { HTTP_STATUS } from "../constants/http-status.constants.js";
import AppError from "../utils/appError.js";

const notFoundMiddleware = (req, res, next) => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      HTTP_STATUS.NOT_FOUND,
    ),
  );
};

export default notFoundMiddleware;
