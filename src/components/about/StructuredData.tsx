export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://vibelux.ai/#organization",
        "name": "VibeLux",
        "url": "https://vibelux.ai",
        "logo": {
          "@type": "ImageObject",
          "url": "https://vibelux.ai/vibelux-logo.png",
          "width": 512,
          "height": 512
        },
        "description": "VibeLux is the leading horticultural lighting design platform, empowering growers with professional-grade tools for optimal plant growth.",
        "founder": {
          "@type": "Person",
          "name": "Blake Lange",
          "jobTitle": "Founder & CEO",
          "url": "https://www.linkedin.com/in/blakelange/",
          "sameAs": [
            "https://www.linkedin.com/in/blakelange/",
            "https://www.youtube.com/@hortlightguy",
            "https://www.instagram.com/hortlightguy"
          ]
        },
        "foundingDate": "2019",
        "sameAs": [
          "https://www.linkedin.com/company/vibelux",
          "https://www.youtube.com/@vibelux",
          "https://twitter.com/vibelux"
        ]
      },
      {
        "@type": "Person",
        "@id": "https://vibelux.ai/about#blake-lange",
        "name": "Blake Lange",
        "jobTitle": "Founder & CEO of VibeLux",
        "description": "Recognized leader in controlled environment agriculture and horticultural lighting technology",
        "image": "https://vibelux.ai/founder/blake-profile.webp",
        "url": "https://vibelux.ai/about",
        "sameAs": [
          "https://www.linkedin.com/in/blakelange/",
          "https://www.youtube.com/@hortlightguy",
          "https://www.instagram.com/hortlightguy"
        ],
        "worksFor": {
          "@id": "https://vibelux.ai/#organization"
        },
        "award": [
          "Greenhouse Product News 40 Under 40",
          "Global CEA Consortium Sustainability Committee Member",
          "Resource Innovation Institute CEA Leadership Committee"
        ],
        "alumniOf": {
          "@type": "CollegeOrUniversity",
          "name": "University of Arizona"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "VibeLux Platform",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free tier available with professional plans starting at $99/month"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "500"
        }
      },
      {
        "@type": "AboutPage",
        "@id": "https://vibelux.ai/about",
        "url": "https://vibelux.ai/about",
        "name": "About VibeLux - Leading Horticultural Lighting Design Platform",
        "description": "Learn about VibeLux and founder Blake Lange's mission to revolutionize controlled environment agriculture through intelligent lighting design.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://vibelux.ai"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About",
              "item": "https://vibelux.ai/about"
            }
          ]
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}