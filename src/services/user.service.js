import { HTTP_STATUS } from "../constants/http-status.constants.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import AppError from "../utils/appError.js";
import { comparePassword, hashPassword } from "../utils/password.js";

export const getAllUsers = async ({ page, limit, role }) => {
  const query = { ...(role && { role }) };
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

export const getOwnProfile = async (userId) => getUserById(userId);

export const updateOwnProfile = async (userId, updates) => {
  if (updates.email) {
    const emailTaken = await User.exists({
      email: updates.email,
      _id: { $ne: userId },
    });

    if (emailTaken) {
      throw new AppError("Email is already in use", HTTP_STATUS.CONFLICT);
    }
  }

  if (updates.password) {
    updates.password = await hashPassword(updates.password);
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

export const deleteOwnProfile = async (userId, password) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Incorrect password", HTTP_STATUS.UNAUTHORIZED);
  }

  await user.deleteOne();

  await Subscription.deleteMany({ user: userId });

  return user;
};

// Admin-only: update any user's account (name, email, and/or role).
export const updateUserById = async (targetUserId, updates, currentUser) => {
  const isSelf = String(currentUser._id) === String(targetUserId);

  if (isSelf && updates.role && updates.role !== currentUser.role) {
    throw new AppError(
      "You cannot change your own role",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (updates.email) {
    const emailTaken = await User.exists({
      email: updates.email,
      _id: { $ne: targetUserId },
    });

    if (emailTaken) {
      throw new AppError("Email is already in use", HTTP_STATUS.CONFLICT);
    }
  }

  const user = await User.findByIdAndUpdate(targetUserId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

// Admin-only: delete any user's account (and their subscriptions with it).
export const deleteUserById = async (targetUserId, currentUser) => {
  if (String(currentUser._id) === String(targetUserId)) {
    throw new AppError(
      "Use your profile settings to delete your own account",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const user = await User.findByIdAndDelete(targetUserId);

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  await Subscription.deleteMany({ user: targetUserId });

  return user;
};
