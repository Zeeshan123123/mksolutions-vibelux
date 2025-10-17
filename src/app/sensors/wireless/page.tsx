import dynamicImport from 'next/dynamic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WirelessClient = dynamicImport(
  () => import('./WirelessClient'),
  { ssr: false }
);

export default function Page() {
  return <WirelessClient />;
}