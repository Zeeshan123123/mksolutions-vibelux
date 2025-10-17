import dynamicImport from 'next/dynamic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MultiSiteMapDemo = dynamicImport(
  () => import('./MultiSiteMapDemo'),
  { ssr: false }
);

export default function Page() {
  return <MultiSiteMapDemo />;
}