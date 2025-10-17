import dynamicImport from 'next/dynamic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DocsClient = dynamicImport(
  () => import('./DocsClient'),
  { ssr: false }
);

export default function Page() {
  return <DocsClient />;
}