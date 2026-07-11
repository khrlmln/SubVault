import { HTTP_STATUS } from "../constants/http-status.constants.js";
import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const signUp = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: "User created successfully",
    data: { user, token: `Bearer ${token}` },
  });
});

export const signIn = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  sendSuccess(res, {
    message: "User signed in successfully",
    data: { user, token: `Bearer ${token}` },
  });
});

export const signOut = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: "Signed out successfully" });
});
