import { z } from 'zod';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isURL from 'validator/lib/isURL';

export const businessValidationSchema = z.object({
  name: z
    .string()
    .min(2, 'Please provide a name.')
    .max(100, 'Name cannot exceed 100 characters.'),
  type: z.string().max(100, 'Type cannot exceed 100 characters.').optional(),
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
    .optional()
    .or(z.literal('')),
});
