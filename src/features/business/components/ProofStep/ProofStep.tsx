'use client';

import Link from 'next/link';
import { CheckboxField, FileField, FormField } from '@/components/ui/form';
import { CARD_MAX_BYTES, SETTLEMENT_THRESHOLD } from '@/lib/constants';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

export function ProofStep() {
  return (
    <>
      <FormField<File | null>
        name="proof"
        render={({ value, onChange, error }) => (
          <FileField
            id="proof-document"
            label="Your document"
            title="Drop your document here, or browse"
            description="NTN certificate, shop licence or utility bill. PDF, JPG or PNG, up to 5 MB."
            accept={{
              'application/pdf': ['.pdf'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
            }}
            maxBytes={CARD_MAX_BYTES}
            value={value}
            onChange={onChange}
            error={error}
          />
        )}
      />

      <FormField<boolean>
        name="acceptedCommission"
        render={({ value, onChange, onBlur, error, ref }) => (
          <CheckboxField
            id="accept-commission"
            label={`I agree to pay 5% commission on completed orders, and to settle my balance when it reaches ${formatPKR(SETTLEMENT_THRESHOLD)}.`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            ref={ref}
          />
        )}
      />
      <FormField<boolean>
        name="acceptedTerms"
        render={({ value, onChange, onBlur, error, ref }) => (
          <CheckboxField
            id="accept-terms"
            label={
              <>
                I agree to the <Link href={ROUTES.terms}>Terms</Link> and{' '}
                <Link href={ROUTES.privacy}>Privacy policy</Link>.
              </>
            }
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
