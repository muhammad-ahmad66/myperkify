'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BadgePercent, LayoutGrid, Package, Store, Tag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import {
  ChoiceCards,
  FormError,
  NumberField,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/Icon';
import { OfferBadge } from '@/components/ui/OfferBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { Segmented } from '@/components/ui/Segmented';
import { CoverArt } from '@/features/deals/components/CoverArt';
import { useCategories } from '@/features/deals/hooks';
import { toApiError } from '@/lib/api/errors';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import type { DealValues } from '../../api';
import { useMerchantDeal, useSaveDeal } from '../../hooks';
import { dealFormSchema } from '../../schemas';
import type { MerchantDeal } from '../../types';
import styles from './DealForm.module.css';

const BLANK: DealValues = {
  type: 'in_store',
  title: '',
  description: '',
  categoryId: 'food',
  stampOffer: '',
  regularPrice: undefined as unknown as number,
  studentPrice: undefined as unknown as number,
  terms: '',
  status: 'draft',
};

const TYPE_OPTIONS = [
  {
    value: 'in_store',
    title: 'In-store deal',
    description: 'Students claim at your counter',
    icon: Store,
  },
  {
    value: 'online',
    title: 'Online product',
    description: 'You deliver to students',
    icon: Package,
  },
];

const STATUS_OPTIONS = [
  { value: 'draft' as const, label: 'Draft' },
  { value: 'live' as const, label: 'Live' },
  { value: 'ended' as const, label: 'Ended' },
];

function isPrice(value: number | undefined): value is number {
  return Number.isFinite(value) && (value ?? 0) > 0;
}

export function DealForm({ deal }: { deal?: MerchantDeal }) {
  const router = useRouter();
  const save = useSaveDeal();
  const { data: categories = [] } = useCategories();
  const categoryOptions = categories
    .filter((category) => category.id !== 'all')
    .map((category) => ({ value: category.id, label: category.label }));

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DealValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: deal ?? BLANK,
  });

  const title = useWatch({ control, name: 'title' });
  const offer = useWatch({ control, name: 'stampOffer' });
  const student = useWatch({ control, name: 'studentPrice' });
  const regular = useWatch({ control, name: 'regularPrice' });
  const saving = isPrice(regular) && isPrice(student) ? regular - student : 0;

  const onSubmit = handleSubmit((values) => {
    save.mutate(
      { id: deal?.id, values },
      {
        onSuccess: () => router.push(ROUTES.merchantDeals),
        onError: (error) => {
          const apiError = toApiError(error);
          const fields = Object.entries(apiError.fields ?? {});
          if (fields.length === 0) setError('root', { message: apiError.message });
          fields.forEach(([field, message]) => setError(field as keyof DealValues, { message }));
        },
      },
    );
  });

  return (
    <>
      <Link href={ROUTES.merchantDeals} className={styles.back}>
        <Icon icon={ArrowLeft} size={15} />
        Deals and products
      </Link>
      <PageHeader title={deal ? 'Edit item' : 'New item'} />
      <div className={styles.layout}>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {!deal && (
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <ChoiceCards
                  label="What are you adding?"
                  options={TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
          )}

          <TextField
            label="Title"
            placeholder="Large pizzas, Monday to Thursday"
            icon={Tag}
            error={errors.title?.message}
            id="deal-title"
            {...register('title')}
          />

          <TextAreaField
            label="Description"
            placeholder="Wood-fired pizzas, for dine-in or takeaway."
            error={errors.description?.message}
            id="deal-description"
            rows={3}
            {...register('description')}
          />

          <div className={styles.pair}>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <SelectField
                  label="Category"
                  placeholder="Choose a category"
                  icon={LayoutGrid}
                  options={categoryOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={errors.categoryId?.message}
                />
              )}
            />
            <TextField
              label="Offer"
              icon={BadgePercent}
              error={errors.stampOffer?.message}
              id="deal-offer"
              placeholder="25%"
              {...register('stampOffer')}
            />
          </div>

          <div className={styles.pair}>
            <Controller
              control={control}
              name="regularPrice"
              render={({ field }) => (
                <NumberField
                  label="Regular price"
                  prefix="PKR"
                  placeholder="2,400"
                  value={field.value || undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={errors.regularPrice?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="studentPrice"
              render={({ field }) => (
                <NumberField
                  label="Student price"
                  prefix="PKR"
                  placeholder="1,800"
                  hint={saving > 0 ? `Students save ${formatPKR(saving)}` : undefined}
                  value={field.value || undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={errors.studentPrice?.message}
                />
              )}
            />
          </div>

          <TextAreaField
            label="Terms"
            optional
            placeholder="One claim per student per day. Not on public holidays."
            id="deal-terms"
            rows={2}
            {...register('terms')}
          />

          <div className={styles.footer}>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Segmented
                  label="Status"
                  value={field.value}
                  options={STATUS_OPTIONS}
                  onChange={field.onChange}
                />
              )}
            />
            <Button type="submit" size="lg" loading={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save item'}
            </Button>
          </div>
          <FormError>{errors.root?.message}</FormError>
        </form>

        <aside className={styles.preview} aria-label="Preview">
          <p>How students see it</p>
          <div className={styles.card}>
            <div className={styles.cover}>
              {deal?.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- a small local preview
                <img src={deal.image} alt="" />
              ) : (
                <CoverArt color="#A020F0" seed={3} />
              )}
              {offer && (
                <span className={styles.offer}>
                  <OfferBadge offer={offer} label="off" />
                </span>
              )}
            </div>
            <div className={styles.cardBody}>
              <strong>{title || 'Your deal title'}</strong>
              <div>
                <b>{isPrice(student) ? formatPKR(student) : 'PKR 0'}</b>
                {isPrice(regular) && <s>{formatPKR(regular)}</s>}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export function DealFormLoader({ id }: { id: string }) {
  const query = useMerchantDeal(id);
  return (
    <QueryState query={query} label="this deal">
      {(deal) => <DealForm key={deal.id} deal={deal} />}
    </QueryState>
  );
}
