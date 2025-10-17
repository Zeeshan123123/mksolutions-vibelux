'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, MapPin, Phone, Mail, Globe, Clock,
  Shield, Award, TrendingUp, Calendar, Users, Briefcase,
  CheckCircle, MessageSquare, ExternalLink, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  services: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  certifications: string[];
  hourlyRate?: number;
  projectRate?: string;
  location: {
    city: string;
    state: string;
    serviceRadius: number;
  };
  availability: 'immediate' | 'scheduled' | 'busy';
  specialties: string[];
  yearsExperience: number;
  completedProjects: number;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  description: string;
  portfolio?: string[];
}

const SERVICE_CATEGORIES = [
  { id: 'consulting', name: 'Consulting', icon: Briefcase },
  { id: 'installation', name: 'Installation', icon: Users },
  { id: 'maintenance', name: 'Maintenance', icon: Clock },
  { id: 'design', name: 'Design & Engineering', icon: TrendingUp },
  { id: 'electrical', name: 'Electrical', icon: Shield },
  { id: 'hvac', name: 'HVAC', icon: Award },
  { id: 'automation', name: 'Automation', icon: Globe },
  { id: 'certification', name: 'Certification', icon: CheckCircle }
];

export function ServiceDirectory() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    // Load mock providers - in production, fetch from API
    const mockProviders: ServiceProvider[] = [
      {
        id: '1',
        name: 'GrowTech Solutions',
        category: 'consulting',
        services: ['Facility Design', 'Lighting Optimization', 'ROI Analysis'],
        rating: 4.9,
        reviews: 127,
        verified: true,
        certifications: ['NCCEA Certified', 'Fluence Design Partner', 'DLC Qualified'],
        hourlyRate: 250,
        location: {
          city: 'Denver',
          state: 'CO',
          serviceRadius: 500
        },
        availability: 'immediate',
        specialties: ['Cannabis', 'Vertical Farming', 'Greenhouse Retrofit'],
        yearsExperience: 12,
        completedProjects: 450,
        contact: {
          phone: '(303) 555-0100',
          email: 'contact@growtechsolutions.com',
          website: 'https://growtechsolutions.com'
        },
        description: 'Leading horticultural lighting consultants specializing in commercial cannabis and vertical farming operations. We provide end-to-end facility design and optimization services.'
      },
      {
        id: '2',
        name: 'Elite Electrical Services',
        category: 'electrical',
        services: ['Panel Upgrades', '480V Installation', 'Emergency Service'],
        rating: 4.8,
        reviews: 89,
        verified: true,
        certifications: ['Master Electrician', 'OSHA Certified'],
        hourlyRate: 125,
        location: {
          city: 'Portland',
          state: 'OR',
          serviceRadius: 100
        },
        availability: 'scheduled',
        specialties: ['Grow Facilities', 'High Voltage', 'Code Compliance'],
        yearsExperience: 15,
        completedProjects: 320,
        contact: {
          phone: '(503) 555-0200',
          email: 'info@eliteelectrical.com'
        },
        description: 'Commercial electrical contractor specializing in cultivation facilities. Expert in high-voltage systems and energy-efficient lighting installations.'
      },
      {
        id: '3',
        name: 'Climate Control Experts',
        category: 'hvac',
        services: ['System Design', 'Installation', 'Maintenance Contracts'],
        rating: 4.7,
        reviews: 156,
        verified: true,
        certifications: ['NATE Certified', 'EPA Universal'],
        projectRate: '$15,000 - $150,000',
        location: {
          city: 'Sacramento',
          state: 'CA',
          serviceRadius: 200
        },
        availability: 'scheduled',
        specialties: ['Sealed Environments', 'Dehumidification', 'CO2 Systems'],
        yearsExperience: 20,
        completedProjects: 580,
        contact: {
          phone: '(916) 555-0300',
          email: 'sales@climatecontrolexperts.com',
          website: 'https://climatecontrolexperts.com'
        },
        description: 'HVAC specialists for controlled environment agriculture. We design and install complete climate control systems for optimal plant growth.'
      }
    ];

    setProviders(mockProviders);
    setFilteredProviders(mockProviders);
  }, []);

  useEffect(() => {
    let filtered = [...providers];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case 'experience':
          return b.yearsExperience - a.yearsExperience;
        default:
          return 0;
      }
    });

    setFilteredProviders(filtered);
  }, [providers, selectedCategory, searchQuery, sortBy]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'immediate': return 'text-green-400';
      case 'scheduled': return 'text-yellow-400';
      case 'busy': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Service Provider Directory</h1>
          <p className="text-gray-400">Connect with verified professionals for your cultivation facility</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 rounded-lg p-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search services, providers, or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700"
              />
            </div>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="experience">Most Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Services
            </Button>
            {SERVICE_CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                <cat.icon className="w-4 h-4 mr-1" />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-400">
          Found {filteredProviders.length} service providers
        </div>

        {/* Provider Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map(provider => (
            <Card key={provider.id} className="bg-gray-900 border-gray-800 hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => setSelectedProvider(provider)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {provider.name}
                      {provider.verified && (
                        <Badge variant="default" className="bg-blue-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm">{provider.rating}</span>
                        <span className="text-gray-500 text-sm ml-1">({provider.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getAvailabilityColor(provider.availability)}>
                    {provider.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Location */}
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  {provider.location.city}, {provider.location.state}
                  <span className="ml-2">• {provider.location.serviceRadius} mi radius</span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-1">
                  {provider.services.slice(0, 3).map(service => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {provider.services.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{provider.services.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Experience:</span>
                    <span className="ml-1 font-semibold">{provider.yearsExperience} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Projects:</span>
                    <span className="ml-1 font-semibold">{provider.completedProjects}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="text-sm">
                  <span className="text-gray-500">Rate:</span>
                  <span className="ml-1 font-semibold text-green-400">
                    {provider.hourlyRate ? `$${provider.hourlyRate}/hr` : provider.projectRate}
                  </span>
                </div>

                {/* CTA */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Provider Detail Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
               onClick={() => setSelectedProvider(null)}>
            <Card className="bg-gray-900 border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedProvider.name}</CardTitle>
                    <p className="text-gray-400 mt-2">{selectedProvider.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedProvider(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Info */}
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedProvider.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedProvider.contact.email}</span>
                  </div>
                  {selectedProvider.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href={selectedProvider.contact.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-400 hover:underline">
                        {selectedProvider.contact.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="font-semibold mb-3">Certifications & Qualifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.certifications.map(cert => (
                      <Badge key={cert} variant="default" className="bg-green-600">
                        <Award className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="font-semibold mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.specialties.map(specialty => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* All Services */}
                <div>
                  <h3 className="font-semibold mb-3">Services Offered</h3>
                  <ul className="space-y-1">
                    {selectedProvider.services.map(service => (
                      <li key={service} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}