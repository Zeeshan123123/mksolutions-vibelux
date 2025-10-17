/**
 * Procurement Dashboard
 * Professional procurement management interface for construction projects
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Truck,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Clock,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from '@/components/ui/progress';
import { 
  ProcurementManager, 
  ProcurementPlan,
  PurchaseOrder,
  POStatus,
  VendorProfile,
  MaterialShortage,
  ScheduledDelivery,
  ProcurementAnalytics
} from '@/lib/construction/procurement-manager';

interface ProcurementDashboardProps {
  projectName: string;
  budget: number;
}

export function ProcurementDashboard({ projectName, budget }: ProcurementDashboardProps) {
  const [procurementManager] = useState(() => new ProcurementManager(projectName, budget));
  const [procurementPlan, setProcurementPlan] = useState<ProcurementPlan | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Initialize with sample data for demonstration
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Create sample purchase orders
    const sampleOrder1 = procurementManager.createPurchaseOrder([
      { sku: 'LED-GH-1000W', quantity: 24, neededBy: new Date('2024-02-15') },
      { sku: 'MOUNT-V-HOOK-6', quantity: 48, neededBy: new Date('2024-02-15') },
      { sku: 'CTRL-DIM-0-10V', quantity: 4, neededBy: new Date('2024-02-15') }
    ], 'vendor-1');

    const sampleOrder2 = procurementManager.createPurchaseOrder([
      { sku: 'PANEL-200A-42', quantity: 1, neededBy: new Date('2024-02-10') },
      { sku: 'BREAKER-3P-50A', quantity: 8, neededBy: new Date('2024-02-10') }
    ], 'vendor-3');

    // Update order statuses
    procurementManager.updateOrderStatus(sampleOrder1.poNumber, 'approved');
    procurementManager.updateOrderStatus(sampleOrder2.poNumber, 'submitted');

    // Get the plan and analytics
    const report = procurementManager.generateProcurementReport();
    const plan = (procurementManager as any).plan;
    setProcurementPlan(plan);

    // Generate analytics
    const vendorComparison = ProcurementAnalytics.compareVendorPerformance(plan.vendors);
    const spendAnalysis = ProcurementAnalytics.analyzeSpendPatterns(plan.orders);
    setAnalytics({ vendorComparison, spendAnalysis });
  };

  const getStatusColor = (status: POStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'pending-approval': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'submitted': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-600';
      default: return 'bg-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!procurementPlan) {
    return <div>Loading procurement data...</div>;
  }

  const report = procurementManager.generateProcurementReport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Procurement Management</h1>
          <p className="text-gray-600">AI-powered procurement optimization for {projectName}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            New Order
          </Button>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget)}</div>
            <Progress value={report.summary.budgetUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {report.summary.budgetUtilization.toFixed(1)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.summary.orderCount}</div>
            <p className="text-xs text-muted-foreground">
              {report.ordersByStatus.shipped} in transit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Average on-time delivery
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics?.spendAnalysis.savingsOpportunities.reduce(
                (sum: number, opp: any) => sum + opp.estimatedSavings, 0
              ) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Identified opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Procurement Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Procurement Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Phase 1: Electrical Infrastructure</span>
                  </div>
                  <Badge>Completed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Phase 2: Lighting Equipment</span>
                  </div>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>Phase 3: Control Systems</span>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Items Alert */}
          {procurementPlan.inventory.shortages.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Material Shortages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {procurementPlan.inventory.shortages.map((shortage, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{shortage.description}</p>
                        <p className="text-sm text-gray-600">
                          Need {shortage.shortage} units by {shortage.neededBy.toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Order Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {procurementPlan.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.poNumber}</TableCell>
                      <TableCell>{order.vendor.name}</TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.dates.created.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics?.vendorComparison.map((vendor: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{vendor.vendor}</span>
                    <Badge variant={
                      vendor.recommendation === 'preferred' ? 'default' :
                      vendor.recommendation === 'acceptable' ? 'secondary' : 'destructive'
                    }>
                      {vendor.recommendation}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>On-Time Delivery</span>
                        <span>{vendor.scores.onTime}%</span>
                      </div>
                      <Progress value={vendor.scores.onTime} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Quality Rating</span>
                        <span>{vendor.scores.quality}/5</span>
                      </div>
                      <Progress value={vendor.scores.quality * 20} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Price Competitiveness</span>
                        <span>{vendor.scores.price}/5</span>
                      </div>
                      <Progress value={vendor.scores.price * 20} className="h-2" />
                    </div>
                    
                    {vendor.strengths.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm font-medium text-green-600">Strengths:</p>
                        <ul className="text-sm text-gray-600">
                          {vendor.strengths.map((strength: string, i: number) => (
                            <li key={i}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">On Hand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {procurementPlan.inventory.onHand.length}
                </div>
                <p className="text-xs text-gray-600">Items in stock</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">On Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {procurementPlan.inventory.onOrder.length}
                </div>
                <p className="text-xs text-gray-600">Items in transit</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Shortages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {procurementPlan.inventory.shortages.length}
                </div>
                <p className="text-xs text-gray-600">Items needed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Savings Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Savings Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.spendAnalysis.savingsOpportunities.map((opp: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{opp.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">{opp.implementation}</p>
                        <Badge variant="outline" className="mt-2">
                          {opp.effort} effort
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(opp.estimatedSavings)}
                        </p>
                        <p className="text-sm text-gray-600">potential savings</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Spend by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Spend by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.spendAnalysis.spendByCategory.map((cat: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.category.replace(/-/g, ' ').toUpperCase()}</span>
                      <span>{formatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            AI Procurement Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium text-blue-900">Delivery Optimization</p>
              <p className="text-sm text-blue-700">
                Consolidating orders could reduce delivery costs by 15% and improve timeline by 3 days
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-900">Vendor Performance</p>
              <p className="text-sm text-blue-700">
                Your preferred vendors outperform industry average by 12% in on-time delivery
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-900">Risk Mitigation</p>
              <p className="text-sm text-blue-700">
                Dual-sourcing critical components reduces supply chain risk by 40%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}