import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FieldGallery } from '@/features/dev/FieldGallery';
import { DEV_TOOLS_ENABLED } from '@/lib/api/config';

export const metadata: Metadata = { title: 'Field system', robots: { index: false } };

export default function FieldsPage() {
  if (!DEV_TOOLS_ENABLED) notFound();
  return <FieldGallery />;
}
