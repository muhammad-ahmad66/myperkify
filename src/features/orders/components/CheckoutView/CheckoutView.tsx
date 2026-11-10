'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, Building2, Landmark, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { ChoiceCards, FormError, PhoneField, TextField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { Wrap } from '@/components/ui/Wrap';
import { CartSummaryPanel } from '@/features/cart/components/CartSummaryPanel';
import { useCart } from '@/features/cart/hooks';
import { useViewer } from '@/features/session/hooks';
import { toApiError } from '@/lib/api/errors';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { usePlaceOrder } from '../../hooks';
import { checkoutSchema, type CheckoutValues } from '../../schemas';
import styles from './CheckoutView.module.css';

const PAYMENT_OPTIONS = [
  {
    value: 'cod',
    title: 'Cash on delivery',
    description: 'Pay the rider when it arrives',
    icon: Banknote,
  },
  {
    value: 'bank_transfer',
    title: 'Bank transfer',
    description: 'The shop sends you its details',
    icon: Landmark,
  },
];

export function CheckoutView() {
  const router = useRouter();
  const cart = useCart();
  const place = usePlaceOrder();
  const { viewer } = useViewer();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: viewer.kind === 'student' ? viewer.name : '',
      phone: '',
      address: '',
      city: '',
      paymentMethod: 'cod',
    },
  });

  const onSubmit = handleSubmit((values) => {
    place.mutate(values, {
      onSuccess: ({ orderId }) => router.push(ROUTES.orderConfirmed(orderId)),
    });
  });

  const serverError = place.error ? toApiError(place.error).message : undefined;

  return (
    <main className={styles.page}>
      <Wrap>
        <PageHeader title="Checkout" />
        <QueryState
          query={cart}
          label="your cart"
          isEmpty={(summary) => summary.itemCount === 0}
          empty={
            <>
              Your cart is empty. <Link href={ROUTES.deals}>Browse deals</Link>
            </>
          }
        >
          {(summary) => (
            <form className={styles.layout} onSubmit={onSubmit} noValidate>
              <div className={styles.fields}>
                <section>
                  <h2>Delivery details</h2>
                  <div className={styles.pair}>
                    <TextField
                      label="Full name"
                      placeholder="Ayesha Khan"
                      icon={User}
                      error={errors.fullName?.message}
                      id="checkout-name"
                      autoComplete="name"
                      {...register('fullName')}
                    />
                    <Controller
                      control={control}
                      name="phone"
                      render={({ field }) => (
                        <PhoneField
                          label="Phone"
                          id="checkout-phone"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          error={errors.phone?.message}
                        />
                      )}
                    />
                  </div>
                  <TextField
                    label="Address"
                    placeholder="Hostel 3, New Campus, Canal Road"
                    icon={MapPin}
                    error={errors.address?.message}
                    id="checkout-address"
                    autoComplete="street-address"
                    {...register('address')}
                  />
                  <TextField
                    label="City"
                    placeholder="Lahore"
                    icon={Building2}
                    error={errors.city?.message}
                    id="checkout-city"
                    autoComplete="address-level2"
                    {...register('city')}
                  />
                </section>

                <section>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <ChoiceCards
                        label="Payment"
                        options={PAYMENT_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    )}
                  />
                </section>
              </div>

              <CartSummaryPanel cart={summary}>
                <FormError>{serverError}</FormError>
                <Button type="submit" size="lg" block loading={place.isPending}>
                  {place.isPending
                    ? 'Placing your order…'
                    : `Place order · ${formatPKR(summary.total)}`}
                </Button>
              </CartSummaryPanel>
            </form>
          )}
        </QueryState>
      </Wrap>
    </main>
  );
}
