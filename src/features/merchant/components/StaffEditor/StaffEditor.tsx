'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, MapPin, Pencil, Plus, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { SelectField, TextField } from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toApiError } from '@/lib/api/errors';
import { useRemoveCashier, useSaveCashier } from '../../hooks';
import { cashierFormSchema, type CashierFormValues } from '../../schemas';
import type { StaffMember, StoreBranch } from '../../types';
import styles from '../settingsList.module.css';

type CashierDialogProps = {
  cashier: StaffMember | null;
  branches: StoreBranch[];
  onClose: () => void;
};

function CashierDialog({ cashier, branches, onClose }: CashierDialogProps) {
  const save = useSaveCashier();
  const branchOptions = branches.map((branch) => ({ value: branch.id, label: branch.name }));
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CashierFormValues>({
    resolver: zodResolver(cashierFormSchema),
    defaultValues: {
      name: cashier?.name ?? '',
      email: cashier?.email ?? '',
      branchId: cashier?.branchId ?? '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      { id: cashier?.id, values },
      {
        onSuccess: onClose,
        onError: (error) => {
          const message = toApiError(error).fields?.email;
          if (message) setError('email', { message });
        },
      },
    );
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <DialogTitle className={styles.title}>
        {cashier ? `Edit ${cashier.name}` : 'Add a cashier'}
      </DialogTitle>
      <DialogDescription className={styles.sub}>
        Cashiers only see claims at their branch.
      </DialogDescription>

      <TextField
        label="Full name"
        placeholder="Hamza Ali"
        icon={User}
        error={errors.name?.message}
        id="cashier-name"
        autoComplete="off"
        {...register('name')}
      />
      <TextField
        label="Email"
        type="email"
        placeholder="hamza@crustandco.pk"
        icon={Mail}
        hint={
          cashier
            ? "This is their sign-in, so it can't change."
            : 'They sign in with this email and a code.'
        }
        readOnly={Boolean(cashier)}
        error={errors.email?.message}
        id="cashier-email"
        autoComplete="off"
        {...register('email')}
      />
      <Controller
        control={control}
        name="branchId"
        render={({ field }) => (
          <SelectField
            label="Branch"
            placeholder="Choose a branch"
            icon={MapPin}
            options={branchOptions}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
            error={errors.branchId?.message}
          />
        )}
      />

      <div className={styles.actions}>
        <Button variant="ghost" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="lg" loading={save.isPending}>
          {save.isPending ? 'Saving…' : cashier ? 'Save changes' : 'Add cashier'}
        </Button>
      </div>
    </form>
  );
}

function RemoveDialog({ cashier, onClose }: { cashier: StaffMember; onClose: () => void }) {
  const remove = useRemoveCashier();

  return (
    <div className={styles.form}>
      <DialogTitle className={styles.title}>Remove {cashier.name}?</DialogTitle>
      <DialogDescription className={styles.sub}>
        They can no longer sign in or approve claims.
      </DialogDescription>
      <div className={styles.actions}>
        <Button variant="ghost" size="lg" onClick={onClose}>
          Keep cashier
        </Button>
        <Button
          size="lg"
          loading={remove.isPending}
          onClick={() => remove.mutate(cashier.id, { onSettled: onClose })}
        >
          Remove cashier
        </Button>
      </div>
    </div>
  );
}

type Editing = { kind: 'add' } | { kind: 'edit' | 'remove'; cashier: StaffMember } | null;

type StaffEditorProps = {
  staff: StaffMember[];
  branches: StoreBranch[];
};

export function StaffEditor({ staff, branches }: StaffEditorProps) {
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);
  const branchName = (id: string | null) => branches.find((branch) => branch.id === id)?.name;

  return (
    <div className={styles.editor}>
      <ul className={styles.list}>
        {staff.map((person) => {
          const isCashier = person.role === 'cashier';
          return (
            <li key={person.id}>
              <div className={styles.text}>
                <strong>{person.name}</strong>
                <span>{person.email}</span>
                {isCashier && (
                  <span className={styles.meta}>
                    <Icon icon={MapPin} size={13} />
                    {branchName(person.branchId) ?? 'No branch'}
                  </span>
                )}
              </div>
              <StatusBadge tone="neutral">{isCashier ? 'Cashier' : 'Owner'}</StatusBadge>
              {isCashier ? (
                <div className={styles.tools}>
                  <button
                    type="button"
                    aria-label={`Edit ${person.name}`}
                    onClick={() => setEditing({ kind: 'edit', cashier: person })}
                  >
                    <Icon icon={Pencil} size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${person.name}`}
                    onClick={() => setEditing({ kind: 'remove', cashier: person })}
                  >
                    <Icon icon={Trash2} size={16} />
                  </button>
                </div>
              ) : (
                <span className={styles.toolsGap} />
              )}
            </li>
          );
        })}
      </ul>

      {branches.length === 0 ? (
        <p className={styles.note}>Add a branch first. Every cashier works at one branch.</p>
      ) : (
        <div>
          <Button variant="ghost" onClick={() => setEditing({ kind: 'add' })}>
            <Icon icon={Plus} size={16} />
            Add a cashier
          </Button>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className={styles.dialog}>
          {editing?.kind === 'remove' ? (
            <RemoveDialog cashier={editing.cashier} onClose={close} />
          ) : (
            editing && (
              <CashierDialog
                cashier={editing.kind === 'edit' ? editing.cashier : null}
                branches={branches}
                onClose={close}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
