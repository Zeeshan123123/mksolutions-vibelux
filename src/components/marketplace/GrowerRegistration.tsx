'use client';

import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Shield, 
  Building, 
  Calendar,
  Truck,
  Award,
  FileText,
  CheckCircle,
  Upload,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface GrowerProfile {
  businessInfo: {
    name: string;
    type: 'controlled_environment' | 'open_field' | 'hybrid';
    established: number;
    description: string;
    website?: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: [number, number];
  };
  operations: {
    totalAcres: number;
    primaryCrops: string[];
    growingMethods: string[];
    seasonality: {
      yearRound: boolean;
      seasons: string[];
    };
    capacity: {
      weekly: number;
      monthly: number;
      unit: string;
    };
  };
  certifications: {
    organic: boolean;
    gap: boolean;
    globalGap: boolean;
    fairTrade: boolean;
    other: string[];
  };
  logistics: {
    canDeliver: boolean;
    maxDeliveryDistance: number;
    shippingMethods: string[];
    leadTime: number;
    minimumOrder: number;
    packagingOptions: string[];
  };
  qualityStandards: {
    testingLab?: string;
    qualityProcedures: string[];
    traceability: boolean;
    coldChain: boolean;
  };
  businessDocuments: {
    license?: File;
    insurance?: File;
    certifications?: File[];
    references?: File[];
  };
}

const CROP_CATEGORIES = [
  'Leafy Greens', 'Herbs', 'Vine Crops', 'Root Vegetables', 
  'Brassicas', 'Berries', 'Microgreens', 'Tree Fruits', 'Field Crops'
];

const GROWING_METHODS = [
  'Conventional', 'Organic', 'Hydroponic', 'Aquaponic', 
  'Greenhouse', 'Hoop House', 'Open Field', 'Vertical Farming'
];

const SHIPPING_METHODS = [
  'Refrigerated Truck', 'Standard Truck', 'Rail', 'Air Freight',
  'Express Delivery', 'Local Pickup', 'Third-party Logistics'
];

const PACKAGING_OPTIONS = [
  'Bulk Bins', 'Cardboard Boxes', 'Plastic Crates', 'Bags',
  'Vacuum Sealed', 'Modified Atmosphere', 'Custom Packaging'
];

