'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  Lightbulb, 
  Zap,
  Ruler,
  Award,
  Calculator,
  TrendingUp,
  Eye,
  Settings,
  Sliders,
  RefreshCw,
  CheckCircle,
  ArrowUpDown,
  ExternalLink,
  BookOpen,
  Target,
  Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';

// Sample DLC fixture data structure
interface DLCFixture {
  id: string;
  manufacturer: string;
  productName: string;
  modelNumber: string;
  category: string;
  ppf: number; // μmol/s
  ppe: number; // μmol/J
  wattage: number;
  powerFactor: number;
  thd: number; // Total Harmonic Distortion %
  voltage: string;
  dimming: string[];
  spectrallyTunable: boolean;
  warranty: number; // years
  price?: number;
  dateQualified: string;
  blueRatio: number;
  greenRatio: number;
  redRatio: number;
  farRedRatio: number;
}

// Sample data - in production this would come from the DLC CSV
const sampleFixtures: DLCFixture[] = [
  {
    id: 'dlc001',
    manufacturer: 'Fluence',
    productName: 'SPYDR 2i',
    modelNumber: 'SPYDRx PLUS 645W',
    category: 'Indoor',
    ppf: 1700,
    ppe: 2.6,
    wattage: 645,
    powerFactor: 0.95,
    thd: 15,
    voltage: '120-277V',
    dimming: ['0-10V', 'DALI'],
    spectrallyTunable: true,
    warranty: 5,
    price: 1200,
    dateQualified: '2024-01-15',
    blueRatio: 15,
    greenRatio: 10,
    redRatio: 65,
    farRedRatio: 10
  },
  {
    id: 'dlc002',
    manufacturer: 'Gavita',
    productName: 'Pro 1700e LED',
    modelNumber: 'Pro 1700e',
    category: 'Greenhouse',
    ppf: 4200,
    ppe: 2.5,
    wattage: 1700,
    powerFactor: 0.98,
    thd: 12,
    voltage: '208-277V',
    dimming: ['0-10V'],
    spectrallyTunable: false,
    warranty: 5,
    price: 2800,
    dateQualified: '2024-02-01',
    blueRatio: 12,
    greenRatio: 8,
    redRatio: 70,
    farRedRatio: 10
  },
  {
    id: 'dlc003',
    manufacturer: 'California Lightworks',
    productName: 'MegaDrive',
    modelNumber: 'MD-220W',
    category: 'Vertical Farm',
    ppf: 580,
    ppe: 2.8,
    wattage: 220,
    powerFactor: 0.92,
    thd: 18,
    voltage: '120-240V',
    dimming: ['PWM', 'Wireless'],
    spectrallyTunable: true,
    warranty: 3,
    price: 450,
    dateQualified: '2024-03-10',
    blueRatio: 20,
    greenRatio: 15,
    redRatio: 55,
    farRedRatio: 10
  }
];

