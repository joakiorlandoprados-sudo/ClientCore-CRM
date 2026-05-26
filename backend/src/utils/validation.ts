import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { badRequest } from "./http-error";

export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  payload: unknown,
  skipMissingProperties = false
): Promise<T> {
  const instance = plainToInstance(dtoClass, payload, {
    enableImplicitConversion: true
  });
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties
  });

  if (errors.length > 0) {
    const details = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints
    }));
    throw badRequest("Validation failed", details);
  }

  return instance;
}
