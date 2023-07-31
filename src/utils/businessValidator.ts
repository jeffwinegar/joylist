import { z } from 'zod';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isURL from 'validator/lib/isURL';

const phoneRegex = new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/);

export const businessValidationSchema = z.object({
  name: z
    .string()
    .min(2, 'Please provide a name.')
    .max(100, 'Name cannot exceed 100 characters.'),
  url: z
    .string()
    .refine(
      (val) => isURL(val, { require_protocol: true }),
      'Please provide a valid website address.'
    ),
  phone: z
    .string()
    .refine(
      (val) => isMobilePhone(val, 'en-US'),
      'Please provide a valid phone number.'
    )
    .optional(),
});
