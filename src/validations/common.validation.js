import Joi from "joi";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "../constants/pagination.constants.js";

/*
Validates a MongoDB ObjectId passed as a route param / body field.
Kept as a plain hex-length check rather than pulling in a dedicated
joi-objectid plugin, since this is the only rule needed.
 */
export const objectId = Joi.string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('"{{#label}}" must be a valid ID');

/**
Reusable page/limit fields for any endpoint that lists resources.
Spread into a Joi.object({ ... }) alongside resource-specific filters.
 */
export const paginationFields = {
  page: Joi.number().integer().min(1).default(DEFAULT_PAGE),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
};
