import type { FieldPath } from 'react-hook-form';
import type { ApplicationValues } from '../../schemas';

export type StepId = 'business' | 'branches' | 'contact' | 'proof';

export type RegisterStep = {
  id: StepId;
  title: string;
  summary: string;
  heading: string;
  sub: string;
  fields: FieldPath<ApplicationValues>[];
};

export const ALL_STEPS: RegisterStep[] = [
  {
    id: 'business',
    title: 'Your business',
    summary: 'Name and category',
    heading: 'Tell us about your business',
    sub: 'You can add your description once you are approved.',
    fields: ['tradingName', 'categoryId', 'redemption'],
  },
  {
    id: 'branches',
    title: 'Branches',
    summary: 'Where students can claim',
    heading: 'Where can students find you?',
    sub: 'Add each location. Cashiers approve claims branch by branch.',
    fields: ['branches'],
  },
  {
    id: 'contact',
    title: 'Contact',
    summary: 'Who we should talk to',
    heading: 'Who should we talk to?',
    sub: 'This person signs in to your dashboard.',
    fields: ['ownerName', 'email', 'phone'],
  },
  {
    id: 'proof',
    title: 'Proof and send',
    summary: 'One document',
    heading: 'Show us your business is real',
    sub: 'One document is enough. We never ask for a CNIC.',
    fields: ['proof', 'acceptedCommission', 'acceptedTerms'],
  },
];

/** An online-only shop has no branches to list. */
export function stepsFor(redemption: ApplicationValues['redemption']): RegisterStep[] {
  return redemption === 'online' ? ALL_STEPS.filter((step) => step.id !== 'branches') : ALL_STEPS;
}
