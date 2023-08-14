import Joi from "joi";
import { validatePassowrd } from "../utils/validate";

export const validateLoginSchema = Joi.object({
  password: Joi.required().custom(validatePassowrd),
  email: Joi.string().required().email(),
});

export const validateRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});