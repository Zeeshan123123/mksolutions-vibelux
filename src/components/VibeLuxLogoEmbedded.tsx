import Image from 'next/image';
import Link from 'next/link';

// Base64 encoded logo - this is a placeholder
// Replace with actual logo data
const VIBELUX_LOGO_DATA = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjAwIDYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDwhLS0gVmliZUx1eCBMb2dvIC0tPgogIAogIDwhLS0gViBTaGFwZSAtLT4KICA8Zz4KICAgIDwhLS0gTGVmdCBwYXJ0IG9mIFYgKHB1cnBsZSkgLS0+CiAgICA8cGF0aCBkPSJNIDUsMTAgTCAxNSwxMCBMIDI1LDM1IEwgMjAsNDAgWiIgZmlsbD0iIzhCNUNGNiIgLz4KICAgIAogICAgPCEtLSBSaWdodCBwYXJ0IG9mIFYgKHRlYWwpIC0tPgogICAgPHBhdGggZD0iTSAyNSwzNSBMIDM1LDEwIEwgNDUsMTAgTCAzMCw0MCBaIiBmaWxsPSIjMTRCOEE2IiAvPgogIDwvZz4KICAKICA8IS0tICJpYmUiIHRleHQgLS0+CiAgPGcgZmlsbD0iIzhCNUNGNiI+CiAgICA8IS0tIGkgLS0+CiAgICA8Y2lyY2xlIGN4PSI1NSIgY3k9IjE4IiByPSIzIiAvPgogICAgPHJlY3QgeD0iNTIiIHk9IjI0IiB3aWR0aD0iNiIgaGVpZ2h0PSIxNiIgLz4KICAgIAogICAgPCEtLSBiIC0tPgogICAgPHJlY3QgeD0iNjQiIHk9IjEwIiB3aWR0aD0iNiIgaGVpZ2h0PSIzMCIgLz4KICAgIDxjaXJjbGUgY3g9IjczIiBjeT0iMzIiIHI9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhCNUNGNiIgc3Ryb2tlLXdpZHRoPSI2Ii8+CiAgICA8cmVjdCB4PSI3MCIgeT0iMjkiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIGZpbGw9IndoaXRlIi8+CiAgICAKICAgIDwhLS0gZSAtLT4KICAgIDxwYXRoIGQ9Ik0gODYsMjQgTCA5OCwyNCBMIDk4LDI3IEwgOTIsMjcgTCA5MiwzMSBMIDk3LDMxIEwgOTcsMzQgTCA5MiwzNCBMIDkyLDM3IEwgOTgsMzcgTCA5OCw0MCBMIDg2LDQwIFoiIC8+CiAgPC9nPgogIAogIDwhLS0gIkx1eCIgdGV4dCAtLT4KICA8ZyBmaWxsPSIjMTRCOEE2Ij4KICAgIDwhLS0gTCAtLT4KICAgIDxyZWN0IHg9IjExMCIgeT0iMTAiIHdpZHRoPSI2IiBoZWlnaHQ9IjI3IiAvPgogICAgPHJlY3QgeD0iMTEwIiB5PSIzNCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjYiIC8+CiAgICAKICAgIDwhLS0gdSAtLT4KICAgIDxwYXRoIGQ9Ik0gMTMyLDI0IEwgMTMyLDM0IFEgMTMyLDQwIDEzOCw0MCBRIDE0NCw0MCAxNDQsMzQgTCAxNDQsMjQgTCAxMzgsMjQgTCAxMzgsMzQgTCAxMzgsMzQgTCAxMzgsMjQgTSAxNDQsMjQgTCAxNTAsMjQgTCAxNTAsMzQgUSAxNTAsNDYgMTM4LDQ2IFEgMTI2LDQ2IDEyNiwzNCBMIDEyNiwyNCBMIDEzMiwyNCIgLz4KICAgIAogICAgPCEtLSB4IC0tPgogICAgPHBhdGggZD0iTSAxNjAsMjQgTCAxNjcsMzIgTCAxNzQsMjQgTCAxNjgsMjQgTCAxNjcsMjYgTCAxNjYsMjQgWiBNIDE2MCw0MCBMIDE2NywzMiBMIDE3NCw0MCBMIDE2OCw0MCBMIDE2NywzOCBMIDE2Niw0MCBaIiAvPgogIDwvZz4KPC9zdmc+';

interface VibeLuxLogoEmbeddedProps {
  width?: number;
  height?: number;
  className?: string;
  linkToHome?: boolean;
}

export function VibeLuxLogoEmbedded({ 
  width = 200, 
  height = 60, 
  className = "h-10 w-auto",
  linkToHome = false 
}: VibeLuxLogoEmbeddedProps) {
  const logo = (
    <img
      src={VIBELUX_LOGO_DATA}
      alt="VibeLux"
      width={width}
      height={height}
      className={className}
    />
  );

  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center">
        {logo}
      </Link>
    );
  }

  return logo;
}