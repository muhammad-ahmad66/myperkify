'use client';

import { AlignLeft, Store } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { PhoneField, TextField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { useSaveStoreProfile, useStoreSettings } from '../../hooks';
import { storeProfileSchema } from '../../schemas';
import type { StoreSettings } from '../../types';
import { BranchEditor } from '../BranchEditor';
import { StaffEditor } from '../StaffEditor';
import styles from './StoreSettingsView.module.css';

function ProfileForm({ settings }: { settings: StoreSettings }) {
  const save = useSaveStoreProfile();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(storeProfileSchema),
    defaultValues: {
      name: settings.name,
      description: settings.description,
      phone: settings.phone,
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit((values) => save.mutate(values))}
      noValidate
    >
      <TextField
        label="Store name"
        placeholder="Crust & Co."
        icon={Store}
        error={errors.name?.message}
        id="store-name"
        {...register('name')}
      />
      <TextField
        label="Description"
        placeholder="Wood-fired pizzas in Gulberg"
        icon={AlignLeft}
        error={errors.description?.message}
        id="store-description"
        {...register('description')}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <PhoneField
            label="Phone"
            id="store-phone"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            error={errors.phone?.message}
          />
        )}
      />
      <div>
        <Button type="submit" loading={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </form>
  );
}

export function StoreSettingsView() {
  const query = useStoreSettings();

  return (
    <>
      <PageHeader title="Store settings" />
      <QueryState query={query} label="your settings">
        {(settings) => (
          <div className={styles.stack}>
            <section className={styles.section}>
              <h2>Profile</h2>
              <ProfileForm settings={settings} />
            </section>

            <section className={styles.section}>
              <h2>Branches</h2>
              <BranchEditor branches={settings.branches} />
            </section>

            <section className={styles.section}>
              <h2>Staff</h2>
              <StaffEditor staff={settings.staff} branches={settings.branches} />
            </section>
          </div>
        )}
      </QueryState>
    </>
  );
}
