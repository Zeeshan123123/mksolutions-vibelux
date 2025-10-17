/**
 * Integrated SAM-TCO Financial Calculator
 * Combines NREL System Advisor Model with Total Cost of Ownership analysis
 * for comprehensive greenhouse financial planning
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calculator, DollarSign, TrendingUp, Zap, Building, Leaf, Sun, AlertTriangle, Download, Info } from 'lucide-react';
import { utilityRebateDatabase } from '@/lib/utility-rebate-database'
import { EnhancedRebateCalculator, type ProjectDetails, type EnhancedSavingsAnalysis } from '@/lib/enhanced-rebate-calculator'
import { createUtilityClient, type TariffData } from '@/lib/energy/utility-api-client'

import { SAMSystemConfig, SAMFinancialConfig, SAMResults, samIntegration } from '../lib/sam-integration';
import { AdvancedFinancialConfig, DetailedFinancialResults, samFinancialEngine } from '../lib/sam-financial-modeling';
import { logger } from '@/lib/logging/production-logger';

// TCO-related interfaces
interface FacilityData {
  name: string;
  size: number; // sq ft
  rooms: number;
  tiers: number;
  canopyArea: number; // sq ft
  targetPPFD: number;
  photoperiod: number; // hours
  daysPerYear: number;
  cropCycles: number;
  yieldPerSqFt: number; // lbs
  pricePerPound: number; // cents
  utilityRate: number; // $/kWh
  facilityKind?: 'greenhouse' | 'indoor-single-tier' | 'indoor-vertical';
  cropType: string;
  automationLevel: 'low' | 'medium' | 'high';
  currentElectricityCost: number; // $/year
  demandCharges: number; // $/kW/month
}

interface OpexItems {
  labor: number;
  electricity: number;
  hvacEnergy: number;
  water: number;
  wastewater: number;
  nutrients: number;
  growingMedia: number;
  packaging: number;
  maintenance: number;
  insurance: number;
  leaseOrRent: number;
  propertyTax: number;
  administrative: number;
  complianceTesting: number;
  other: number;
}

interface DuPontAnalysis {
  profitMargin: number; // Net Income / Sales (%)
  assetTurnover: number; // Sales / Assets (ratio)
  financialLeverage: number; // Assets / Equity (ratio)
  returnOnEquity: number; // ROE = Profit Margin × Asset Turnover × Financial Leverage (%)
  returnOnAssets: number; // ROA = Net Income / Assets (%)
  equityMultiplier: number; // Assets / Equity (same as financial leverage)
  
  // Breakdown for analysis
  totalAssets: number;
  totalEquity: number;
  netIncome: number;
  annualSales: number;
  
  // Performance insights
  strengthsWeaknesses: {
    profitabilityRating: 'Excellent' | 'Good' | 'Average' | 'Poor';
    efficiencyRating: 'Excellent' | 'Good' | 'Average' | 'Poor';
    leverageRating: 'Conservative' | 'Moderate' | 'Aggressive' | 'High Risk';
    overallRating: 'Excellent' | 'Good' | 'Average' | 'Poor';
    recommendations: string[];
  };
}

interface IntegratedResults {
  // SAM Results
  samResults: DetailedFinancialResults | null;
  
  // TCO Results
  tcoResults: {
    totalCapex: number;
    totalOpex: number;
    annualRevenue: number;
    netProfit: number;
    roi: number;
    paybackPeriod: number;
    tenYearNPV: number;
  };
  
  // Integrated Metrics
  integrated: {
    totalSystemCost: number; // TCO + Solar
    energySavings: number; // Annual solar savings
    combinedROI: number;
    combinedPayback: number;
    combinedNPV: number;
    energyOffsetRatio: number; // % of energy needs met by solar
    carbonFootprintReduction: number; // kg CO2/year
  };

  // DuPont Financial Analysis
  dupontAnalysis: DuPontAnalysis;
}

interface IntegratedSAMTCOCalculatorProps {
  onResultsChange?: (results: IntegratedResults) => void;
}

export default function IntegratedSAMTCOCalculator({ onResultsChange }: IntegratedSAMTCOCalculatorProps) {
  // Facility configuration
  const [facility, setFacility] = useState<FacilityData>({
    name: 'Smart Greenhouse Facility',
    size: 50000,
    rooms: 10,
    tiers: 5,
    canopyArea: 40000,
    targetPPFD: 300,
    photoperiod: 16,
    daysPerYear: 365,
    cropCycles: 12,
    yieldPerSqFt: 0.5,
    pricePerPound: 2000, // $20/lb
    utilityRate: 0.12,
    facilityKind: 'greenhouse',
    cropType: 'Leafy Greens',
    automationLevel: 'medium',
    currentElectricityCost: 720000, // $720k/year
    demandCharges: 15 // $15/kW/month
  });

  // OPEX items
  const [opexItems, setOpexItems] = useState<OpexItems>({
    labor: 450000,
    electricity: 720000,
    hvacEnergy: 240000,
    water: 15000,
    wastewater: 8000,
    nutrients: 40000,
    growingMedia: 20000,
    packaging: 35000,
    maintenance: 60000,
    insurance: 25000,
    leaseOrRent: 120000,
    propertyTax: 45000,
    administrative: 90000,
    complianceTesting: 15000,
    other: 30000
  });

  // CAPEX items
  interface CapexItems {
    equipment: number;
    installation: number;
    controlsAndSensors: number;
    electricalUpgrades: number;
    structuralImprovements: number;
    automationSystems: number;
    itNetworking: number;
    designEngineering: number;
    permittingFees: number;
    contingency: number;
    salesTax: number;
    other: number;
  }

  const [capexItems, setCapexItems] = useState<CapexItems>({
    equipment: 1400000,
    installation: 350000,
    controlsAndSensors: 120000,
    electricalUpgrades: 180000,
    structuralImprovements: 160000,
    automationSystems: 90000,
    itNetworking: 45000,
    designEngineering: 75000,
    permittingFees: 35000,
    contingency: 100000,
    salesTax: 80000,
    other: 30000
  });

  // Solar system configuration
  const [solarConfig, setSolarConfig] = useState<SAMSystemConfig>({
    systemCapacity: 500, // 500kW system
    moduleType: 0,
    arrayType: 0,
    tilt: 25,
    azimuth: 180,
    gcr: 0.4,
    dcACRatio: 1.2,
    inverterEfficiency: 96,
    systemLosses: 14,
    latitude: 40.7589,
    longitude: -111.8883,
    timezone: -7,
    elevation: 1400,
    shadingFactor: 0.1, // Greenhouse roof integration
    roofTransmittance: 0.9,
    loadProfile: 'greenhouse',
    useNSRDB: true
  });

  // Solar financial configuration
  const [solarFinancial, setSolarFinancial] = useState<AdvancedFinancialConfig>({
    analysisType: 'commercial',
    totalInstalledCost: 2200, // $/kW - competitive rate
    totalInstalledCostPerWatt: 2.2,
    discountRate: 6,
    inflationRate: 2.5,
    taxRate: 30,
    analysisYears: 25,
    electricityRate: facility.utilityRate,
    demandCharge: facility.demandCharges,
    federalTaxCredit: 30,
    omCostFixed: 2500, // $2500/year base O&M
    omCostVariable: 0.008, // $0.008/kWh
    
    financing: {
      cashPurchase: true
    },
    incentives: {
      federal: {
        itc: 30,
        depreciation: 'MACRS',
        bonus_depreciation: 80
      },
      state: {
        taxCredit: 5,
        rebate: 400
      },
      utility: {
        rebate: 200,
        demandChargeReduction: 0.7 // 70% demand charge reduction
      },
      local: {
        propertyTaxExemption: true,
        salesTaxExemption: true
      }
    },
    market: {
      electricityRateEscalation: 3.5,
      netMeteringRate: facility.utilityRate
    },
    greenhouse: {
      currentEnergyBill: facility.currentElectricityCost / 12, // Monthly
      demandCharges: facility.demandCharges,
      cropProductionIncrease: 12, // 12% yield increase from optimized lighting
      cropValueIncrease: 1.5, // $1.50/lb premium for sustainable produce
      annualCropProduction: facility.canopyArea * facility.yieldPerSqFt * facility.cropCycles,
      carbonCreditValue: 45 // $45/tonne CO2
    }
  });

  // Results
  const [results, setResults] = useState<IntegratedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('facility');
  // Scenario modeling
  type Scenario = {
    id: string;
    name: string;
    cropType: string;
    pricePerPound: number;
    yieldPerSqFt: number;
    photoperiod: number;
    tiers: number;
  };
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 's1', name: 'Tomato - Premium', cropType: 'Tomato', pricePerPound: 250, yieldPerSqFt: 0.65, photoperiod: 16, tiers: 1 },
    { id: 's2', name: 'Leafy Greens', cropType: 'Leafy Greens', pricePerPound: 200, yieldPerSqFt: 0.5, photoperiod: 16, tiers: 1 },
    { id: 's3', name: 'Strawberry Indoor (vertical)', cropType: 'Strawberry', pricePerPound: 400, yieldPerSqFt: 0.8, photoperiod: 18, tiers: 3 }
  ]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('s2');
  const scenariosKeyRef = useRef<string>('vibelux_scenarios');

  // Persist scenarios to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(scenariosKeyRef.current);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScenarios(parsed);
          setActiveScenarioId(parsed[0]?.id || '');
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(scenariosKeyRef.current, JSON.stringify(scenarios));
    } catch {}
  }, [scenarios]);

  const applyScenario = (scenarioId: string) => {
    const s = scenarios.find(sc => sc.id === scenarioId);
    if (!s) return;
    setFacility(prev => ({
      ...prev,
      cropCycles: prev.cropCycles,
      pricePerPound: s.pricePerPound,
      yieldPerSqFt: s.yieldPerSqFt,
      photoperiod: s.photoperiod,
      tiers: s.tiers,
      cropType: s.cropType
    }));
  };

  // Rebates & incentives
  const rebateCalc = new EnhancedRebateCalculator();
  const uniqueStates = Array.from(new Set(utilityRebateDatabase.map(p => p.state))).sort();
  const [rebateState, setRebateState] = useState<string>(uniqueStates[0] || 'CA');
  const [rebateEstimate, setRebateEstimate] = useState<number>(0);
  const [rebateAnalysis, setRebateAnalysis] = useState<EnhancedSavingsAnalysis | null>(null);
  const [lightingProject, setLightingProject] = useState<Pick<ProjectDetails,
    'fixtures' | 'wattsPerFixture' | 'replacingType' | 'replacingWatts' | 'dailyHours' | 'daysPerWeek' | 'weeksPerYear' | 'facilityType' | 'cropType' | 'facilityArea' | 'installationCost' | 'electricityCost'
  >>({
    fixtures: Math.ceil(facility.canopyArea / 16),
    wattsPerFixture: 660,
    replacingType: 'HPS',
    replacingWatts: 1000,
    dailyHours: facility.photoperiod,
    daysPerWeek: 7,
    weeksPerYear: 52,
    facilityType: 'greenhouse',
    cropType: 'non-cannabis-vegetative',
    facilityArea: facility.canopyArea,
    installationCost: 500000,
    electricityCost: facility.utilityRate
  });

  // Utility rates
  const [utilityProvider, setUtilityProvider] = useState<string>('generic');
  const [utilityAccountId, setUtilityAccountId] = useState<string>('demo');
  const [utilityApiKey, setUtilityApiKey] = useState<string>('');
  const [tariff, setTariff] = useState<TariffData | null>(null);
  const [utilityLoading, setUtilityLoading] = useState<boolean>(false);

  const fetchTariff = async () => {
    try {
      setUtilityLoading(true);
      const client = createUtilityClient({ provider: utilityProvider, apiKey: utilityApiKey, accountId: utilityAccountId });
      const t = await client.getTariffData();
      setTariff(t);
      // Use current rate as utilityRate baseline
      setFacility(prev => ({ ...prev, utilityRate: t.currentRate }));
      setSolarFinancial(prev => ({
        ...prev,
        market: { ...prev.market, netMeteringRate: t.currentRate }
      }));
    } catch (e) {
      // keep silent; simulated fallback happens inside client when allowed
    } finally {
      setUtilityLoading(false);
    }
  };

  // Financing for non-solar CAPEX
  type FinancingType = 'cash' | 'loan' | 'lease'
  const [financingType, setFinancingType] = useState<FinancingType>('cash');
  const [loanAPR, setLoanAPR] = useState<number>(7.5);
  const [loanYears, setLoanYears] = useState<number>(5);
  const [loanDownPaymentPct, setLoanDownPaymentPct] = useState<number>(20);
  const [leaseMonthly, setLeaseMonthly] = useState<number>(45000);
  const [leaseEscalationPct, setLeaseEscalationPct] = useState<number>(3);

  // Calculate annual lighting energy consumption
  const calculateLightingEnergyFor = (f: FacilityData) => {
    const tiersLocal = Math.max(f.tiers || 1, 1);
    const fixtureCountLocal = Math.ceil(f.canopyArea / 16) * tiersLocal;
    const wattsPerFixtureLocal = 660;
    const dailyHoursLocal = f.photoperiod;
    const annualKWhLocal = (fixtureCountLocal * wattsPerFixtureLocal * dailyHoursLocal * f.daysPerYear) / 1000;
    return annualKWhLocal;
  };
  const calculateLightingEnergy = () => calculateLightingEnergyFor(facility);

  // Calculate lighting peak demand (kW)
  const calculateLightingDemandKWFor = (f: FacilityData) => {
    const tiersLocal = Math.max(f.tiers || 1, 1);
    const fixtureCountLocal = Math.ceil(f.canopyArea / 16) * tiersLocal;
    const wattsPerFixtureLocal = 660;
    return (fixtureCountLocal * wattsPerFixtureLocal) / 1000;
  };
  const calculateLightingDemandKW = () => calculateLightingDemandKWFor(facility);

  // Compute effective electricity rate using TOU if available
  const computeEffectiveRate = () => {
    if (tariff) {
      // Simple weighting: 30% on-peak, 20% mid-peak, 50% off-peak
      const on = tariff.timeOfUse.onPeak || facility.utilityRate;
      const mid = tariff.timeOfUse.midPeak || facility.utilityRate;
      const off = tariff.timeOfUse.offPeak || facility.utilityRate;
      return on * 0.30 + mid * 0.20 + off * 0.50;
    }
    return facility.utilityRate;
  };

  // Adjust defaults when facility type changes
  useEffect(() => {
    const kind = facility.facilityKind;
    if (!kind) return;
    if (kind === 'greenhouse') {
      setOpexItems(prev => ({ ...prev, hvacEnergy: 180000 }));
    } else if (kind === 'indoor-single-tier') {
      setOpexItems(prev => ({ ...prev, hvacEnergy: 420000 }));
    } else if (kind === 'indoor-vertical') {
      setOpexItems(prev => ({ ...prev, hvacEnergy: 520000 }));
    }
    // Nudge lighting project defaults
    setLightingProject(prev => ({
      ...prev,
      dailyHours: facility.photoperiod,
      facilityArea: facility.canopyArea,
      electricityCost: facility.utilityRate
    }));
  }, [facility.facilityKind]);

  // Calculate DuPont Analysis
  const calculateDuPontAnalysis = (
    annualRevenue: number, 
    netProfit: number, 
    totalSystemCost: number
  ): DuPontAnalysis => {
    // Assumptions for agriculture/greenhouse operations
    const debtToEquityRatio = 0.6; // 60% debt, 40% equity typical for agriculture
    const totalEquity = totalSystemCost / (1 + debtToEquityRatio);
    const totalAssets = totalSystemCost; // Simplified: total system cost as assets
    
    // Core DuPont ratios
    const profitMargin = annualRevenue > 0 ? (netProfit / annualRevenue) * 100 : 0;
    const assetTurnover = totalAssets > 0 ? annualRevenue / totalAssets : 0;
    const financialLeverage = totalEquity > 0 ? totalAssets / totalEquity : 1;
    
    // Calculated metrics
    const returnOnAssets = totalAssets > 0 ? (netProfit / totalAssets) * 100 : 0;
    const returnOnEquity = (profitMargin / 100) * assetTurnover * financialLeverage * 100;
    
    // Performance ratings based on industry benchmarks
    const getRating = (value: number, excellent: number, good: number, average: number) => {
      if (value >= excellent) return 'Excellent' as const;
      if (value >= good) return 'Good' as const;
      if (value >= average) return 'Average' as const;
      return 'Poor' as const;
    };

    const profitabilityRating = getRating(profitMargin, 15, 10, 5); // Agriculture profit margins
    const efficiencyRating = getRating(assetTurnover, 1.2, 0.8, 0.4); // Asset efficiency
    const leverageRating = financialLeverage >= 3 ? 'High Risk' : 
                          financialLeverage >= 2.5 ? 'Aggressive' :
                          financialLeverage >= 1.8 ? 'Moderate' : 'Conservative';
    
    // Overall rating
    const overallScore = (
      (profitabilityRating === 'Excellent' ? 4 : profitabilityRating === 'Good' ? 3 : profitabilityRating === 'Average' ? 2 : 1) +
      (efficiencyRating === 'Excellent' ? 4 : efficiencyRating === 'Good' ? 3 : efficiencyRating === 'Average' ? 2 : 1) +
      (leverageRating === 'Conservative' ? 4 : leverageRating === 'Moderate' ? 3 : leverageRating === 'Aggressive' ? 2 : 1)
    ) / 3;
    
    const overallRating = overallScore >= 3.5 ? 'Excellent' : 
                         overallScore >= 2.5 ? 'Good' : 
                         overallScore >= 1.5 ? 'Average' : 'Poor';

    // Generate recommendations
    const recommendations = [];
    if (profitMargin < 10) {
      recommendations.push("Focus on increasing profit margins through cost optimization or premium pricing");
    }
    if (assetTurnover < 0.8) {
      recommendations.push("Improve asset utilization - consider increasing crop cycles or facility utilization");
    }
    if (financialLeverage > 2.5) {
      recommendations.push("Consider reducing debt levels to decrease financial risk");
    }
    if (returnOnEquity < 15) {
      recommendations.push("Target ROE improvement through operational efficiency gains");
    }

    return {
      profitMargin,
      assetTurnover,
      financialLeverage,
      returnOnEquity,
      returnOnAssets,
      equityMultiplier: financialLeverage,
      totalAssets,
      totalEquity,
      netIncome: netProfit,
      annualSales: annualRevenue,
      strengthsWeaknesses: {
        profitabilityRating,
        efficiencyRating,
        leverageRating,
        overallRating,
        recommendations
      }
    };
  };

  // Run integrated analysis
  const runIntegratedAnalysis = async () => {
    setLoading(true);
    try {
      // 1. Run SAM analysis
      const samResults = await samFinancialEngine.analyzeFinancials(
        solarConfig,
        solarFinancial,
        calculateLightingEnergy() * 1.5 // Total facility energy = lighting + HVAC/controls
      );

      // 2. Calculate TCO with solar integration
      const grossCapex = Object.values(capexItems).reduce((sum, v) => sum + v, 0);

      // Apply rebate estimate against equipment-related CAPEX
      const totalCapex = Math.max(0, grossCapex - rebateEstimate);
      const solarCapex = solarConfig.systemCapacity * solarFinancial.totalInstalledCost;
      const totalSystemCost = totalCapex + solarCapex;

      // 3. Calculate energy savings
      const annualSolarProduction = samResults.annualEnergyProduction;
      const effectiveRate = computeEffectiveRate();
      const baselineDemandAnnual = (tariff?.demandCharges?.rate
        ? tariff.demandCharges.rate
        : facility.demandCharges) * calculateLightingDemandKW() * 12;
      const demandReductionPct = (solarFinancial.incentives.utility.demandChargeReduction || 0) * 1.0;
      const annualDemandSavings = baselineDemandAnnual * demandReductionPct;
      const annualEnergySavings = annualSolarProduction * effectiveRate;
      const baselineAnnualCost = opexItems.electricity + opexItems.hvacEnergy + baselineDemandAnnual;
      const energySavings = Math.min(
        annualEnergySavings + annualDemandSavings,
        baselineAnnualCost
      );
      const energyOffsetRatio = (annualSolarProduction / calculateLightingEnergy()) * 100;

      // 4. Adjust OPEX with solar savings
      const adjustedOpex = {
        ...opexItems,
        electricity: Math.max(0, opexItems.electricity - energySavings * 0.7),
        hvacEnergy: Math.max(0, opexItems.hvacEnergy - energySavings * 0.3)
      };

      // 5. Calculate greenhouse production benefits
      const baseAnnualRevenue = facility.canopyArea * facility.yieldPerSqFt * facility.cropCycles * 
                               (facility.pricePerPound / 100);
      const sustainablePremium = (solarFinancial.greenhouse.cropValueIncrease || 0) * 
                                facility.canopyArea * facility.yieldPerSqFt * facility.cropCycles;
      const yieldIncrease = baseAnnualRevenue * ((solarFinancial.greenhouse.cropProductionIncrease || 0) / 100);
      
      const enhancedRevenue = baseAnnualRevenue + sustainablePremium + yieldIncrease;

      // 6. Calculate integrated metrics
      const totalAnnualOpex = Object.values(adjustedOpex).reduce((sum, cost) => sum + cost, 0);
      const netProfit = enhancedRevenue - totalAnnualOpex;
      // Financing impact
      const nonSolarPrincipal = totalCapex;
      const annualLoanPayment = financingType === 'loan' ? calculateAnnualLoanPayment(
        nonSolarPrincipal * (1 - loanDownPaymentPct / 100), loanAPR, loanYears
      ) : 0;
      const annualLeasePaymentYear1 = financingType === 'lease' ? leaseMonthly * 12 : 0;

      // Adjusted profit after financing payments (year 1)
      const netProfitAfterFinancing = netProfit - (financingType === 'loan' ? annualLoanPayment : financingType === 'lease' ? annualLeasePaymentYear1 : 0);

      const combinedROI = ((netProfitAfterFinancing / totalSystemCost) * 100);
      const combinedPayback = totalSystemCost / Math.max(netProfitAfterFinancing, 1);

      // 7. Calculate combined NPV
      // Initial outlay considers financing type
      const initialOutlay = financingType === 'cash'
        ? totalSystemCost
        : financingType === 'loan'
          ? (solarCapex + totalCapex * (loanDownPaymentPct / 100))
          : solarCapex; // lease has no upfront non-solar CAPEX here

      let combinedNPV = -initialOutlay;
      for (let year = 1; year <= 10; year++) {
        const inflationFactor = Math.pow(1 + solarFinancial.inflationRate / 100, year);
        const degradationFactor = Math.pow(1 - 0.005, year - 1); // Solar degradation
        
        const yearlyRevenue = enhancedRevenue * inflationFactor;
        const yearlyOpex = totalAnnualOpex * inflationFactor;
        const yearlySolarSavings = energySavings * degradationFactor * inflationFactor;
        const yearlyFinancePayment = financingType === 'loan' ? annualLoanPayment :
          financingType === 'lease' ? annualLeasePaymentYear1 * Math.pow(1 + leaseEscalationPct / 100, year - 1) : 0;
        
        const yearlyNetCashFlow = yearlyRevenue - yearlyOpex + yearlySolarSavings - yearlyFinancePayment;
        combinedNPV += yearlyNetCashFlow / Math.pow(1 + solarFinancial.discountRate / 100, year);
      }

      // Calculate DuPont Analysis
      const dupontAnalysis = calculateDuPontAnalysis(
        enhancedRevenue,
        netProfit,
        totalSystemCost
      );

      const integratedResults: IntegratedResults = {
        samResults,
        tcoResults: {
          totalCapex,
          totalOpex: totalAnnualOpex,
          annualRevenue: enhancedRevenue,
          netProfit: netProfitAfterFinancing,
          roi: combinedROI,
          paybackPeriod: combinedPayback,
          tenYearNPV: combinedNPV
        },
        integrated: {
          totalSystemCost,
          energySavings,
          combinedROI,
          combinedPayback,
          combinedNPV,
          energyOffsetRatio: Math.min(100, energyOffsetRatio),
          carbonFootprintReduction: samResults.co2Avoided
        },
        dupontAnalysis
      };

      setResults(integratedResults);
      onResultsChange?.(integratedResults);

    } catch (error) {
      logger.error('system', 'Analysis failed:', error );
    } finally {
      setLoading(false);
    }
  };

  // Loan payment helper (annual)
  function calculateAnnualLoanPayment(principal: number, annualRatePct: number, years: number): number {
    if (principal <= 0 || annualRatePct <= 0 || years <= 0) return 0;
    const r = annualRatePct / 100;
    const n = years;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  // Scenario analysis helpers
  type ScenarioResult = {
    id: string;
    name: string;
    roi: number;
    payback: number;
    npv: number;
    netProfit: number;
  };
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);

  const analyzeScenario = async (s: Scenario): Promise<ScenarioResult> => {
    const f: FacilityData = {
      ...facility,
      photoperiod: s.photoperiod,
      tiers: s.tiers,
      yieldPerSqFt: s.yieldPerSqFt,
      pricePerPound: s.pricePerPound,
      cropType: s.cropType
    };
    const annualEnergy = calculateLightingEnergyFor(f) * 1.5;
    const sf = { ...solarFinancial, electricityRate: f.utilityRate, demandCharge: f.demandCharges, market: { ...solarFinancial.market, netMeteringRate: f.utilityRate } } as AdvancedFinancialConfig;
    const samRes = await samFinancialEngine.analyzeFinancials(solarConfig, sf, annualEnergy);
    const grossCapex = Object.values(capexItems).reduce((sum, v) => sum + v, 0);
    const totalCapexLocal = Math.max(0, grossCapex - rebateEstimate);
    const solarCapexLocal = solarConfig.systemCapacity * sf.totalInstalledCost;
    const totalSystemCostLocal = totalCapexLocal + solarCapexLocal;
    const effectiveRateLocal = computeEffectiveRate();
    const baselineDemandAnnualLocal = (tariff?.demandCharges?.rate ? tariff.demandCharges.rate : f.demandCharges) * calculateLightingDemandKWFor(f) * 12;
    const demandReductionPctLocal = (solarFinancial.incentives.utility.demandChargeReduction || 0) * 1.0;
    const annualDemandSavingsLocal = baselineDemandAnnualLocal * demandReductionPctLocal;
    const annualEnergySavingsLocal = samRes.annualEnergyProduction * effectiveRateLocal;
    const baselineAnnualCostLocal = opexItems.electricity + opexItems.hvacEnergy + baselineDemandAnnualLocal;
    const energySavingsLocal = Math.min(annualEnergySavingsLocal + annualDemandSavingsLocal, baselineAnnualCostLocal);
    const adjustedOpexLocal = {
      ...opexItems,
      electricity: Math.max(0, opexItems.electricity - energySavingsLocal * 0.7),
      hvacEnergy: Math.max(0, opexItems.hvacEnergy - energySavingsLocal * 0.3)
    };
    const baseAnnualRevenueLocal = f.canopyArea * f.yieldPerSqFt * f.cropCycles * (f.pricePerPound / 100);
    const sustainablePremiumLocal = (solarFinancial.greenhouse.cropValueIncrease || 0) * f.canopyArea * f.yieldPerSqFt * f.cropCycles;
    const yieldIncreaseLocal = baseAnnualRevenueLocal * ((solarFinancial.greenhouse.cropProductionIncrease || 0) / 100);
    const enhancedRevenueLocal = baseAnnualRevenueLocal + sustainablePremiumLocal + yieldIncreaseLocal;
    const totalAnnualOpexLocal = Object.values(adjustedOpexLocal).reduce((sum, cost) => sum + cost, 0);
    const netProfitLocal = enhancedRevenueLocal - totalAnnualOpexLocal;
    const annualLoanPaymentLocal = financingType === 'loan' ? calculateAnnualLoanPayment(totalCapexLocal * (1 - loanDownPaymentPct / 100), loanAPR, loanYears) : 0;
    const annualLeasePaymentY1Local = financingType === 'lease' ? leaseMonthly * 12 : 0;
    const netProfitAfterFinancingLocal = netProfitLocal - (financingType === 'loan' ? annualLoanPaymentLocal : financingType === 'lease' ? annualLeasePaymentY1Local : 0);
    const roiLocal = (netProfitAfterFinancingLocal / totalSystemCostLocal) * 100;
    const initialOutlayLocal = financingType === 'cash' ? totalSystemCostLocal : financingType === 'loan' ? (solarCapexLocal + totalCapexLocal * (loanDownPaymentPct / 100)) : solarCapexLocal;
    let npvLocal = -initialOutlayLocal;
    for (let year = 1; year <= 10; year++) {
      const infl = Math.pow(1 + solarFinancial.inflationRate / 100, year);
      const deg = Math.pow(1 - 0.005, year - 1);
      const yearlyRevenue = enhancedRevenueLocal * infl;
      const yearlyOpex = totalAnnualOpexLocal * infl;
      const yearlySolarSavings = samRes.annualEnergyProduction * effectiveRateLocal * deg * infl;
      const yearlyFinancePayment = financingType === 'loan' ? annualLoanPaymentLocal : financingType === 'lease' ? annualLeasePaymentY1Local * Math.pow(1 + leaseEscalationPct / 100, year - 1) : 0;
      const yearlyNet = yearlyRevenue - yearlyOpex + yearlySolarSavings - yearlyFinancePayment;
      npvLocal += yearlyNet / Math.pow(1 + solarFinancial.discountRate / 100, year);
    }
    const paybackLocal = totalSystemCostLocal / Math.max(netProfitAfterFinancingLocal, 1);
    return { id: s.id, name: s.name, roi: roiLocal, payback: paybackLocal, npv: npvLocal, netProfit: netProfitAfterFinancingLocal };
  };

  const analyzeAllScenarios = async () => {
    const results = await Promise.all(scenarios.map(s => analyzeScenario(s)));
    setScenarioResults(results);
  };

  const exportScenarioResultsCSV = () => {
    const headers = ['Scenario','ROI %','Payback (yrs)','NPV ($)','Net Profit ($)'];
    const rows = scenarioResults.map(r => [r.name, r.roi.toFixed(2), r.payback.toFixed(2), Math.round(r.npv).toString(), Math.round(r.netProfit).toString()]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Scenario_Comparison_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Format percentage
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  // Prepare chart data
  const cashFlowData = results?.samResults?.detailedCashFlow.map((cf, index) => ({
    year: cf.year,
    solarCashFlow: cf.netCashFlow,
    facilityCashFlow: results.tcoResults.netProfit,
    combinedCashFlow: cf.netCashFlow + results.tcoResults.netProfit,
    cumulativeCombined: (index === 0) ? 
      cf.netCashFlow + results.tcoResults.netProfit - results.integrated.totalSystemCost :
      0 // Would need proper cumulative calculation
  })) || [];

  const energyBreakdown = results ? [
    { name: 'Solar Production', value: results.samResults?.annualEnergyProduction || 0, color: '#fbbf24' },
    { name: 'Grid Consumption', value: calculateLightingEnergy() * 1.5 - (results.samResults?.annualEnergyProduction || 0), color: '#6b7280' },
  ] : [];

  const costBreakdown = results ? [
    { name: 'Facility CAPEX', value: results.tcoResults.totalCapex, color: '#3b82f6' },
    { name: 'Solar CAPEX', value: results.integrated.totalSystemCost - results.tcoResults.totalCapex, color: '#fbbf24' },
    { name: 'Annual OPEX', value: results.tcoResults.totalOpex, color: '#ef4444' },
  ] : [];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Integrated SAM-TCO Analysis</h2>
          <p className="text-muted-foreground">Comprehensive greenhouse financial planning with solar integration</p>
        </div>
        <Button 
          onClick={runIntegratedAnalysis} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="facility">Facility Setup</TabsTrigger>
          <TabsTrigger value="solar">Solar Config</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="rebates">Rebates</TabsTrigger>
          <TabsTrigger value="financing">Financing</TabsTrigger>
          <TabsTrigger value="utility">Utility Rates</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="facility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Greenhouse Facility Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="facilityKind">Facility Type</Label>
                  <select id="facilityKind" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    value={facility.facilityKind || 'greenhouse'}
                    onChange={(e) => setFacility(prev => ({ ...prev, facilityKind: e.target.value as any }))}
                    onBlur={(e) => {
                      const kind = e.target.value as any;
                      if (kind === 'greenhouse') setOpexItems(prev => ({ ...prev, hvacEnergy: 180000 }));
                      if (kind === 'indoor-single-tier') setOpexItems(prev => ({ ...prev, hvacEnergy: 420000 }));
                      if (kind === 'indoor-vertical') setOpexItems(prev => ({ ...prev, hvacEnergy: 520000 }));
                    }}
                  >
                    <option value="greenhouse">Greenhouse</option>
                    <option value="indoor-single-tier">Indoor (single-tier)</option>
                    <option value="indoor-vertical">Indoor (vertical)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="facilitySize">Facility Size (sq ft)</Label>
                  <Input
                    id="facilitySize"
                    type="number"
                    value={facility.size}
                    onChange={(e) => setFacility(prev => ({ ...prev, size: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="canopyArea">Canopy Area (sq ft)</Label>
                  <Input
                    id="canopyArea"
                    type="number"
                    value={facility.canopyArea}
                    onChange={(e) => setFacility(prev => ({ ...prev, canopyArea: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="currentElectricity">Current Electric Bill ($/year)</Label>
                  <Input
                    id="currentElectricity"
                    type="number"
                    value={facility.currentElectricityCost}
                    onChange={(e) => setFacility(prev => ({ ...prev, currentElectricityCost: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="utilityRate">Utility Rate ($/kWh)</Label>
                  <Input
                    id="utilityRate"
                    type="number"
                    step="0.01"
                    value={facility.utilityRate}
                    onChange={(e) => setFacility(prev => ({ ...prev, utilityRate: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cropPrice">Crop Price (¢/lb)</Label>
                  <Input
                    id="cropPrice"
                    type="number"
                    value={facility.pricePerPound}
                    onChange={(e) => setFacility(prev => ({ ...prev, pricePerPound: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="yieldPerSqFt">Yield (lbs/sq ft/cycle)</Label>
                  <Input
                    id="yieldPerSqFt"
                    type="number"
                    step="0.1"
                    value={facility.yieldPerSqFt}
                    onChange={(e) => setFacility(prev => ({ ...prev, yieldPerSqFt: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Planner (Crops/Configurations)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((s) => (
                  <div key={s.id} className={`p-4 rounded-lg border ${activeScenarioId === s.id ? 'border-green-600 bg-green-900/20' : 'border-gray-700 bg-gray-800'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{s.name}</div>
                      <Button variant={activeScenarioId === s.id ? 'default' : 'outline'} size="sm" onClick={() => { setActiveScenarioId(s.id); applyScenario(s.id); }}>Apply</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Label>Crop</Label>
                        <Input value={s.cropType} onChange={(e) => setScenarios(prev => prev.map(x => x.id === s.id ? { ...x, cropType: e.target.value } : x))} />
                      </div>
                      <div>
                        <Label>$/lb (¢)</Label>
                        <Input type="number" value={s.pricePerPound} onChange={(e) => setScenarios(prev => prev.map(x => x.id === s.id ? { ...x, pricePerPound: Number(e.target.value) } : x))} />
                      </div>
                      <div>
                        <Label>Yield (lb/sqft/cycle)</Label>
                        <Input type="number" step="0.01" value={s.yieldPerSqFt} onChange={(e) => setScenarios(prev => prev.map(x => x.id === s.id ? { ...x, yieldPerSqFt: Number(e.target.value) } : x))} />
                      </div>
                      <div>
                        <Label>Photoperiod (h)</Label>
                        <Input type="number" value={s.photoperiod} onChange={(e) => setScenarios(prev => prev.map(x => x.id === s.id ? { ...x, photoperiod: Number(e.target.value) } : x))} />
                      </div>
                      <div>
                        <Label>Tiers</Label>
                        <Input type="number" value={s.tiers} onChange={(e) => setScenarios(prev => prev.map(x => x.id === s.id ? { ...x, tiers: Number(e.target.value) } : x))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => {
                  const id = `s${Date.now()}`;
                  setScenarios(prev => [...prev, { id, name: `New Scenario ${prev.length + 1}`, cropType: 'New Crop', pricePerPound: 200, yieldPerSqFt: 0.5, photoperiod: 16, tiers: 1 }]);
                }}>Add Scenario</Button>
                <Button variant="outline" onClick={() => {
                  const base = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
                  if (!base) return;
                  const id = `s${Date.now()}`;
                  const clone = { ...base, id, name: `${base.name} (copy)` };
                  setScenarios(prev => [...prev, clone]);
                }}>Duplicate Current</Button>
                <Button variant="outline" onClick={() => {
                  setScenarios(prev => prev.filter(s => s.id !== activeScenarioId));
                  const next = scenarios.find(s => s.id !== activeScenarioId);
                  if (next) { setActiveScenarioId(next.id); applyScenario(next.id); }
                }}>Remove Active</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">Compute and export ROI/NPV for each scenario</div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={analyzeAllScenarios}>Analyze All</Button>
                  <Button size="sm" variant="outline" onClick={exportScenarioResultsCSV} disabled={scenarioResults.length === 0}>Export CSV</Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-2">Scenario</th>
                      <th className="text-right p-2">$/lb (¢)</th>
                      <th className="text-right p-2">Yield</th>
                      <th className="text-right p-2">Photoperiod</th>
                      <th className="text-right p-2">Tiers</th>
                      <th className="text-right p-2">ROI %</th>
                      <th className="text-right p-2">Payback</th>
                      <th className="text-right p-2">NPV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(s => {
                      const r = scenarioResults.find(x => x.id === s.id);
                      return (
                        <tr key={s.id} className="border-b border-gray-800">
                          <td className="p-2">{s.name}</td>
                          <td className="text-right p-2">{s.pricePerPound}</td>
                          <td className="text-right p-2">{s.yieldPerSqFt.toFixed(2)}</td>
                          <td className="text-right p-2">{s.photoperiod}</td>
                          <td className="text-right p-2">{s.tiers}</td>
                          <td className="text-right p-2">{r ? r.roi.toFixed(1) : '-'}</td>
                          <td className="text-right p-2">{r ? r.payback.toFixed(1) : '-'}</td>
                          <td className="text-right p-2">{r ? formatCurrency(r.npv) : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="solar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Solar System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="systemCapacity">System Capacity (kW)</Label>
                  <Input
                    id="systemCapacity"
                    type="number"
                    value={solarConfig.systemCapacity}
                    onChange={(e) => setSolarConfig(prev => ({ ...prev, systemCapacity: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="systemCost">System Cost ($/kW)</Label>
                  <Input
                    id="systemCost"
                    type="number"
                    value={solarFinancial.totalInstalledCost}
                    onChange={(e) => setSolarFinancial(prev => ({ ...prev, totalInstalledCost: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="shadingFactor">Greenhouse Shading Factor</Label>
                  <Input
                    id="shadingFactor"
                    type="number"
                    step="0.01"
                    value={solarConfig.shadingFactor}
                    onChange={(e) => setSolarConfig(prev => ({ ...prev, shadingFactor: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Operating Expenses (Annual)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="labor">Labor</Label>
                      <Input id="labor" type="number" value={opexItems.labor} onChange={(e) => setOpexItems(prev => ({ ...prev, labor: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="electricity">Electricity (pre-solar)</Label>
                      <Input id="electricity" type="number" value={opexItems.electricity} onChange={(e) => setOpexItems(prev => ({ ...prev, electricity: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="hvacEnergy">HVAC Energy</Label>
                      <Input id="hvacEnergy" type="number" value={opexItems.hvacEnergy} onChange={(e) => setOpexItems(prev => ({ ...prev, hvacEnergy: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="water">Water</Label>
                      <Input id="water" type="number" value={opexItems.water} onChange={(e) => setOpexItems(prev => ({ ...prev, water: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="wastewater">Wastewater</Label>
                      <Input id="wastewater" type="number" value={opexItems.wastewater} onChange={(e) => setOpexItems(prev => ({ ...prev, wastewater: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="nutrients">Nutrients</Label>
                      <Input id="nutrients" type="number" value={opexItems.nutrients} onChange={(e) => setOpexItems(prev => ({ ...prev, nutrients: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="growingMedia">Growing Media</Label>
                      <Input id="growingMedia" type="number" value={opexItems.growingMedia} onChange={(e) => setOpexItems(prev => ({ ...prev, growingMedia: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="packaging">Packaging</Label>
                      <Input id="packaging" type="number" value={opexItems.packaging} onChange={(e) => setOpexItems(prev => ({ ...prev, packaging: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="maintenance">Maintenance</Label>
                      <Input id="maintenance" type="number" value={opexItems.maintenance} onChange={(e) => setOpexItems(prev => ({ ...prev, maintenance: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="insurance">Insurance</Label>
                      <Input id="insurance" type="number" value={opexItems.insurance} onChange={(e) => setOpexItems(prev => ({ ...prev, insurance: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="leaseOrRent">Lease/Rent</Label>
                      <Input id="leaseOrRent" type="number" value={opexItems.leaseOrRent} onChange={(e) => setOpexItems(prev => ({ ...prev, leaseOrRent: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="propertyTax">Property Tax</Label>
                      <Input id="propertyTax" type="number" value={opexItems.propertyTax} onChange={(e) => setOpexItems(prev => ({ ...prev, propertyTax: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="administrative">Administrative</Label>
                      <Input id="administrative" type="number" value={opexItems.administrative} onChange={(e) => setOpexItems(prev => ({ ...prev, administrative: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="complianceTesting">Compliance/Testing</Label>
                      <Input id="complianceTesting" type="number" value={opexItems.complianceTesting} onChange={(e) => setOpexItems(prev => ({ ...prev, complianceTesting: Number(e.target.value) }))} />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="other">Other</Label>
                      <Input id="other" type="number" value={opexItems.other} onChange={(e) => setOpexItems(prev => ({ ...prev, other: Number(e.target.value) }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Solar Incentives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="itc">Federal ITC (%)</Label>
                      <Input id="itc" type="number" value={solarFinancial.incentives.federal.itc} onChange={(e) => setSolarFinancial(prev => ({
                        ...prev,
                        incentives: { ...prev.incentives, federal: { ...prev.incentives.federal, itc: Number(e.target.value) } }
                      }))} />
                    </div>
                    <div>
                      <Label htmlFor="stateRebate">State Rebate ($/kW)</Label>
                      <Input id="stateRebate" type="number" value={solarFinancial.incentives.state.rebate || 0} onChange={(e) => setSolarFinancial(prev => ({
                        ...prev,
                        incentives: { ...prev.incentives, state: { ...prev.incentives.state, rebate: Number(e.target.value) } }
                      }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Capital Expenditures (One-Time)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="equipment">Equipment</Label>
                      <Input id="equipment" type="number" value={capexItems.equipment} onChange={(e) => setCapexItems(prev => ({ ...prev, equipment: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="installation">Installation</Label>
                      <Input id="installation" type="number" value={capexItems.installation} onChange={(e) => setCapexItems(prev => ({ ...prev, installation: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="controlsAndSensors">Controls & Sensors</Label>
                      <Input id="controlsAndSensors" type="number" value={capexItems.controlsAndSensors} onChange={(e) => setCapexItems(prev => ({ ...prev, controlsAndSensors: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="electricalUpgrades">Electrical Upgrades</Label>
                      <Input id="electricalUpgrades" type="number" value={capexItems.electricalUpgrades} onChange={(e) => setCapexItems(prev => ({ ...prev, electricalUpgrades: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="structuralImprovements">Structural Improvements</Label>
                      <Input id="structuralImprovements" type="number" value={capexItems.structuralImprovements} onChange={(e) => setCapexItems(prev => ({ ...prev, structuralImprovements: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="automationSystems">Automation Systems</Label>
                      <Input id="automationSystems" type="number" value={capexItems.automationSystems} onChange={(e) => setCapexItems(prev => ({ ...prev, automationSystems: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="itNetworking">IT/Networking</Label>
                      <Input id="itNetworking" type="number" value={capexItems.itNetworking} onChange={(e) => setCapexItems(prev => ({ ...prev, itNetworking: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="designEngineering">Design & Engineering</Label>
                      <Input id="designEngineering" type="number" value={capexItems.designEngineering} onChange={(e) => setCapexItems(prev => ({ ...prev, designEngineering: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="permittingFees">Permitting Fees</Label>
                      <Input id="permittingFees" type="number" value={capexItems.permittingFees} onChange={(e) => setCapexItems(prev => ({ ...prev, permittingFees: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="contingency">Contingency</Label>
                      <Input id="contingency" type="number" value={capexItems.contingency} onChange={(e) => setCapexItems(prev => ({ ...prev, contingency: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="salesTax">Sales Tax</Label>
                      <Input id="salesTax" type="number" value={capexItems.salesTax} onChange={(e) => setCapexItems(prev => ({ ...prev, salesTax: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label htmlFor="capexOther">Other</Label>
                      <Input id="capexOther" type="number" value={capexItems.other} onChange={(e) => setCapexItems(prev => ({ ...prev, other: Number(e.target.value) }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        <TabsContent value="rebates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rebates & Incentives Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rebateState">State</Label>
                  <select id="rebateState" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    value={rebateState} onChange={(e) => setRebateState(e.target.value)}>
                    {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="fixtures">Fixtures</Label>
                  <Input id="fixtures" type="number" value={lightingProject.fixtures}
                    onChange={(e) => setLightingProject(prev => ({ ...prev, fixtures: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label htmlFor="wattsPerFixture">Watts per Fixture (LED)</Label>
                  <Input id="wattsPerFixture" type="number" value={lightingProject.wattsPerFixture}
                    onChange={(e) => setLightingProject(prev => ({ ...prev, wattsPerFixture: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label htmlFor="replacingWatts">Replacing Watts (e.g., HPS 1000W)</Label>
                  <Input id="replacingWatts" type="number" value={lightingProject.replacingWatts}
                    onChange={(e) => setLightingProject(prev => ({ ...prev, replacingWatts: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label htmlFor="dailyHours">Daily Hours</Label>
                  <Input id="dailyHours" type="number" value={lightingProject.dailyHours}
                    onChange={(e) => setLightingProject(prev => ({ ...prev, dailyHours: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label htmlFor="installCost">Project Installation Cost</Label>
                  <Input id="installCost" type="number" value={lightingProject.installationCost}
                    onChange={(e) => setLightingProject(prev => ({ ...prev, installationCost: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => {
                  const programs = utilityRebateDatabase.filter(p => p.state === rebateState);
                  const analysis = rebateCalc.calculateComprehensiveSavings({ ...lightingProject }, programs);
                  setRebateAnalysis(analysis);
                  setRebateEstimate(analysis.totalRebates);
                }}>Estimate Rebates</Button>
                {rebateEstimate > 0 && (
                  <div className="text-sm text-green-400 flex items-center">Estimated Rebates: <span className="font-bold ml-2">{formatCurrency(rebateEstimate)}</span></div>
                )}
              </div>
              {rebateAnalysis && rebateAnalysis.rebateDetails?.length > 0 && (
                <div className="mt-2 text-sm text-gray-300">
                  Top Programs:
                  <ul className="list-disc ml-5 mt-1">
                    {rebateAnalysis.rebateDetails.slice(0,3).map((r, idx) => (
                      <li key={idx}>{r.programName}: <span className="text-green-400">{formatCurrency(r.amount)}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financing Options (Non-Solar CAPEX)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <Label htmlFor="finType">Type</Label>
                  <select id="finType" className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    value={financingType} onChange={(e) => setFinancingType(e.target.value as FinancingType)}>
                    <option value="cash">Cash</option>
                    <option value="loan">Loan</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>
                {financingType === 'loan' && (
                  <>
                    <div>
                      <Label htmlFor="apr">APR (%)</Label>
                      <Input id="apr" type="number" step="0.1" value={loanAPR} onChange={(e) => setLoanAPR(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label htmlFor="years">Term (years)</Label>
                      <Input id="years" type="number" value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label htmlFor="down">Down Payment (%)</Label>
                      <Input id="down" type="number" step="1" value={loanDownPaymentPct} onChange={(e) => setLoanDownPaymentPct(Number(e.target.value))} />
                    </div>
                  </>
                )}
                {financingType === 'lease' && (
                  <>
                    <div>
                      <Label htmlFor="leaseMonthly">Monthly Payment ($)</Label>
                      <Input id="leaseMonthly" type="number" value={leaseMonthly} onChange={(e) => setLeaseMonthly(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label htmlFor="leaseEsc">Escalation (%/yr)</Label>
                      <Input id="leaseEsc" type="number" step="0.1" value={leaseEscalationPct} onChange={(e) => setLeaseEscalationPct(Number(e.target.value))} />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Utility Tariff & TOU</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Provider</Label>
                  <select className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    value={utilityProvider} onChange={(e) => setUtilityProvider(e.target.value)}>
                    <option value="generic">Generic</option>
                    <option value="pge">PG&E</option>
                    <option value="sce">SCE</option>
                    <option value="coned">Con Edison</option>
                    <option value="duke">Duke</option>
                  </select>
                </div>
                <div>
                  <Label>Account ID</Label>
                  <Input value={utilityAccountId} onChange={(e) => setUtilityAccountId(e.target.value)} />
                </div>
                <div>
                  <Label>API Key (optional)</Label>
                  <Input value={utilityApiKey} onChange={(e) => setUtilityApiKey(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchTariff} disabled={utilityLoading}>{utilityLoading ? 'Fetching…' : 'Fetch Tariff'}</Button>
                </div>
              </div>
              {tariff && (
                <div className="text-sm text-gray-300 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>Current Rate: <span className="text-white font-medium">{tariff.currentRate.toFixed(3)}</span> $/kWh</div>
                  <div>TOU (On/Mid/Off): <span className="text-white font-medium">{tariff.timeOfUse.onPeak.toFixed(2)}/{tariff.timeOfUse.midPeak.toFixed(2)}/{tariff.timeOfUse.offPeak.toFixed(2)}</span> $/kWh</div>
                  <div>Demand Charge: <span className="text-white font-medium">{tariff.demandCharges.rate.toFixed(2)}</span> $/kW</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results ? (
            <>
              {/* Key Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Combined ROI</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPercent(results.integrated.combinedROI)}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Energy Savings</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.integrated.energySavings)}/yr
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Payback Period</p>
                        <p className="text-2xl font-bold">
                          {results.integrated.combinedPayback.toFixed(1)} years
                        </p>
                      </div>
                      <Calculator className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Carbon Reduction</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(results.integrated.carbonFootprintReduction).toLocaleString()} kg/yr
                        </p>
                      </div>
                      <Leaf className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        >
                          {costBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Energy Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={energyBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${Math.round(value).toLocaleString()} kWh`}
                        >
                          {energyBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${Math.round(value).toLocaleString()} kWh`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Combined Financial Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>10-Year Financial Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">10-Year NPV</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(results.integrated.combinedNPV)}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Energy Offset</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPercent(results.integrated.energyOffsetRatio)}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Annual Net Profit</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(results.tcoResults.netProfit)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DuPont Financial Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    DuPont Financial Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* DuPont Formula Visual */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">DuPont Identity: ROE Breakdown</h4>
                      <p className="text-sm text-gray-600 mt-1">ROE = Profit Margin × Asset Turnover × Financial Leverage</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                      <div className="text-center">
                        <div className="bg-blue-100 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Profit Margin</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {results.dupontAnalysis.profitMargin.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Net Income ÷ Sales</p>
                        </div>
                        <Badge className={`mt-2 ${
                          results.dupontAnalysis.strengthsWeaknesses.profitabilityRating === 'Excellent' ? 'bg-green-100 text-green-800' :
                          results.dupontAnalysis.strengthsWeaknesses.profitabilityRating === 'Good' ? 'bg-blue-100 text-blue-800' :
                          results.dupontAnalysis.strengthsWeaknesses.profitabilityRating === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {results.dupontAnalysis.strengthsWeaknesses.profitabilityRating}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">×</p>
                      </div>

                      <div className="text-center">
                        <div className="bg-green-100 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Asset Turnover</p>
                          <p className="text-2xl font-bold text-green-600">
                            {results.dupontAnalysis.assetTurnover.toFixed(2)}x
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Sales ÷ Assets</p>
                        </div>
                        <Badge className={`mt-2 ${
                          results.dupontAnalysis.strengthsWeaknesses.efficiencyRating === 'Excellent' ? 'bg-green-100 text-green-800' :
                          results.dupontAnalysis.strengthsWeaknesses.efficiencyRating === 'Good' ? 'bg-blue-100 text-blue-800' :
                          results.dupontAnalysis.strengthsWeaknesses.efficiencyRating === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {results.dupontAnalysis.strengthsWeaknesses.efficiencyRating}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">×</p>
                      </div>

                      <div className="text-center">
                        <div className="bg-purple-100 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">Financial Leverage</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {results.dupontAnalysis.financialLeverage.toFixed(2)}x
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Assets ÷ Equity</p>
                        </div>
                        <Badge className={`mt-2 ${
                          results.dupontAnalysis.strengthsWeaknesses.leverageRating === 'Conservative' ? 'bg-green-100 text-green-800' :
                          results.dupontAnalysis.strengthsWeaknesses.leverageRating === 'Moderate' ? 'bg-blue-100 text-blue-800' :
                          results.dupontAnalysis.strengthsWeaknesses.leverageRating === 'Aggressive' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {results.dupontAnalysis.strengthsWeaknesses.leverageRating}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">=</p>
                      </div>

                      <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg border-2 border-blue-200">
                          <p className="text-sm text-gray-600">Return on Equity</p>
                          <p className="text-3xl font-bold text-gray-800">
                            {results.dupontAnalysis.returnOnEquity.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">ROE</p>
                        </div>
                        <Badge className={`mt-2 ${
                          results.dupontAnalysis.strengthsWeaknesses.overallRating === 'Excellent' ? 'bg-green-100 text-green-800' :
                          results.dupontAnalysis.strengthsWeaknesses.overallRating === 'Good' ? 'bg-blue-100 text-blue-800' :
                          results.dupontAnalysis.strengthsWeaknesses.overallRating === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {results.dupontAnalysis.strengthsWeaknesses.overallRating} Overall
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-3">Key Financial Metrics</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Return on Assets (ROA)</span>
                          <span className="font-semibold">{results.dupontAnalysis.returnOnAssets.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Assets</span>
                          <span className="font-semibold">{formatCurrency(results.dupontAnalysis.totalAssets)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Equity</span>
                          <span className="font-semibold">{formatCurrency(results.dupontAnalysis.totalEquity)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual Sales</span>
                          <span className="font-semibold">{formatCurrency(results.dupontAnalysis.annualSales)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-800 mb-3">Performance Recommendations</h5>
                      <div className="space-y-2">
                        {results.dupontAnalysis.strengthsWeaknesses.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">{recommendation}</p>
                          </div>
                        ))}
                        {results.dupontAnalysis.strengthsWeaknesses.recommendations.length === 0 && (
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Excellent financial performance across all metrics!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>DuPont Analysis</strong> breaks down Return on Equity (ROE) into three key components to identify strengths and areas for improvement. 
                      This analysis helps optimize profitability (profit margin), efficiency (asset turnover), and capital structure (financial leverage) for maximum returns.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Run analysis to see integrated results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {results ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>With vs Without Solar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Annual Electricity Cost</span>
                      <div className="text-right">
                        <div className="line-through text-gray-500">{formatCurrency(opexItems.electricity)}</div>
                        <div className="text-green-600 font-bold">{formatCurrency(opexItems.electricity - results.integrated.energySavings)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span>Total System Investment</span>
                      <div className="text-right">
                        <div className="text-gray-500">{formatCurrency(results.tcoResults.totalCapex)}</div>
                        <div className="text-blue-600 font-bold">{formatCurrency(results.integrated.totalSystemCost)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="font-semibold">Net Annual Savings</span>
                      <div className="text-green-600 font-bold text-xl">
                        {formatCurrency(results.integrated.energySavings)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sustainability Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-green-500" />
                        <span>CO₂ Reduction</span>
                      </div>
                      <span className="font-bold text-green-600">
                        {Math.round(results.integrated.carbonFootprintReduction)} kg/year
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div className="flex items-center gap-2">
                        <Sun className="w-5 h-5 text-blue-500" />
                        <span>Solar Energy</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {Math.round(results.samResults?.annualEnergyProduction || 0).toLocaleString()} kWh/year
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-purple-500" />
                        <span>Energy Independence</span>
                      </div>
                      <span className="font-bold text-purple-600">
                        {formatPercent(results.integrated.energyOffsetRatio)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Run analysis to see comparison data</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}