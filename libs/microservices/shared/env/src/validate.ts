import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { omitBy } from 'lodash-es';

export const validate = <T extends object>(envClass: ClassConstructor<T>) => {
  return (config: Record<string, unknown>): T => {
    // eslint-disable-next-line no-param-reassign
    config = omitBy(
      config,
      (val) => !val || val === 'null' || val === 'undefined',
    );

    const validatedConfig = plainToClass(envClass, config, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    });

    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
      forbidUnknownValues: true,
      whitelist: true,
      validationError: {
        target: false,
      },
    });

    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
    return validatedConfig;
  };
};
