'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  VendorOnboardingManager, 
  VendorApplication,
  ONBOARDING_STEPS,
  BusinessInfo,
  ContactPerson,
  Address
} from '@/lib/marketplace/vendor-onboarding';
import {
  Building2,
  FileText,
  Package,
  Shield,
  DollarSign,
  Users,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  CreditCard,
  Award
} from 'lucide-react';

const onboardingManager = new VendorOnboardingManager();

interface Props {
  userId: string;
  onComplete?: (vendorId: string) => void;
}

export function VendorOnboardingFlow({ userId, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [application, setApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form data states
  const [businessInfo, setBusinessInfo] = useState<Partial<BusinessInfo>>({
    businessType: 'manufacturer',
    publicCompany: false
  });
  const [primaryContact, setPrimaryContact] = useState<Partial<ContactPerson>>({});
  const [headquarters, setHeadquarters] = useState<Partial<Address>>({
    type: 'headquarters',
    country: 'USA'
  });

  // Initialize application
  useEffect(() => {
    const app = onboardingManager.startApplication(userId, {});
    setApplication(app);
  }, [userId]);

  const stepIcons = [
    Building2,
    FileText,
    Package,
    Shield,
    DollarSign,
    Users,
    FileCheck
  ];

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0: // Business Information
        if (!businessInfo.companyName) newErrors.companyName = 'Company name is required';
        if (!businessInfo.legalName) newErrors.legalName = 'Legal name is required';
        if (!businessInfo.taxId) newErrors.taxId = 'Tax ID is required';
        if (!businessInfo.yearEstablished) newErrors.yearEstablished = 'Year established is required';
        if (!businessInfo.website) newErrors.website = 'Website is required';
        
        // Validate contact
        if (!primaryContact.firstName) newErrors.firstName = 'First name is required';
        if (!primaryContact.lastName) newErrors.lastName = 'Last name is required';
        if (!primaryContact.email) newErrors.email = 'Email is required';
        if (!primaryContact.phone) newErrors.phone = 'Phone is required';
        
        // Validate address
        if (!headquarters.street1) newErrors.street1 = 'Street address is required';
        if (!headquarters.city) newErrors.city = 'City is required';
        if (!headquarters.state) newErrors.state = 'State is required';
        if (!headquarters.zipCode) newErrors.zipCode = 'ZIP code is required';
        break;
        
      // Add validation for other steps...
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    try {
      // Save current step data
      if (application) {
        switch (currentStep) {
          case 0:
            const updatedBusinessInfo: BusinessInfo = {
              ...businessInfo as BusinessInfo,
              primaryContact: primaryContact as ContactPerson,
              headquarters: headquarters as Address,
              warehouses: []
            };
            
            onboardingManager.updateApplication(
              application.id,
              'businessInfo',
              updatedBusinessInfo
            );
            break;
            
          // Handle other steps...
        }
      }
      
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit application
        await handleSubmit();
      }
    } catch (error) {
      logger.error('system', 'Error saving step:', error );
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!application) return;
    
    setLoading(true);
    try {
      const success = onboardingManager.submitApplication(application.id);
      if (success && onComplete) {
        onComplete(application.id);
      }
    } catch (error) {
      logger.error('system', 'Error submitting application:', error );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Business Information
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={businessInfo.companyName || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, companyName: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                      errors.companyName ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="VibeLux Technologies"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Legal Name *
                  </label>
                  <input
                    type="text"
                    value={businessInfo.legalName || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, legalName: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                      errors.legalName ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="VibeLux Technologies Inc."
                  />
                  {errors.legalName && (
                    <p className="text-red-500 text-sm mt-1">{errors.legalName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Type *
                  </label>
                  <select
                    value={businessInfo.businessType || 'manufacturer'}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessType: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="grower">Grower</option>
                    <option value="service_provider">Service Provider</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Year Established *
                  </label>
                  <input
                    type="number"
                    value={businessInfo.yearEstablished || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, yearEstablished: parseInt(e.target.value) })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                      errors.yearEstablished ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                  {errors.yearEstablished && (
                    <p className="text-red-500 text-sm mt-1">{errors.yearEstablished}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tax ID (EIN) *
                  </label>
                  <input
                    type="text"
                    value={businessInfo.taxId || ''}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, taxId: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                      errors.taxId ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="XX-XXXXXXX"
                  />
                  {errors.taxId && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxId}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="url"
                      value={businessInfo.website || ''}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                        errors.website ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  {errors.website && (
                    <p className="text-red-500 text-sm mt-1">{errors.website}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Company Description
                </label>
                <textarea
                  value={businessInfo.description || ''}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  rows={3}
                  placeholder="Brief description of your company and products/services..."
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Primary Contact</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={primaryContact.firstName || ''}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, firstName: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                      errors.firstName ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={primaryContact.lastName || ''}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, lastName: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                      errors.lastName ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={primaryContact.title || ''}
                    onChange={(e) => setPrimaryContact({ ...primaryContact, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Sales Manager"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={primaryContact.email || ''}
                      onChange={(e) => setPrimaryContact({ ...primaryContact, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                        errors.email ? 'border-red-500' : 'border-gray-700'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={primaryContact.phone || ''}
                      onChange={(e) => setPrimaryContact({ ...primaryContact, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                        errors.phone ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Headquarters Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={headquarters.street1 || ''}
                    onChange={(e) => setHeadquarters({ ...headquarters, street1: e.target.value })}
                    className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                      errors.street1 ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.street1 && (
                    <p className="text-red-500 text-sm mt-1">{errors.street1}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address 2
                  </label>
                  <input
                    type="text"
                    value={headquarters.street2 || ''}
                    onChange={(e) => setHeadquarters({ ...headquarters, street2: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Suite, Unit, Building, etc."
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={headquarters.city || ''}
                      onChange={(e) => setHeadquarters({ ...headquarters, city: e.target.value })}
                      className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                        errors.city ? 'border-red-500' : 'border-gray-700'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={headquarters.state || ''}
                      onChange={(e) => setHeadquarters({ ...headquarters, state: e.target.value })}
                      className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                        errors.state ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder="CA"
                      maxLength={2}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={headquarters.zipCode || ''}
                      onChange={(e) => setHeadquarters({ ...headquarters, zipCode: e.target.value })}
                      className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:border-purple-500 focus:outline-none ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-700'
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 1: // Verification Documents
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
              <p className="text-gray-400 mb-6">
                Please upload the following documents to verify your business. All documents must be current and clearly legible.
              </p>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium mb-1">Business License</h4>
                  <p className="text-sm text-gray-400 mb-3">State or local business license</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Upload Document
                  </button>
                </div>
                
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium mb-1">Tax Certificate</h4>
                  <p className="text-sm text-gray-400 mb-3">W-9 or tax exemption certificate</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Upload Document
                  </button>
                </div>
                
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium mb-1">Insurance Certificate</h4>
                  <p className="text-sm text-gray-400 mb-3">General liability insurance</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Upload Document
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Banking Information</h3>
              <p className="text-gray-400 mb-6">
                We'll verify your banking information with micro-deposits to ensure secure payments.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Chase Bank"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Type *
                  </label>
                  <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none">
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="XXXXXXXXX"
                    maxLength={9}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Number *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      // Add other step content...
      
      default:
        return (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Step Content</h3>
            <p className="text-gray-400">Content for {ONBOARDING_STEPS[currentStep].title}</p>
          </div>
        );
    }
  };

  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {ONBOARDING_STEPS.map((step, index) => {
            const Icon = stepIcons[index];
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : isCompleted
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">
            {ONBOARDING_STEPS[currentStep].title}
          </h2>
          <p className="text-gray-400">
            {ONBOARDING_STEPS[currentStep].description}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-gray-900 rounded-xl p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-400 mb-1">Application Progress</div>
          <div className="text-2xl font-bold text-purple-600">
            {application.completionPercentage}%
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : currentStep === ONBOARDING_STEPS.length - 1 ? (
            <>
              Submit Application
              <Check className="w-5 h-5" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-blue-900/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400 mb-1">Need Help?</h3>
            <p className="text-sm text-gray-400">
              Our vendor support team is available Monday-Friday, 9am-5pm PST.
              Email us at vendors@vibelux.com or call (555) 123-4567.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}