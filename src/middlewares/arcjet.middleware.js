import aj from "../config/arcjet.js";
import { HTTP_STATUS } from "../constants/http-status.constants.js";
import asyncHandler from "../utils/asyncHandler.js";

const arcjetMiddleware = asyncHandler(async (req, res, next) => {
  const decision = await aj.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: "Rate limit exceeded. Please try again later.",
      });
    }

    if (decision.reason.isBot()) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ success: false, message: "Bot detected." });
    }

    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ success: false, message: "Access denied." });
  }

  next();
});

export default arcjetMiddleware;
