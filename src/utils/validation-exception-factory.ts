import { ValidationError } from 'class-validator';
import { CustomException } from '../utils/custom-exception';

export function validationExceptionFactory(errors: ValidationError[]) {
  const formattedErrors = {};

  const handleNestedErrors = (err: ValidationError, propertyPath = '') => {
    if (err.constraints) {
      if (!formattedErrors[propertyPath]) {
        formattedErrors[propertyPath] = [];
      }
      formattedErrors[propertyPath].push(...Object.values(err.constraints));
    }

    if (err.children.length > 0) {
      err.children.forEach((child) => {
        const childPropertyPath = propertyPath
          ? `${propertyPath}.${child.property}`
          : `${child.property}`;
        handleNestedErrors(child, childPropertyPath);
      });
    }
  };

  errors.forEach((err) => handleNestedErrors(err, err.property));

  throw new CustomException('Validation error occurred', formattedErrors);
}