export default function GrowerRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<Partial<GrowerProfile>>({
    businessInfo: { type: 'open_field', established: new Date().getFullYear() },
    operations: { primaryCrops: [], growingMethods: [], seasonality: { yearRound: false, seasons: [] } },
    certifications: { organic: false, gap: false, globalGap: false, fairTrade: false, other: [] },
    logistics: { shippingMethods: [], packagingOptions: [] },
    qualityStandards: { qualityProcedures: [] },
    businessDocuments: {}
  });

  const totalSteps = 6;

  const updateProfile = (section: keyof GrowerProfile, data: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const addToArray = (section: keyof GrowerProfile, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section]?.[field] || []), value]
      }
    }));
  };

  const removeFromArray = (section: keyof GrowerProfile, field: string, index: number) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section]?.[field]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleFileUpload = (section: 'businessDocuments', field: string, file: File) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: file
      }
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Business Information</h2>
              <p className="text-gray-400">Tell us about your growing operation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={profile.businessInfo?.name || ''}
                  onChange={(e) => updateProfile('businessInfo', { name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="Enter your farm or business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Operation Type *
                </label>
                <select
                  value={profile.businessInfo?.type || 'open_field'}
                  onChange={(e) => updateProfile('businessInfo', { type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="open_field">Open Field</option>
                  <option value="controlled_environment">Controlled Environment</option>
                  <option value="hybrid">Hybrid (Both)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Established Year *
                </label>
                <input
                  type="number"
                  value={profile.businessInfo?.established || ''}
                  onChange={(e) => updateProfile('businessInfo', { established: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="Year established"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={profile.businessInfo?.website || ''}
                  onChange={(e) => updateProfile('businessInfo', { website: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  placeholder="https://yourfarm.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Description *
              </label>
              <textarea
                value={profile.businessInfo?.description || ''}
                onChange={(e) => updateProfile('businessInfo', { description: e.target.value })}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                placeholder="Describe your growing operation, experience, and specialties..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Location & Address</h2>
              <p className="text-gray-400">Where is your operation located?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={profile.location?.address || ''}
                  onChange={(e) => updateProfile('location', { address: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="123 Farm Road"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={profile.location?.city || ''}
                  onChange={(e) => updateProfile('location', { city: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="City name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={profile.location?.state || ''}
                  onChange={(e) => updateProfile('location', { state: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="State abbreviation"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={profile.location?.zipCode || ''}
                  onChange={(e) => updateProfile('location', { zipCode: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Operations & Capacity</h2>
              <p className="text-gray-400">Details about your growing operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Acres *
                </label>
                <input
                  type="number"
                  value={profile.operations?.totalAcres || ''}
                  onChange={(e) => updateProfile('operations', { totalAcres: parseFloat(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Total growing area"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weekly Capacity
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={profile.operations?.capacity?.weekly || ''}
                    onChange={(e) => updateProfile('operations', { 
                      capacity: { ...profile.operations?.capacity, weekly: parseInt(e.target.value) }
                    })}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Amount"
                  />
                  <select
                    value={profile.operations?.capacity?.unit || 'lbs'}
                    onChange={(e) => updateProfile('operations', { 
                      capacity: { ...profile.operations?.capacity, unit: e.target.value }
                    })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="lbs">lbs</option>
                    <option value="cases">cases</option>
                    <option value="boxes">boxes</option>
                    <option value="tons">tons</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Primary Crops *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CROP_CATEGORIES.map(crop => (
                  <label key={crop} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={profile.operations?.primaryCrops?.includes(crop) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addToArray('operations', 'primaryCrops', crop);
                        } else {
                          const index = profile.operations?.primaryCrops?.indexOf(crop) || -1;
                          if (index > -1) removeFromArray('operations', 'primaryCrops', index);
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                    />
                    <span className="text-gray-300">{crop}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Growing Methods *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {GROWING_METHODS.map(method => (
                  <label key={method} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={profile.operations?.growingMethods?.includes(method) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addToArray('operations', 'growingMethods', method);
                        } else {
                          const index = profile.operations?.growingMethods?.indexOf(method) || -1;
                          if (index > -1) removeFromArray('operations', 'growingMethods', index);
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
                    />
                    <span className="text-gray-300">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Certifications</h2>
              <p className="text-gray-400">What certifications do you hold?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.certifications?.organic || false}
                    onChange={(e) => updateProfile('certifications', { organic: e.target.checked })}
                    className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">USDA Organic</div>
                    <div className="text-sm text-gray-400">Certified organic production</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.certifications?.gap || false}
                    onChange={(e) => updateProfile('certifications', { gap: e.target.checked })}
                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">GAP</div>
                    <div className="text-sm text-gray-400">Good Agricultural Practices</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.certifications?.globalGap || false}
                    onChange={(e) => updateProfile('certifications', { globalGap: e.target.checked })}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">GLOBALG.A.P.</div>
                    <div className="text-sm text-gray-400">Global food safety standard</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.certifications?.fairTrade || false}
                    onChange={(e) => updateProfile('certifications', { fairTrade: e.target.checked })}
                    className="w-5 h-5 text-yellow-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <div>
                    <div className="text-white font-medium">Fair Trade</div>
                    <div className="text-sm text-gray-400">Fair trade certified</div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Other Certifications
                </label>
                <div className="space-y-2">
                  {profile.certifications?.other?.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => {
                          const updated = [...(profile.certifications?.other || [])];
                          updated[index] = e.target.value;
                          updateProfile('certifications', { other: updated });
                        }}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                        placeholder="Certification name"
                      />
                      <button
                        onClick={() => removeFromArray('certifications', 'other', index)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addToArray('certifications', 'other', '')}
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Certification
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Truck className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Logistics & Delivery</h2>
              <p className="text-gray-400">How do you handle orders and delivery?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={profile.logistics?.canDeliver || false}
                    onChange={(e) => updateProfile('logistics', { canDeliver: e.target.checked })}
                    className="w-5 h-5 text-orange-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-white">We can deliver orders</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Delivery Distance (miles)
                </label>
                <input
                  type="number"
                  value={profile.logistics?.maxDeliveryDistance || ''}
                  onChange={(e) => updateProfile('logistics', { maxDeliveryDistance: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g., 200"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lead Time (days)
                </label>
                <input
                  type="number"
                  value={profile.logistics?.leadTime || ''}
                  onChange={(e) => updateProfile('logistics', { leadTime: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g., 2"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Order
                </label>
                <input
                  type="number"
                  value={profile.logistics?.minimumOrder || ''}
                  onChange={(e) => updateProfile('logistics', { minimumOrder: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Minimum order quantity"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Available Shipping Methods
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SHIPPING_METHODS.map(method => (
                  <label key={method} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={profile.logistics?.shippingMethods?.includes(method) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addToArray('logistics', 'shippingMethods', method);
                        } else {
                          const index = profile.logistics?.shippingMethods?.indexOf(method) || -1;
                          if (index > -1) removeFromArray('logistics', 'shippingMethods', index);
                        }
                      }}
                      className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded"
                    />
                    <span className="text-gray-300">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Packaging Options
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PACKAGING_OPTIONS.map(option => (
                  <label key={option} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={profile.logistics?.packagingOptions?.includes(option) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addToArray('logistics', 'packagingOptions', option);
                        } else {
                          const index = profile.logistics?.packagingOptions?.indexOf(option) || -1;
                          if (index > -1) removeFromArray('logistics', 'packagingOptions', index);
                        }
                      }}
                      className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded"
                    />
                    <span className="text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white">Documents & Verification</h2>
              <p className="text-gray-400">Upload required business documents</p>
            </div>

            <div className="space-y-6">
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-medium">Required Documents</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Please upload clear, readable copies of the following documents for verification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Business License *
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Upload business license</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('businessDocuments', 'license', file);
                      }}
                      className="hidden"
                      id="license-upload"
                    />
                    <label htmlFor="license-upload" className="cursor-pointer text-blue-400 hover:text-blue-300">
                      Choose file
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Insurance Certificate *
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Upload insurance certificate</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('businessDocuments', 'insurance', file);
                      }}
                      className="hidden"
                      id="insurance-upload"
                    />
                    <label htmlFor="insurance-upload" className="cursor-pointer text-blue-400 hover:text-blue-300">
                      Choose file
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quality Standards & Testing Lab
                </label>
                <input
                  type="text"
                  value={profile.qualityStandards?.testingLab || ''}
                  onChange={(e) => updateProfile('qualityStandards', { testingLab: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                  placeholder="Name of testing laboratory (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={profile.qualityStandards?.traceability || false}
                    onChange={(e) => updateProfile('qualityStandards', { traceability: e.target.checked })}
                    className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-white">Full traceability system</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={profile.qualityStandards?.coldChain || false}
                    onChange={(e) => updateProfile('qualityStandards', { coldChain: e.target.checked })}
                    className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded"
                  />
                  <span className="text-white">Cold chain capability</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profile.businessInfo?.name && profile.businessInfo?.description && profile.businessInfo?.established;
      case 2:
        return profile.location?.address && profile.location?.city && profile.location?.state && profile.location?.zipCode;
      case 3:
        return profile.operations?.totalAcres && profile.operations?.primaryCrops?.length;
      case 4:
        return true; // Certifications are optional
      case 5:
        return profile.logistics?.leadTime !== undefined && profile.logistics?.minimumOrder !== undefined;
      case 6:
        return profile.businessDocuments?.license && profile.businessDocuments?.insurance;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      // In production, this would submit to your API
      console.log('Submitting grower registration:', profile);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Registration submitted successfully! We will review your application and contact you within 2-3 business days.');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join VibeLux Marketplace</h1>
          <p className="text-gray-400">Register as a grower to start selling your produce</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 <= currentStep ? 'bg-green-600' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={!isStepValid()}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}