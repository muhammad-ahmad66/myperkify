'use client';

import { Hash, MapPin, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { ComboboxField, FormError, FormField, TextField } from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { CITIES } from '../../options';
import { BLANK_BRANCH, type ApplicationValues } from '../../schemas';
import fields from '../stepFields.module.css';
import styles from './BranchesStep.module.css';

export function BranchesStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ApplicationValues>();
  const branches = useFieldArray({ control, name: 'branches' });

  return (
    <>
      {branches.fields.map((branch, index) => (
        <section key={branch.id} className={styles.card} aria-label={`Branch ${index + 1}`}>
          <header>
            <span className={styles.number}>{index + 1}</span>
            <h3>Branch {index + 1}</h3>
            {branches.fields.length > 1 && (
              <button
                type="button"
                aria-label={`Remove branch ${index + 1}`}
                onClick={() => branches.remove(index)}
              >
                <Icon icon={Trash2} size={16} />
              </button>
            )}
          </header>

          <div className={fields.pair}>
            <FormField
              name={`branches.${index}.name`}
              render={(field) => (
                <TextField {...field} label="Branch name" placeholder="Gulberg III" icon={Hash} />
              )}
            />
            <FormField
              name={`branches.${index}.city`}
              render={(field) => (
                <ComboboxField
                  {...field}
                  label="City"
                  placeholder="Choose a city"
                  searchPlaceholder="Search cities"
                  emptyText="No city found."
                  icon={MapPin}
                  options={CITIES}
                />
              )}
            />
          </div>

          <FormField
            name={`branches.${index}.address`}
            render={(field) => (
              <TextField
                {...field}
                label="Street address"
                placeholder="12 Main Boulevard, opposite Liberty Market"
                icon={MapPin}
              />
            )}
          />
        </section>
      ))}

      <FormError>{errors.branches?.message ?? errors.branches?.root?.message}</FormError>

      <Button variant="ghost" size="lg" block onClick={() => branches.append(BLANK_BRANCH)}>
        <Icon icon={Plus} size={16} />
        Add another branch
      </Button>
    </>
  );
}
