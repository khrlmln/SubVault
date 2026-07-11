import { HTTP_STATUS } from "../constants/http-status.constants.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { signToken } from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      HTTP_STATUS.CONFLICT,
    );
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });
  const token = signToken({ userId: user._id });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  const token = signToken({ userId: user._id });

  return { user, token };
};