export default function LightingTechnicianPage() {
  const [fixtures, setFixtures] = useState<DLCFixture[]>(sampleFixtures);
  const [filteredFixtures, setFilteredFixtures] = useState<DLCFixture[]>(sampleFixtures);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  
  // Advanced filter sliders
  const [ppeRange, setPpeRange] = useState([2.0, 3.0]);
  const [ppfRange, setPpfRange] = useState([0, 5000]);
  const [wattageRange, setWattageRange] = useState([0, 2000]);
  const [powerFactorMin, setPowerFactorMin] = useState(0.9);
  const [thdMax, setThdMax] = useState(20);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  
  // Spectrum analysis sliders
  const [blueRange, setBlueRange] = useState([0, 30]);
  const [greenRange, setGreenRange] = useState([0, 30]);
  const [redRange, setRedRange] = useState([0, 80]);
  const [farRedRange, setFarRedRange] = useState([0, 20]);
  
  const [sortBy, setSortBy] = useState('ppe');
  const [viewMode, setViewMode] = useState('cards'); // cards, table, comparison
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Get unique values for dropdowns
  const categories = useMemo(() => 
    ['All', ...new Set(fixtures.map(f => f.category))], [fixtures]
  );
  const manufacturers = useMemo(() => 
    ['All', ...new Set(fixtures.map(f => f.manufacturer))], [fixtures]
  );

  // Filter and sort fixtures
  useEffect(() => {
    const filtered = fixtures.filter(fixture => {
      const matchesSearch = fixture.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fixture.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fixture.modelNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || fixture.category === selectedCategory;
      const matchesManufacturer = selectedManufacturer === 'All' || fixture.manufacturer === selectedManufacturer;
      
      const matchesPPE = fixture.ppe >= ppeRange[0] && fixture.ppe <= ppeRange[1];
      const matchesPPF = fixture.ppf >= ppfRange[0] && fixture.ppf <= ppfRange[1];
      const matchesWattage = fixture.wattage >= wattageRange[0] && fixture.wattage <= wattageRange[1];
      const matchesPowerFactor = fixture.powerFactor >= powerFactorMin;
      const matchesTHD = fixture.thd <= thdMax;
      const matchesPrice = !fixture.price || (fixture.price >= priceRange[0] && fixture.price <= priceRange[1]);
      
      const matchesBlue = fixture.blueRatio >= blueRange[0] && fixture.blueRatio <= blueRange[1];
      const matchesGreen = fixture.greenRatio >= greenRange[0] && fixture.greenRatio <= greenRange[1];
      const matchesRed = fixture.redRatio >= redRange[0] && fixture.redRatio <= redRange[1];
      const matchesFarRed = fixture.farRedRatio >= farRedRange[0] && fixture.farRedRatio <= farRedRange[1];

      return matchesSearch && matchesCategory && matchesManufacturer && 
             matchesPPE && matchesPPF && matchesWattage && matchesPowerFactor && 
             matchesTHD && matchesPrice && matchesBlue && matchesGreen && 
             matchesRed && matchesFarRed;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ppe': return b.ppe - a.ppe;
        case 'ppf': return b.ppf - a.ppf;
        case 'wattage': return a.wattage - b.wattage;
        case 'price': return (a.price || 0) - (b.price || 0);
        case 'manufacturer': return a.manufacturer.localeCompare(b.manufacturer);
        default: return 0;
      }
    });

    setFilteredFixtures(filtered);
  }, [fixtures, searchTerm, selectedCategory, selectedManufacturer, ppeRange, ppfRange, 
      wattageRange, powerFactorMin, thdMax, priceRange, blueRange, greenRange, 
      redRange, farRedRange, sortBy]);

  const SliderControl = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 0.1, 
    unit = '',
    isRange = false 
  }: {
    label: string;
    value: number | number[];
    onChange: (val: number | number[]) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    isRange?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm text-blue-400">
          {isRange ? `${(value as number[])[0]}${unit} - ${(value as number[])[1]}${unit}` : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={isRange ? (value as number[])[0] : (value as number)}
        onChange={(e) => {
          if (isRange) {
            onChange([(value as number[])[0], parseFloat(e.target.value)]);
          } else {
            onChange(parseFloat(e.target.value));
          }
        }}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  const FixtureCard = ({ fixture }: { fixture: DLCFixture }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{fixture.productName}</h3>
          <p className="text-blue-400">{fixture.manufacturer}</p>
          <p className="text-sm text-gray-400">{fixture.modelNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">{fixture.ppe.toFixed(1)}</div>
          <div className="text-xs text-gray-400">μmol/J</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-700/50 rounded-lg">
          <div className="text-lg font-semibold text-white">{fixture.ppf.toLocaleString()}</div>
          <div className="text-xs text-gray-400">PPF (μmol/s)</div>
        </div>
        <div className="text-center p-3 bg-gray-700/50 rounded-lg">
          <div className="text-lg font-semibold text-white">{fixture.wattage}W</div>
          <div className="text-xs text-gray-400">Power</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Power Factor:</span>
          <span className="text-white">{fixture.powerFactor}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">THD:</span>
          <span className="text-white">{fixture.thd}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Dimming:</span>
          <span className="text-white">{fixture.dimming.join(', ')}</span>
        </div>
        {fixture.price && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price:</span>
            <span className="text-green-400 font-semibold">${fixture.price.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Spectrum Visualization */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Spectrum Distribution</div>
        <div className="flex space-x-1 h-8 rounded overflow-hidden">
          <div 
            className="bg-blue-500" 
            style={{ width: `${fixture.blueRatio}%` }}
            title={`Blue: ${fixture.blueRatio}%`}
          />
          <div 
            className="bg-green-500" 
            style={{ width: `${fixture.greenRatio}%` }}
            title={`Green: ${fixture.greenRatio}%`}
          />
          <div 
            className="bg-red-500" 
            style={{ width: `${fixture.redRatio}%` }}
            title={`Red: ${fixture.redRatio}%`}
          />
          <div 
            className="bg-red-800" 
            style={{ width: `${fixture.farRedRatio}%` }}
            title={`Far Red: ${fixture.farRedRatio}%`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>B:{fixture.blueRatio}%</span>
          <span>G:{fixture.greenRatio}%</span>
          <span>R:{fixture.redRatio}%</span>
          <span>FR:{fixture.farRedRatio}%</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Compare
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm">
          Download Spec
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      <MarketingNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Professional DLC
                <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent ml-3">
                  Fixture Analysis
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-300 max-w-3xl mx-auto"
              >
                Advanced tools for lighting technicians to search, analyze, and compare DLC-qualified fixtures
                with professional-grade filtering and spectrum analysis.
              </motion.p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{fixtures.length}</div>
                <div className="text-sm text-gray-400">DLC Fixtures</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{manufacturers.length - 1}</div>
                <div className="text-sm text-gray-400">Manufacturers</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{filteredFixtures.length}</div>
                <div className="text-sm text-gray-400">Filtered Results</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {filteredFixtures.length > 0 ? Math.max(...filteredFixtures.map(f => f.ppe)).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-gray-400">Max PPE</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Controls */}
        <section className="px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              {/* Search Bar */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search fixtures, manufacturers, models..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={selectedManufacturer}
                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                    className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    {manufacturers.map(mfg => (
                      <option key={mfg} value={mfg}>{mfg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      showAdvancedFilters 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-gray-700 border-gray-600 text-gray-300'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    Advanced Filters
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ppe">PPE (Efficiency)</option>
                    <option value="ppf">PPF (Output)</option>
                    <option value="wattage">Wattage</option>
                    <option value="price">Price</option>
                    <option value="manufacturer">Manufacturer</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <section className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Performance Sliders */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      Performance
                    </h3>
                    <SliderControl
                      label="PPE Range"
                      value={ppeRange}
                      onChange={(val) => setPpeRange(val as number[])}
                      min={1.5}
                      max={4.0}
                      step={0.1}
                      unit=" μmol/J"
                      isRange={true}
                    />
                    <SliderControl
                      label="PPF Range"
                      value={ppfRange}
                      onChange={(val) => setPpfRange(val as number[])}
                      min={0}
                      max={6000}
                      step={50}
                      unit=" μmol/s"
                      isRange={true}
                    />
                    <SliderControl
                      label="Wattage Range"
                      value={wattageRange}
                      onChange={(val) => setWattageRange(val as number[])}
                      min={0}
                      max={2000}
                      step={10}
                      unit="W"
                      isRange={true}
                    />
                  </div>

                  {/* Electrical Sliders */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-green-400" />
                      Electrical
                    </h3>
                    <SliderControl
                      label="Min Power Factor"
                      value={powerFactorMin}
                      onChange={(val) => setPowerFactorMin(val as number)}
                      min={0.80}
                      max={1.0}
                      step={0.01}
                    />
                    <SliderControl
                      label="Max THD"
                      value={thdMax}
                      onChange={(val) => setThdMax(val as number)}
                      min={5}
                      max={25}
                      step={1}
                      unit="%"
                    />
                    <SliderControl
                      label="Price Range"
                      value={priceRange}
                      onChange={(val) => setPriceRange(val as number[])}
                      min={0}
                      max={5000}
                      step={50}
                      unit="$"
                      isRange={true}
                    />
                  </div>

                  {/* Spectrum Sliders */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Spectrum Analysis
                    </h3>
                    <SliderControl
                      label="Blue Range"
                      value={blueRange}
                      onChange={(val) => setBlueRange(val as number[])}
                      min={0}
                      max={35}
                      step={1}
                      unit="%"
                      isRange={true}
                    />
                    <SliderControl
                      label="Red Range"
                      value={redRange}
                      onChange={(val) => setRedRange(val as number[])}
                      min={0}
                      max={85}
                      step={1}
                      unit="%"
                      isRange={true}
                    />
                    <SliderControl
                      label="Far Red Range"
                      value={farRedRange}
                      onChange={(val) => setFarRedRange(val as number[])}
                      min={0}
                      max={25}
                      step={1}
                      unit="%"
                      isRange={true}
                    />
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <button 
                    onClick={() => {
                      // Reset all filters
                      setPpeRange([2.0, 3.0]);
                      setPpfRange([0, 5000]);
                      setWattageRange([0, 2000]);
                      setPowerFactorMin(0.9);
                      setThdMax(20);
                      setPriceRange([0, 5000]);
                      setBlueRange([0, 30]);
                      setGreenRange([0, 30]);
                      setRedRange([0, 80]);
                      setFarRedRange([0, 20]);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Results */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {filteredFixtures.length} Fixtures Found
              </h2>
              <div className="flex gap-2">
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredFixtures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFixtures.map(fixture => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No fixtures match your criteria</h3>
                <p className="text-gray-400">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}