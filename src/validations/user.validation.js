import Joi from "joi";
import { USER_ROLE_VALUES } from "../constants/role.constants.js";
import { objectId, paginationFields } from "./common.validation.js";

const BCRYPT_MAX_BYTES = 72;

export const listUsersQuerySchema = {
  query: Joi.object({
    role: Joi.string().valid(...USER_ROLE_VALUES),
    ...paginationFields,
  }),
};

export const userIdParamSchema = {
  params: Joi.object({
    id: objectId.required(),
  }),
};

export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(30),
    email: Joi.string().trim().lowercase().email(),
    password: Joi.string().min(8).max(BCRYPT_MAX_BYTES),
  })
    .min(1)
    .messages({ "object.min": "Provide at least one field to update" }),
};

// Admin-only: updating another user's account. Deliberately excludes
// `password` — resetting someone else's password is a "forgot password"
// flow, not something an admin should be able to do silently in-band.
export const updateUserSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(30),
    email: Joi.string().trim().lowercase().email(),
    role: Joi.string().valid(...USER_ROLE_VALUES),
  })
    .min(1)
    .messages({ "object.min": "Provide at least one field to update" }),
};

export const deleteProfileSchema = {
  body: Joi.object({
    password: Joi.string().required().messages({
      "any.required": "Enter your password to confirm account deletion",
    }),
  }),
};
