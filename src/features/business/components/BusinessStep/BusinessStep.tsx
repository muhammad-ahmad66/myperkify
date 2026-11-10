'use client';

import { LayoutGrid, Store } from 'lucide-react';
import { ChoiceCards, FormField, SelectField, TextField } from '@/components/ui/form';
import { useCategories } from '@/features/deals/hooks';
import { REDEMPTION_OPTIONS } from '../../options';
import fields from '../stepFields.module.css';

export function BusinessStep() {
  const { data: categories = [] } = useCategories();
  const categoryOptions = categories
    .filter((category) => category.id !== 'all')
    .map((category) => ({ value: category.id, label: category.label }));

  return (
    <>
      <div className={fields.pair}>
        <FormField
          name="tradingName"
          render={(field) => (
            <TextField {...field} label="Business name" placeholder="Crust & Co." icon={Store} />
          )}
        />
        <FormField
          name="categoryId"
          render={(field) => (
            <SelectField
              {...field}
              label="Category"
              placeholder="Choose a category"
              icon={LayoutGrid}
              options={categoryOptions}
            />
          )}
        />
      </div>

      <FormField
        name="redemption"
        render={({ value, onChange, onBlur, error, ref }) => (
          <ChoiceCards
            label="How do students buy from you?"
            columns={3}
            options={REDEMPTION_OPTIONS}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            ref={ref}
          />
        )}
      />
    </>
  );
}
