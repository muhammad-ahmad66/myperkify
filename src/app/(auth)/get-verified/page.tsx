import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { SignupFlow } from '@/features/verification/components/SignupFlow';
import { getUniversities } from '@/features/verification/server';
import { queryKeys } from '@/lib/query/keys';

export const metadata: Metadata = {
  title: 'Get verified',
  description:
    'Create a free MyPerkify account and verify with your university email or student card.',
};

type GetVerifiedPageProps = { searchParams: Promise<{ method?: string }> };

export default async function GetVerifiedPage({ searchParams }: GetVerifiedPageProps) {
  const { method } = await searchParams;

  // Loaded here so the form works from the first keystroke. The university list drives the
  // auto-match from the email address, which must not lose a race with a fast typist.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.verification.universities(),
    queryFn: getUniversities,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SignupFlow startWithCard={method === 'card'} />
    </HydrationBoundary>
  );
}
