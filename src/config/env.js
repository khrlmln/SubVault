import "dotenv/config";
import Joi from "joi";

const envSchema = Joi.object({
  PORT: Joi.number().port().default(5500),
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  DB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  ARCJET_KEY: Joi.string().required(),
  ARCJET_ENV: Joi.string().optional(),
  CLIENT_URL: Joi.string().required(),
})
  .unknown(true) // process.env has plenty of other unrelated system vars
  .required();

const { error, value: validatedEnv } = envSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  console.error("Invalid environment configuration:");
  error.details.forEach(({ message }) => console.error(`  - ${message}`));
  process.exit(1);
}

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  ARCJET_KEY,
  ARCJET_ENV,
  CLIENT_URL,
} = validatedEnv;
