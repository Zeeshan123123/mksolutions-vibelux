// Centralized route configuration for consistent navigation
export const routes = {
  // Main pages
  home: '/',
  features: '/features',
  pricing: '/pricing-simple',
  about: '/about',
  contact: '/contact',
  support: '/support',
  
  // Auth
  signIn: '/sign-in',
  signUp: '/sign-up',
  
  // Core features
  controlCenter: '/control-center',
  design: '/design',
  calculators: '/calculators',
  energyOptimization: '/energy-optimization',
  marketplace: '/marketplace',
  
  // Solutions
  solutions: {
    indoor: '/solutions/indoor',
    cannabis: '/solutions/cannabis',
    research: '/solutions/research',
    enterprise: '/solutions/enterprise',
  },
  
  // Resources
  resources: '/resources',
  gettingStarted: '/getting-started',
  documentation: '/docs',
  faq: '/faq',
  glossary: '/glossary',
  
  // Legal
  privacy: '/privacy',
  terms: '/terms',
  
  // Admin/Protected
  admin: '/admin',
  dashboard: '/dashboard',
  settings: '/settings',
  account: '/account',
};

// Navigation structure for menus
export const navigationStructure = {
  main: [
    {
      label: 'Products',
      items: [
        { label: 'Control Center', href: routes.controlCenter, description: 'Unified facility management platform' },
        { label: 'Design Studio', href: routes.design, description: '3D lighting design and planning tools' },
        { label: 'Calculators', href: routes.calculators, description: '25+ professional horticultural calculators' },
        { label: 'Energy Optimization', href: routes.energyOptimization, description: 'Reduce energy costs and carbon footprint' },
        { label: 'Marketplace', href: routes.marketplace, description: 'Equipment, services, and expertise' },
      ]
    },
    {
      label: 'Solutions',
      items: [
        { label: 'Indoor Farming', href: routes.solutions.indoor, description: 'Vertical farms and controlled environments' },
        { label: 'Cannabis Cultivation', href: routes.solutions.cannabis, description: 'Compliant commercial cannabis operations' },
        { label: 'Research Facilities', href: routes.solutions.research, description: 'Academic and R&D growth chambers' },
        { label: 'Enterprise', href: routes.solutions.enterprise, description: 'Multi-facility operations and franchises' },
      ]
    },
    {
      label: 'Resources',
      href: routes.resources,
      items: [
        { label: 'Getting Started', href: routes.gettingStarted },
        { label: 'Documentation', href: routes.documentation },
        { label: 'FAQ', href: routes.faq },
        { label: 'Glossary', href: routes.glossary },
      ]
    },
    { label: 'Pricing', href: routes.pricing },
  ],
  
  footer: {
    product: [
      { label: 'Features', href: routes.features },
      { label: 'Control Center', href: routes.controlCenter },
      { label: 'Design Studio', href: routes.design },
      { label: 'Calculators', href: routes.calculators },
      { label: 'Pricing', href: routes.pricing },
    ],
    company: [
      { label: 'About', href: routes.about },
      { label: 'Contact', href: routes.contact },
      { label: 'Careers', href: '/careers' },
      { label: 'Partners', href: '/partners' },
    ],
    resources: [
      { label: 'Documentation', href: routes.documentation },
      { label: 'Support', href: routes.support },
      { label: 'FAQ', href: routes.faq },
      { label: 'Glossary', href: routes.glossary },
    ],
    legal: [
      { label: 'Privacy Policy', href: routes.privacy },
      { label: 'Terms of Service', href: routes.terms },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
  
  // Protected routes that require authentication
  protected: [
    routes.controlCenter,
    routes.dashboard,
    routes.admin,
    routes.settings,
    routes.account,
    '/api/*',
  ],
  
  // Admin-only routes
  adminOnly: [
    routes.admin,
    '/api/admin/*',
  ],
};

// Helper to check if a route requires authentication
export function isProtectedRoute(pathname: string): boolean {
  return navigationStructure.protected.some(route => {
    if (route.includes('*')) {
      const prefix = route.replace('*', '');
      return pathname.startsWith(prefix);
    }
    return pathname === route;
  });
}

// Helper to check if a route is admin-only
export function isAdminRoute(pathname: string): boolean {
  return navigationStructure.adminOnly.some(route => {
    if (route.includes('*')) {
      const prefix = route.replace('*', '');
      return pathname.startsWith(prefix);
    }
    return pathname === route;
  });
}

// Breadcrumb generator
export function generateBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [
    { label: 'Home', href: '/' }
  ];
  
  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({ label, href: currentPath });
  });
  
  return breadcrumbs;
}