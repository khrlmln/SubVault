import { HTTP_STATUS } from "../constants/http-status.constants.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/appError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyToken } from "../utils/jwt.js";

/**
Verifies the bearer token and loads the current user fresh from the
database on every request (rather than trusting the JWT payload alone),
so a deleted account or a role change takes effect immediately even if
an old, still-valid token is used. Attaches the user to `req.user` for
every downstream middleware and controller.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    throw new AppError(
      "You are not logged in. Please log in to continue.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError(
      "The user belonging to this token no longer exists.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to one or more roles. Must be chained after
 * `authenticate`, since it relies on `req.user` already being set.
 *
 * @example
 * router.get("/", authenticate, restrictTo(USER_ROLES.ADMIN), getUsers);
 */
export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    return next();
  };

export default authenticate;
