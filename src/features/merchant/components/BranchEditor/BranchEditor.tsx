'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Hash, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { ComboboxField, SelectField, TextField } from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CITIES } from '@/features/business/options';
import { formatTimeOfDay } from '@/lib/format';
import { useDeleteBranch, useSaveBranch } from '../../hooks';
import { TIME_SLOTS } from '../../options';
import { branchFormSchema, type BranchFormValues } from '../../schemas';
import type { StoreBranch } from '../../types';
import styles from './BranchEditor.module.css';

const BLANK: BranchFormValues = { name: '', city: '', address: '', opensAt: '', closesAt: '' };

function hoursOf(branch: StoreBranch): string {
  if (!branch.opensAt || !branch.closesAt) return 'Hours not set';
  return `${formatTimeOfDay(branch.opensAt)} to ${formatTimeOfDay(branch.closesAt)}`;
}

type BranchDialogProps = {
  branch: StoreBranch | null;
  onClose: () => void;
};

function BranchDialog({ branch, onClose }: BranchDialogProps) {
  const save = useSaveBranch();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: branch
      ? {
          name: branch.name,
          city: branch.city,
          address: branch.address,
          opensAt: branch.opensAt,
          closesAt: branch.closesAt,
        }
      : BLANK,
  });

  const onSubmit = handleSubmit((values) => {
    save.mutate({ id: branch?.id, values }, { onSuccess: onClose });
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <DialogTitle className={styles.title}>{branch ? 'Edit branch' : 'Add a branch'}</DialogTitle>
      <DialogDescription className={styles.sub}>Students see this on your deals.</DialogDescription>

      <div className={styles.pair}>
        <TextField
          label="Branch name"
          placeholder="Gulberg III"
          icon={Hash}
          error={errors.name?.message}
          id="branch-name"
          {...register('name')}
        />
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <ComboboxField
              label="City"
              placeholder="Choose a city"
              searchPlaceholder="Search cities"
              emptyText="No city found."
              icon={MapPin}
              options={CITIES}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={errors.city?.message}
            />
          )}
        />
      </div>

      <TextField
        label="Street address"
        placeholder="12 Main Boulevard, opposite Liberty Market"
        icon={MapPin}
        error={errors.address?.message}
        id="branch-address"
        {...register('address')}
      />

      <div className={styles.pair}>
        <Controller
          control={control}
          name="opensAt"
          render={({ field }) => (
            <SelectField
              label="Opens at"
              placeholder="Choose a time"
              icon={Clock}
              options={TIME_SLOTS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={errors.opensAt?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="closesAt"
          render={({ field }) => (
            <SelectField
              label="Closes at"
              placeholder="Choose a time"
              icon={Clock}
              options={TIME_SLOTS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
              error={errors.closesAt?.message}
            />
          )}
        />
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={save.isPending}>
          {save.isPending ? 'Saving…' : branch ? 'Save branch' : 'Add branch'}
        </Button>
      </div>
    </form>
  );
}

type RemoveDialogProps = {
  branch: StoreBranch;
  onClose: () => void;
};

function RemoveDialog({ branch, onClose }: RemoveDialogProps) {
  const remove = useDeleteBranch();

  return (
    <div className={styles.form}>
      <DialogTitle className={styles.title}>Remove {branch.name}?</DialogTitle>
      <DialogDescription className={styles.sub}>
        Students can no longer claim deals at this branch.
      </DialogDescription>
      <div className={styles.actions}>
        <Button variant="ghost" size="lg" onClick={onClose}>
          Keep branch
        </Button>
        <Button
          size="lg"
          loading={remove.isPending}
          onClick={() => remove.mutate(branch.id, { onSettled: onClose })}
        >
          Remove branch
        </Button>
      </div>
    </div>
  );
}

type Editing = { kind: 'add' } | { kind: 'edit' | 'remove'; branch: StoreBranch } | null;

export function BranchEditor({ branches }: { branches: StoreBranch[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);

  return (
    <div className={styles.editor}>
      {branches.length === 0 ? (
        <p className={styles.empty}>Add a branch so students can claim your deals.</p>
      ) : (
        <ul className={styles.list}>
          {branches.map((branch) => (
            <li key={branch.id}>
              <div className={styles.text}>
                <strong>{branch.name}</strong>
                <span>
                  {branch.address}
                  {branch.city && `, ${branch.city}`}
                </span>
                <span className={styles.hours}>
                  <Icon icon={Clock} size={13} />
                  {hoursOf(branch)}
                </span>
              </div>
              <StatusBadge tone={branch.isOpen ? 'success' : 'neutral'}>
                {branch.isOpen ? 'Open' : 'Closed'}
              </StatusBadge>
              <div className={styles.tools}>
                <button
                  type="button"
                  aria-label={`Edit ${branch.name}`}
                  onClick={() => setEditing({ kind: 'edit', branch })}
                >
                  <Icon icon={Pencil} size={16} />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${branch.name}`}
                  onClick={() => setEditing({ kind: 'remove', branch })}
                >
                  <Icon icon={Trash2} size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button variant="ghost" onClick={() => setEditing({ kind: 'add' })}>
          <Icon icon={Plus} size={16} />
          Add a branch
        </Button>
      </div>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className={styles.dialog}>
          {editing?.kind === 'remove' ? (
            <RemoveDialog branch={editing.branch} onClose={close} />
          ) : (
            editing && (
              <BranchDialog
                branch={editing.kind === 'edit' ? editing.branch : null}
                onClose={close}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
