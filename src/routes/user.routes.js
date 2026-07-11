import { Router } from "express";
import { USER_ROLES } from "../constants/role.constants.js";
import {
  deleteProfile,
  deleteUser,
  getProfile,
  getUser,
  getUsers,
  updateProfile,
  updateUser,
} from "../controllers/user.controller.js";
import authenticate, { restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  deleteProfileSchema,
  listUsersQuerySchema,
  updateProfileSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../validations/user.validation.js";

const userRouter = Router();

userRouter
  .route("/profile")
  .get(authenticate, getProfile)
  .patch(authenticate, validate(updateProfileSchema), updateProfile)
  .delete(authenticate, validate(deleteProfileSchema), deleteProfile);

// Admin-only: managing every user account.
userRouter
  .route("/")
  .get(
    authenticate,
    restrictTo(USER_ROLES.ADMIN),
    validate(listUsersQuerySchema),
    getUsers,
  );

userRouter
  .route("/:id")
  .get(
    authenticate,
    restrictTo(USER_ROLES.ADMIN),
    validate(userIdParamSchema),
    getUser,
  )
  .patch(
    authenticate,
    restrictTo(USER_ROLES.ADMIN),
    validate(updateUserSchema),
    updateUser,
  )
  .delete(
    authenticate,
    restrictTo(USER_ROLES.ADMIN),
    validate(userIdParamSchema),
    deleteUser,
  );

export default userRouter;
