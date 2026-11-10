'use client';

import { Mail, User } from 'lucide-react';
import { FormField, PhoneField, TextField } from '@/components/ui/form';
import fields from '../stepFields.module.css';

export function ContactStep() {
  return (
    <>
      <FormField
        name="ownerName"
        render={(field) => (
          <TextField
            {...field}
            label="Full name"
            placeholder="Sana Malik"
            icon={User}
            autoComplete="name"
          />
        )}
      />

      <div className={fields.pair}>
        <FormField
          name="email"
          render={(field) => (
            <TextField
              {...field}
              label="Work email"
              type="email"
              placeholder="sana@crustandco.pk"
              icon={Mail}
              autoComplete="email"
              hint="You'll sign in with this."
            />
          )}
        />
        <FormField
          name="phone"
          render={(field) => <PhoneField {...field} label="Mobile number" />}
        />
      </div>
    </>
  );
}
