import Joi from "joi";

const BCRYPT_MAX_BYTES = 72;

export const signUpSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(30).required().messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 30 characters",
    }),
    email: Joi.string().trim().lowercase().email().required().messages({
      "string.email": "Please provide a valid email address",
    }),
    password: Joi.string().min(8).max(BCRYPT_MAX_BYTES).required().messages({
      "string.min": "Password must be at least 8 characters long",
    }),
  }),
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().email().required().messages({
      "string.email": "Please provide a valid email address",
    }),
    password: Joi.string().required(),
  }),
};
