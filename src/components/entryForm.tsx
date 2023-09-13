import { zodResolver } from '@hookform/resolvers/zod';
import { Close as DialogClose } from '@radix-ui/react-dialog';
import type { Dispatch, SetStateAction } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { z } from 'zod';
import { api, type RouterOutputs } from '~/utils/api';
import { businessValidationSchema } from '~/utils/businessValidator';
import styles from './entryForm.module.css';

type FormSchema = z.infer<typeof businessValidationSchema>;
type Business = RouterOutputs['businesses']['getBusinessById'];

export const AddEntryForm = ({
  setOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const ctx = api.useContext();

  const { mutate } = api.businesses.create.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast.success('Business added!', {
        id: 'addBusiness',
      });
      void ctx.businesses.getBusinessesByUserId.invalidate();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(businessValidationSchema),
  });
  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    mutate(data);
    reset();
  };

  return (
    <form className={styles['form']} onSubmit={handleSubmit(onSubmit)}>
      <fieldset className={styles['form-item']}>
        <label htmlFor="businessName">Business Name</label>
        <input
          aria-invalid={errors.name ? 'true' : 'false'}
          id="businessName"
          type="text"
          {...register('name')}
        />
        {!!errors.name && <p role="alert">{errors.name.message}</p>}
      </fieldset>

      <fieldset className={styles['form-item']}>
        <label htmlFor="businessType">
          Business Type <span>(Optional)</span>
        </label>
        <input
          aria-invalid={errors.type ? 'true' : 'false'}
          id="businessType"
          type="text"
          {...register('type')}
        />
        {!!errors.type && <p role="alert">{errors.type.message}</p>}
      </fieldset>

      <fieldset className={styles['form-item']}>
        <label htmlFor="businessWebsite">Website</label>
        <input
          aria-invalid={errors.url ? 'true' : 'false'}
          id="businessWebsite"
          placeholder="e.g. https://www.joylist.guide"
          type="text"
          {...register('url')}
        />
        {!!errors.url && <p role="alert">{errors.url.message}</p>}
      </fieldset>

      <fieldset className={styles['form-item']}>
        <label htmlFor="businessPhone">
          Phone <span>(Optional)</span>
        </label>
        <input
          aria-invalid={errors.phone ? 'true' : 'false'}
          id="businessPhone"
          placeholder="e.g. (555) 555-1234"
          type="text"
          {...register('phone')}
        />
        {!!errors.phone && <p role="alert">{errors.phone.message}</p>}
      </fieldset>

      <button type="submit">Add Business</button>
      <DialogClose asChild>
        <button type="reset" onClick={() => reset()}>
          Cancel
        </button>
      </DialogClose>
    </form>
  );
};

export const UpdateEntryForm = ({
  business,
  setOpen,
}: {
  business: Business;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const ctx = api.useContext();

  const { mutate } = api.businesses.update.useMutation({
    onSuccess: () => {
      setOpen(false);
      toast.success('Business updated!', {
        id: 'updateBusiness',
      });
      void ctx.businesses.getBusinessesByUserId.invalidate();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(businessValidationSchema),
  });
  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    mutate({ id: business.id, ...data });
    reset();
  };

  return (
    <form className={styles['form']} onSubmit={handleSubmit(onSubmit)}>
      <fieldset className={styles['form-item']}>
        <label htmlFor="businessName">Business Name</label>
        <input
          aria-invalid={errors.name ? 'true' : 'false'}
          defaultValue={business.name || ''}
          id="businessName"
          type="text"
          {...register('name')}
        />
        {!!errors.name && <p role="alert">{errors.name.message}</p>}
      </fieldset>

      <fieldset className={styles['form-item']}>
        <label htmlFor="businessType">
          Business Type <span>(Optional)</span>
        </label>
        <input
          aria-invalid={errors.type ? 'true' : 'false'}
          defaultValue={business.type || ''}
          id="businessType"
          type="text"
          {...register('type')}
        />
        {!!errors.type && <p role="alert">{errors.type.message}</p>}
      </fieldset>

      <fieldset className={styles['form-item']}>
        <label htmlFor="businessWebsite">Website</label>
        <input
          aria-invalid={errors.url ? 'true' : 'false'}
          defaultValue={business.url || ''}
          id="businessWebsite"
          placeholder="e.g. https://www.joylist.guide"
          type="text"
          {...register('url')}
        />
        {!!errors.url && <p role="alert">{errors.url.message}</p>}
      </fieldset>

      <fieldset className={styles['form-item']}>
        <label htmlFor="businessPhone">
          Phone <span>(Optional)</span>
        </label>
        <input
          aria-invalid={errors.phone ? 'true' : 'false'}
          defaultValue={business.phone || ''}
          id="businessPhone"
          placeholder="e.g. (555) 555-1234"
          type="text"
          {...register('phone')}
        />
        {!!errors.phone && <p role="alert">{errors.phone.message}</p>}
      </fieldset>

      <button disabled={!isDirty} type="submit">
        Save changes
      </button>
      <DialogClose asChild>
        <button type="reset" onClick={() => reset()}>
          Cancel
        </button>
      </DialogClose>
    </form>
  );
};
