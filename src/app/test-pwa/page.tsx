import dynamicImport from 'next/dynamic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TestPWAClient = dynamicImport(
  () => import('./TestPWAClient'),
  { ssr: false }
);

export default function Page() {
  return <TestPWAClient />;
}