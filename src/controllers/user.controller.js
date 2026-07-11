import { HTTP_STATUS } from "../constants/http-status.constants.js";
import * as userService from "../services/user.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, role } = req.query;
  const { users, meta } = await userService.getAllUsers({
    page,
    limit,
    role,
  });

  sendSuccess(res, {
    message: "Users fetched successfully",
    data: users,
    meta,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  sendSuccess(res, { message: "User fetched successfully", data: user });
});

// Admin-only: update any user's account.
export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUserById(
    req.params.id,
    req.body,
    req.user,
  );

  sendSuccess(res, { message: "User updated successfully", data: user });
});

// Admin-only: delete any user's account.
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUserById(req.params.id, req.user);

  sendSuccess(res, { message: "User deleted successfully" });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getOwnProfile(req.user._id);

  sendSuccess(res, { message: "Profile fetched successfully", data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateOwnProfile(req.user._id, req.body);

  sendSuccess(res, { message: "Profile updated successfully", data: user });
});

export const deleteProfile = asyncHandler(async (req, res) => {
  await userService.deleteOwnProfile(req.user._id, req.body.password);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.OK,
    message: "Account deleted successfully",
  });
});
