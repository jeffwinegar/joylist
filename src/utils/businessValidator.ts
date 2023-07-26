import { z } from 'zod';

const phoneRegex = new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/);

export const businessValidationSchema = z.object({
  name: z.string().min(2).max(280),
  url: z.string().url(),
  phone: z.string().regex(phoneRegex, 'Invalid Phone Number'),
});
