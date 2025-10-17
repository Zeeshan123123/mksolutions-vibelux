/**
 * Enhanced Equipment Leasing Calculator
 * Integrates Unified Financial Engine for sensitivity analysis and risk assessment
 */

"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  DollarSign,
  Calendar,
  TrendingUp,
  CreditCard,
  FileText,
  PiggyBank,
  BarChart3,
  Info,
  Building2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

import { FinancialAnalysisWrapper } from './financial/FinancialAnalysisWrapper'
import { FinancialScenario } from '@/lib/financial/unified-financial-engine'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Equipment {
  name: string
  cost: number
  category: string
  lifespan: number // years
  maintenanceCost: number // annual
  productivityGain?: number // % improvement
}

interface CompanyProfile {
  creditScore: 'excellent' | 'good' | 'fair'
  companyAge: number
  annualRevenue: number
  cashReserves: number
  taxRate: number
  costOfCapital: number // discount rate
}

interface LeaseTerms {
  provider: string
  term: number // months
  rate: number // annual %
  downPayment: number // %
  structure: 'capital' | 'operating' | 'fair-market-value'
  earlyBuyout: boolean
  maintenanceIncluded: boolean
}

export default function EnhancedEquipmentLeasingCalculator() {
  const [equipment, setEquipment] = useState<Equipment>({
    name: 'Advanced LED Grow Light System',
    cost: 250000,
    category: 'Lighting',
    lifespan: 10,
    maintenanceCost: 5000,
    productivityGain: 15 // 15% yield improvement
  })
  
  const [company, setCompany] = useState<CompanyProfile>({
    creditScore: 'excellent',
    companyAge: 5,
    annualRevenue: 1000000,
    cashReserves: 200000,
    taxRate: 25,
    costOfCapital: 8
  })

  const [analysisYears] = useState(7) // Typical lease analysis period
  const [financialScenarios, setFinancialScenarios] = useState<FinancialScenario[]>([])

  const equipmentOptions: Equipment[] = [
    { 
      name: 'Advanced LED Grow Light System', 
      cost: 250000, 
      category: 'Lighting', 
      lifespan: 10,
      maintenanceCost: 5000,
      productivityGain: 15
    },
    { 
      name: 'AI Climate Control System', 
      cost: 150000, 
      category: 'HVAC', 
      lifespan: 15,
      maintenanceCost: 3000,
      productivityGain: 10
    },
    { 
      name: 'Precision Fertigation System', 
      cost: 100000, 
      category: 'Irrigation', 
      lifespan: 12,
      maintenanceCost: 2000,
      productivityGain: 12
    },
    { 
      name: 'Automated Transplant System', 
      cost: 175000, 
      category: 'Automation', 
      lifespan: 8,
      maintenanceCost: 4000,
      productivityGain: 25
    }
  ]

  // Generate lease options with different providers
  const generateLeaseOptions = (): LeaseTerms[] => {
    const baseRate = company.creditScore === 'excellent' ? 4.5 : 
                    company.creditScore === 'good' ? 6.5 : 8.5
    
    return [
      {
        provider: 'AgriFinance Pro',
        term: 36,
        rate: baseRate,
        downPayment: 10,
        structure: 'capital',
        earlyBuyout: true,
        maintenanceIncluded: false
      },
      {
        provider: 'GreenTech Capital',
        term: 48,
        rate: baseRate + 0.5,
        downPayment: 5,
        structure: 'operating',
        earlyBuyout: false,
        maintenanceIncluded: true
      },
      {
        provider: 'Equipment Direct',
        term: 60,
        rate: baseRate + 1,
        downPayment: 0,
        structure: 'fair-market-value',
        earlyBuyout: true,
        maintenanceIncluded: false
      },
      {
        provider: 'FlexLease Solutions',
        term: 24,
        rate: baseRate - 0.5,
        downPayment: 15,
        structure: 'capital',
        earlyBuyout: true,
        maintenanceIncluded: false
      }
    ]
  }

  // Convert lease options to financial scenarios
  useEffect(() => {
    const leaseOptions = generateLeaseOptions()
    
    // Create scenarios for lease vs buy comparison
    const scenarios: FinancialScenario[] = [
      // Cash purchase scenario
      {
        id: 'cash-purchase',
        name: 'Cash Purchase',
        description: 'Buy equipment outright using cash reserves',
        assumptions: {
          initialInvestment: equipment.cost,
          revenue: equipment.productivityGain ? [{
            name: 'Productivity Gains',
            annualAmount: company.annualRevenue * (equipment.productivityGain / 100),
            growthRate: 2
          }] : [],
          operatingCosts: [
            {
              name: 'Maintenance',
              annualAmount: equipment.maintenanceCost,
              inflationRate: 3
            },
            {
              name: 'Opportunity Cost',
              annualAmount: equipment.cost * (company.costOfCapital / 100),
              isFixed: true
            }
          ],
          discountRate: company.costOfCapital,
          taxRate: company.taxRate,
          analysisYears,
          riskFactors: [
            {
              name: 'Equipment Obsolescence',
              category: 'operational',
              impact: 'medium',
              probability: 30,
              financialImpact: equipment.cost * 0.2,
              mitigation: 'Technology refresh planning'
            },
            {
              name: 'Cash Flow Impact',
              category: 'financial',
              impact: 'high',
              probability: 50,
              financialImpact: equipment.cost * (company.costOfCapital / 100)
            }
          ]
        },
        recommended: company.cashReserves > equipment.cost * 1.5
      },
      
      // Lease scenarios
      ...leaseOptions.map(lease => {
        const monthlyPayment = calculateMonthlyPayment(
          equipment.cost * (1 - lease.downPayment / 100),
          lease.rate / 100 / 12,
          lease.term
        )
        
        return {
          id: `lease-${lease.provider.toLowerCase().replace(/\s+/g, '-')}`,
          name: `Lease: ${lease.provider}`,
          description: `${lease.term}-month ${lease.structure} lease @ ${lease.rate}%`,
          assumptions: {
            initialInvestment: equipment.cost * (lease.downPayment / 100),
            revenue: equipment.productivityGain ? [{
              name: 'Productivity Gains',
              annualAmount: company.annualRevenue * (equipment.productivityGain / 100),
              growthRate: 2
            }] : [],
            operatingCosts: [
              {
                name: 'Lease Payments',
                annualAmount: monthlyPayment * 12,
                isFixed: true,
                endYear: Math.ceil(lease.term / 12)
              },
              {
                name: 'Maintenance',
                annualAmount: lease.maintenanceIncluded ? 0 : equipment.maintenanceCost,
                inflationRate: 3
              }
            ],
            additionalInvestments: lease.structure === 'fair-market-value' ? [{
              year: Math.ceil(lease.term / 12),
              value: equipment.cost * 0.2 // Assume 20% FMV buyout
            }] : [],
            discountRate: company.costOfCapital,
            taxRate: company.taxRate,
            analysisYears,
            riskFactors: [
              {
                name: 'Early Termination Penalty',
                category: 'financial',
                impact: lease.earlyBuyout ? 'low' : 'high',
                probability: 15,
                financialImpact: monthlyPayment * 6
              },
              {
                name: 'Lease Rate Adjustment',
                category: 'financial',
                impact: 'medium',
                probability: lease.term > 36 ? 25 : 10,
                financialImpact: monthlyPayment * 12 * 0.1
              }
            ]
          },
          recommended: lease.term === 36 && company.cashReserves < equipment.cost
        } as FinancialScenario
      })
    ]
    
    setFinancialScenarios(scenarios)
  }, [equipment, company, analysisYears])

  // Calculate monthly payment
  const calculateMonthlyPayment = (principal: number, monthlyRate: number, months: number): number => {
    if (monthlyRate === 0) return principal / months
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1)
  }

  // Calculate tax benefits comparison
  const calculateTaxBenefits = () => {
    const cashPurchase = {
      depreciation: equipment.cost / equipment.lifespan,
      section179: Math.min(equipment.cost, 1050000), // 2023 limit
      yearlyBenefit: (equipment.cost / equipment.lifespan) * (company.taxRate / 100)
    }
    
    const lease = {
      deduction: calculateMonthlyPayment(equipment.cost * 0.9, 0.06 / 12, 48) * 12,
      yearlyBenefit: calculateMonthlyPayment(equipment.cost * 0.9, 0.06 / 12, 48) * 12 * (company.taxRate / 100)
    }
    
    return { cashPurchase, lease }
  }

  // Custom leasing-specific tabs
  const customLeasingTabs = (
    <>
      <TabsContent value="tax-benefits" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Tax Benefits Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const taxBenefits = calculateTaxBenefits()
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Cash Purchase Tax Benefits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Section 179 Deduction:</span>
                        <span className="font-medium">${taxBenefits.cashPurchase.section179.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Depreciation:</span>
                        <span className="font-medium">${taxBenefits.cashPurchase.depreciation.toLocaleString()}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Year 1 Tax Savings:</span>
                        <span className="text-green-600">
                          ${(taxBenefits.cashPurchase.section179 * (company.taxRate / 100)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Lease Tax Benefits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Annual Lease Deduction:</span>
                        <span className="font-medium">${taxBenefits.lease.deduction.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax Rate:</span>
                        <span className="font-medium">{company.taxRate}%</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Annual Tax Savings:</span>
                        <span className="text-green-600">${taxBenefits.lease.yearlyBenefit.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Tax benefits vary based on your specific situation. 
            Section 179 allows immediate expensing of equipment purchases up to annual limits. 
            Consult with a tax professional for accurate calculations.
          </AlertDescription>
        </Alert>
      </TabsContent>

      <TabsContent value="cash-flow" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cash Flow Impact Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getCashFlowComparison()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="cashPurchase" stroke="#ef4444" name="Cash Purchase" strokeWidth={2} />
                <Line type="monotone" dataKey="lease36" stroke="#3b82f6" name="36-Month Lease" strokeWidth={2} />
                <Line type="monotone" dataKey="lease60" stroke="#10b981" name="60-Month Lease" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cash Reserve Impact</p>
                  <p className="text-2xl font-bold text-red-600">
                    -${equipment.cost.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Immediate</p>
                </div>
                <PiggyBank className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Lease Payment</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${Math.round(calculateMonthlyPayment(equipment.cost * 0.9, 0.05 / 12, 48)).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">48 months</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cash Flow Advantage</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(equipment.cost - equipment.cost * 0.1).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Preserved capital</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="decision-matrix" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Decision Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getDecisionFactors().map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{factor.name}</span>
                    <div className="flex gap-2">
                      <Badge variant={factor.cashScore >= 4 ? "default" : "secondary"}>
                        Cash: {factor.cashScore}/5
                      </Badge>
                      <Badge variant={factor.leaseScore >= 4 ? "default" : "secondary"}>
                        Lease: {factor.leaseScore}/5
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  )

  // Get cash flow comparison data
  const getCashFlowComparison = () => {
    const months = Array.from({ length: 60 }, (_, i) => ({
      month: i + 1,
      cashPurchase: i === 0 ? -equipment.cost : 0,
      lease36: i < 36 ? -calculateMonthlyPayment(equipment.cost * 0.9, 0.045 / 12, 36) : 0,
      lease60: i < 60 ? -calculateMonthlyPayment(equipment.cost, 0.055 / 12, 60) : 0
    }))
    
    // Calculate cumulative cash flow
    let cashCumulative = 0
    let lease36Cumulative = -equipment.cost * 0.1 // Down payment
    let lease60Cumulative = 0
    
    return months.map(month => {
      cashCumulative += month.cashPurchase
      lease36Cumulative += month.lease36
      lease60Cumulative += month.lease60
      
      return {
        ...month,
        cashPurchase: cashCumulative,
        lease36: lease36Cumulative,
        lease60: lease60Cumulative
      }
    })
  }

  // Get decision factors
  const getDecisionFactors = () => [
    {
      name: 'Cash Flow Preservation',
      description: 'Ability to maintain working capital for operations',
      cashScore: company.cashReserves > equipment.cost * 2 ? 3 : 1,
      leaseScore: 5
    },
    {
      name: 'Total Cost',
      description: 'Overall financial impact including interest and fees',
      cashScore: 5,
      leaseScore: 3
    },
    {
      name: 'Tax Benefits',
      description: 'Immediate vs. spread deductions',
      cashScore: 4,
      leaseScore: 4
    },
    {
      name: 'Technology Risk',
      description: 'Protection against obsolescence',
      cashScore: 2,
      leaseScore: 4
    },
    {
      name: 'Flexibility',
      description: 'Ability to upgrade or change equipment',
      cashScore: 2,
      leaseScore: 5
    }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Equipment Leasing Analysis</h2>
          <p className="text-muted-foreground">
            Advanced lease vs. buy decision analysis with sensitivity modeling
          </p>
        </div>
        <Badge className="bg-purple-100 text-purple-800">
          <Calculator className="w-3 h-3 mr-1" />
          Enhanced Analysis
        </Badge>
      </div>

      {/* Equipment & Company Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Equipment Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="equipment">Equipment Type</Label>
              <Select value={equipment.name} onValueChange={(value) => {
                const selected = equipmentOptions.find(e => e.name === value)
                if (selected) setEquipment(selected)
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {equipmentOptions.map(eq => (
                    <SelectItem key={eq.name} value={eq.name}>
                      {eq.name} - ${eq.cost.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Equipment Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  value={equipment.cost}
                  onChange={(e) => setEquipment(prev => ({ ...prev, cost: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="lifespan">Lifespan (years)</Label>
                <Input
                  id="lifespan"
                  type="number"
                  value={equipment.lifespan}
                  onChange={(e) => setEquipment(prev => ({ ...prev, lifespan: Number(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credit">Credit Score</Label>
                <Select value={company.creditScore} onValueChange={(value: any) => 
                  setCompany(prev => ({ ...prev, creditScore: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (750+)</SelectItem>
                    <SelectItem value="good">Good (650-749)</SelectItem>
                    <SelectItem value="fair">Fair (550-649)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reserves">Cash Reserves</Label>
                <Input
                  id="reserves"
                  type="number"
                  value={company.cashReserves}
                  onChange={(e) => setCompany(prev => ({ ...prev, cashReserves: Number(e.target.value) }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={company.annualRevenue}
                  onChange={(e) => setCompany(prev => ({ ...prev, annualRevenue: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={company.taxRate}
                  onChange={(e) => setCompany(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analysis Wrapper with custom tabs */}
      <FinancialAnalysisWrapper
        scenarios={financialScenarios}
        showMonteCarloTab={true}
        showSensitivityTab={true}
        customTabs={customLeasingTabs}
      />

      {/* Key Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {company.cashReserves < equipment.cost * 0.5 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cash Flow Consideration:</strong> With cash reserves below 50% of equipment cost, 
                  leasing provides better cash flow management and preserves working capital for operations.
                </AlertDescription>
              </Alert>
            )}
            
            {equipment.lifespan <= 5 && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Technology Risk:</strong> For equipment with shorter lifespans ({equipment.lifespan} years), 
                  operating leases provide flexibility to upgrade to newer technology without ownership risk.
                </AlertDescription>
              </Alert>
            )}
            
            {company.creditScore === 'excellent' && (
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  <strong>Financing Advantage:</strong> Your excellent credit score qualifies you for premium 
                  lease rates. Consider negotiating terms with multiple providers for best rates.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}