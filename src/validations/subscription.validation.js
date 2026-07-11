import Joi from "joi";
import {
  MAX_UPCOMING_RENEWAL_WINDOW_DAYS,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_CURRENCIES,
  SUBSCRIPTION_FREQUENCIES,
  SUBSCRIPTION_STATUSES,
} from "../constants/subscription.constants.js";
import { objectId, paginationFields } from "./common.validation.js";

const fields = {
  name: Joi.string().trim().min(2).max(100),
  price: Joi.number().min(0),
  currency: Joi.string().valid(...SUBSCRIPTION_CURRENCIES),
  frequency: Joi.string().valid(...SUBSCRIPTION_FREQUENCIES),
  category: Joi.string().valid(...SUBSCRIPTION_CATEGORIES),
  paymentMethod: Joi.string().trim().min(2).max(50),
  status: Joi.string().valid(...SUBSCRIPTION_STATUSES),
  startDate: Joi.date().max("now").messages({
    "date.max": "Start date must be in the past",
  }),
  renewalDate: Joi.date(),
};

const withRenewalAfterStartRule = (schema) =>
  schema.custom((value, helpers) => {
    if (
      value.startDate &&
      value.renewalDate &&
      value.renewalDate <= value.startDate
    ) {
      return helpers.message({
        custom: '"renewalDate" must be after "startDate"',
      });
    }
    return value;
  }, "renewal date must be after start date");

export const createSubscriptionSchema = {
  body: withRenewalAfterStartRule(
    Joi.object({
      name: fields.name.required(),
      price: fields.price.required(),
      currency: fields.currency,
      frequency: fields.frequency.required(),
      category: fields.category.required(),
      paymentMethod: fields.paymentMethod.required(),
      status: fields.status,
      startDate: fields.startDate.required(),
      renewalDate: fields.renewalDate,
    }),
  ),
};

export const updateSubscriptionSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: withRenewalAfterStartRule(
    Joi.object({
      name: fields.name,
      price: fields.price,
      currency: fields.currency,
      frequency: fields.frequency,
      category: fields.category,
      paymentMethod: fields.paymentMethod,
      status: fields.status,
      startDate: fields.startDate,
      renewalDate: fields.renewalDate,
    }).min(1),
  ).messages({ "object.min": "Provide at least one field to update" }),
};

export const subscriptionIdParamSchema = {
  params: Joi.object({ id: objectId.required() }),
};

export const listSubscriptionsQuerySchema = {
  // `userId` only has an effect for admins narrowing the full list down to
  // one customer; for a non-admin caller the service layer always scopes
  // the query to their own id regardless of this field.
  query: Joi.object({
    status: fields.status,
    userId: objectId,
    ...paginationFields,
  }),
};

export const upcomingRenewalsQuerySchema = {
  query: Joi.object({
    days: Joi.number()
      .integer()
      .min(1)
      .max(MAX_UPCOMING_RENEWAL_WINDOW_DAYS)
      .default(7),
  }),
};
