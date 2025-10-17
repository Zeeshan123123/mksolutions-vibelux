import dynamicImport from 'next/dynamic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ZeroCostAPIDemo = dynamicImport(
  () => import('./ZeroCostAPIDemo'),
  { ssr: false }
);

export default function Page() {
  return <ZeroCostAPIDemo />;
}