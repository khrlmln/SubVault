import { HTTP_STATUS } from "../constants/http-status.constants.js";
import AppError from "../utils/appError.js";

const validationOptions = {
  abortEarly: false, // collect every error, not just the first
  stripUnknown: true, // drop fields that aren't part of the schema
  convert: true, // coerce query-string numbers/dates, apply defaults
};

/*
Builds an Express middleware that validates one or more parts of the
request against Joi schemas, then replaces that part of the request
with Joi's parsed/coerced/defaulted output so downstream code (services,
controllers) can trust `req.body` / `req.params` / `req.query` completely.
*/
const validate = (schema) => (req, res, next) => {
  const partsToValidate = ["params", "query", "body"].filter(
    (part) => schema[part],
  );

  for (const part of partsToValidate) {
    const { error, value } = schema[part].validate(
      req[part],
      validationOptions,
    );

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY));
    }

    if (part === "query") {
      Object.defineProperty(req, "query", {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[part] = value;
    }
  }

  return next();
};

export default validate;
