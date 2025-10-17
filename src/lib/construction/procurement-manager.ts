/**
 * Procurement Manager
 * Handles purchasing, vendor management, and supply chain optimization
 */

import { CONSTRUCTION_COMPONENTS, ConstructionComponent } from './component-database';

export interface ProcurementPlan {
  id: string;
  projectName: string;
  totalBudget: number;
  orders: PurchaseOrder[];
  vendors: VendorProfile[];
  deliverySchedule: DeliverySchedule;
  inventory: InventoryStatus;
  approvals: ApprovalChain;
  riskAssessment: SupplyChainRisk[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: VendorProfile;
  items: POLineItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: POStatus;
  dates: {
    created: Date;
    submitted?: Date;
    approved?: Date;
    shipped?: Date;
    delivered?: Date;
  };
  terms: PaymentTerms;
  shipTo: ShippingAddress;
  notes: string[];
  attachments: string[]; // file paths
}

export type POStatus = 
  | 'draft'
  | 'pending-approval'
  | 'approved'
  | 'submitted'
  | 'acknowledged'
  | 'in-production'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface POLineItem {
  line: number;
  sku: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  extendedPrice: number;
  requestedDate: Date;
  promisedDate?: Date;
  notes?: string;
  alternates?: AlternateProduct[];
}

export interface AlternateProduct {
  sku: string;
  manufacturer: string;
  model: string;
  priceDelta: number;
  leadTimeDelta: number;
  notes: string;
  approved: boolean;
}

export interface VendorProfile {
  id: string;
  name: string;
  type: VendorType;
  contact: VendorContact;
  payment: PaymentInfo;
  performance: VendorPerformance;
  certifications: string[];
  preferredVendor: boolean;
  notes: string;
}

export type VendorType = 
  | 'manufacturer'
  | 'distributor'
  | 'wholesaler'
  | 'retailer'
  | 'contractor';

export interface VendorContact {
  primary: ContactPerson;
  accounting: ContactPerson;
  sales: ContactPerson;
  address: Address;
  website: string;
}

export interface ContactPerson {
  name: string;
  title: string;
  phone: string;
  email: string;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentInfo {
  terms: PaymentTerms;
  accountNumber: string;
  taxId: string;
  creditLimit?: number;
  currency: string;
}

export interface PaymentTerms {
  type: 'net-30' | 'net-45' | 'net-60' | '2-10-net-30' | 'cod' | 'credit-card';
  discountPercent?: number;
  discountDays?: number;
  netDays: number;
}

export interface VendorPerformance {
  onTimeDelivery: number; // percentage
  qualityRating: number; // 1-5
  priceCompetitiveness: number; // 1-5
  communicationRating: number; // 1-5
  totalOrders: number;
  totalSpend: number;
  lastOrderDate?: Date;
  issues: VendorIssue[];
}

export interface VendorIssue {
  date: Date;
  type: 'delivery' | 'quality' | 'pricing' | 'communication';
  description: string;
  resolution?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface DeliverySchedule {
  phases: DeliveryPhase[];
  constraints: DeliveryConstraint[];
  milestones: ProjectMilestone[];
}

export interface DeliveryPhase {
  phase: number;
  name: string;
  startDate: Date;
  endDate: Date;
  deliveries: ScheduledDelivery[];
  criticalPath: boolean;
}

export interface ScheduledDelivery {
  id: string;
  poNumber: string;
  vendor: string;
  items: Array<{ sku: string; quantity: number }>;
  requestedDate: Date;
  confirmedDate?: Date;
  actualDate?: Date;
  location: string;
  status: 'scheduled' | 'confirmed' | 'in-transit' | 'delivered' | 'delayed';
  trackingInfo?: TrackingInfo;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: Date;
  currentLocation: string;
  status: string;
}

export interface DeliveryConstraint {
  type: 'storage' | 'access' | 'weather' | 'coordination';
  description: string;
  affectedDeliveries: string[]; // delivery IDs
  mitigation: string;
}

export interface ProjectMilestone {
  name: string;
  date: Date;
  requiredMaterials: string[]; // SKUs
  predecessor?: string;
  critical: boolean;
}

export interface InventoryStatus {
  onHand: InventoryItem[];
  onOrder: InventoryItem[];
  allocated: InventoryItem[];
  shortages: MaterialShortage[];
  surplus: MaterialSurplus[];
}

export interface InventoryItem {
  sku: string;
  description: string;
  quantity: number;
  location: string;
  condition: 'new' | 'used' | 'damaged';
  receivedDate?: Date;
  expirationDate?: Date;
  serialNumbers?: string[];
  allocatedTo?: string;
}

export interface MaterialShortage {
  sku: string;
  description: string;
  required: number;
  available: number;
  shortage: number;
  neededBy: Date;
  impact: string;
  alternates: AlternateProduct[];
  resolution?: string;
}

export interface MaterialSurplus {
  sku: string;
  description: string;
  quantity: number;
  value: number;
  options: SurplusOption[];
}

export interface SurplusOption {
  type: 'return' | 'store' | 'transfer' | 'sell';
  description: string;
  value?: number;
  deadline?: Date;
}

export interface ApprovalChain {
  levels: ApprovalLevel[];
  currentLevel: number;
  status: 'pending' | 'approved' | 'rejected' | 'on-hold';
  history: ApprovalAction[];
}

export interface ApprovalLevel {
  level: number;
  title: string;
  approver: string;
  limit: number; // dollar amount
  required: boolean;
}

export interface ApprovalAction {
  level: number;
  approver: string;
  action: 'approved' | 'rejected' | 'returned';
  date: Date;
  comments?: string;
  conditions?: string[];
}

export interface SupplyChainRisk {
  type: RiskType;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
  contingency: string;
  owner: string;
}

export type RiskType = 
  | 'availability'
  | 'price-volatility'
  | 'quality'
  | 'delivery'
  | 'vendor-reliability'
  | 'regulatory'
  | 'weather'
  | 'logistics';

export class ProcurementManager {
  private plan: ProcurementPlan;
  
  constructor(projectName: string, budget: number) {
    this.plan = {
      id: `proc-${Date.now()}`,
      projectName,
      totalBudget: budget,
      orders: [],
      vendors: this.initializeVendors(),
      deliverySchedule: {
        phases: [],
        constraints: [],
        milestones: []
      },
      inventory: {
        onHand: [],
        onOrder: [],
        allocated: [],
        shortages: [],
        surplus: []
      },
      approvals: {
        levels: this.initializeApprovalLevels(),
        currentLevel: 0,
        status: 'pending',
        history: []
      },
      riskAssessment: []
    };
  }

  /**
   * Create purchase order from component list
   */
  createPurchaseOrder(
    items: Array<{ sku: string; quantity: number; neededBy: Date }>,
    vendorId: string
  ): PurchaseOrder {
    const vendor = this.plan.vendors.find(v => v.id === vendorId);
    if (!vendor) throw new Error('Vendor not found');

    const poLineItems: POLineItem[] = [];
    let subtotal = 0;
    let lineNumber = 1;

    for (const item of items) {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        const unitPrice = this.getVendorPrice(component, vendor);
        const discount = this.calculateDiscount(component, item.quantity, vendor);
        const extendedPrice = (unitPrice * item.quantity) * (1 - discount);

        poLineItems.push({
          line: lineNumber++,
          sku: item.sku,
          description: component.description,
          quantity: item.quantity,
          unit: 'EA',
          unitPrice,
          discount,
          extendedPrice,
          requestedDate: item.neededBy,
          alternates: this.findAlternates(component)
        });

        subtotal += extendedPrice;
      }
    }

    const tax = subtotal * 0.0875; // 8.75% tax
    const shipping = this.calculateShipping(poLineItems, vendor);
    const total = subtotal + tax + shipping;

    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: this.generatePONumber(),
      vendor,
      items: poLineItems,
      subtotal,
      tax,
      shipping,
      total,
      status: 'draft',
      dates: {
        created: new Date()
      },
      terms: vendor.payment.terms,
      shipTo: this.getShippingAddress(),
      notes: [],
      attachments: []
    };

    this.plan.orders.push(po);
    return po;
  }

  /**
   * Optimize orders across vendors
   */
  optimizeProcurement(
    requirements: Array<{ sku: string; quantity: number; neededBy: Date }>
  ): OptimizationResult {
    const vendorOptions = new Map<string, VendorOption[]>();
    
    // Analyze each requirement
    for (const req of requirements) {
      const component = CONSTRUCTION_COMPONENTS[req.sku];
      if (!component) continue;

      const options: VendorOption[] = [];
      
      // Check each vendor
      for (const vendor of this.plan.vendors) {
        const availability = this.checkVendorAvailability(vendor, component, req.quantity);
        if (availability.available) {
          options.push({
            vendor,
            sku: req.sku,
            quantity: req.quantity,
            unitPrice: availability.price,
            leadTime: availability.leadTime,
            shipping: this.estimateShipping(vendor, req.quantity * component.weight),
            reliability: vendor.performance.onTimeDelivery,
            totalCost: (availability.price * req.quantity) + this.estimateShipping(vendor, req.quantity * component.weight)
          });
        }
      }

      vendorOptions.set(req.sku, options);
    }

    // Find optimal combination
    const optimization = this.findOptimalVendorCombination(vendorOptions, requirements);
    
    return optimization;
  }

  /**
   * Track order status
   */
  updateOrderStatus(poNumber: string, status: POStatus, notes?: string): void {
    const order = this.plan.orders.find(o => o.poNumber === poNumber);
    if (!order) throw new Error('Order not found');

    order.status = status;
    
    // Update dates based on status
    const now = new Date();
    switch (status) {
      case 'submitted':
        order.dates.submitted = now;
        break;
      case 'approved':
        order.dates.approved = now;
        break;
      case 'shipped':
        order.dates.shipped = now;
        this.updateInventoryOnOrder(order);
        break;
      case 'delivered':
        order.dates.delivered = now;
        this.updateInventoryReceived(order);
        break;
    }

    if (notes) {
      order.notes.push(`${now.toISOString()}: ${notes}`);
    }
  }

  /**
   * Manage delivery schedule
   */
  scheduleDelivery(
    poNumber: string,
    requestedDate: Date,
    location: string
  ): ScheduledDelivery {
    const order = this.plan.orders.find(o => o.poNumber === poNumber);
    if (!order) throw new Error('Order not found');

    const delivery: ScheduledDelivery = {
      id: `del-${Date.now()}`,
      poNumber,
      vendor: order.vendor.name,
      items: order.items.map(i => ({ sku: i.sku, quantity: i.quantity })),
      requestedDate,
      location,
      status: 'scheduled'
    };

    // Add to appropriate phase
    const phase = this.findDeliveryPhase(requestedDate);
    if (phase) {
      phase.deliveries.push(delivery);
    }

    return delivery;
  }

  /**
   * Check material availability
   */
  checkMaterialAvailability(
    requirements: Array<{ sku: string; quantity: number; neededBy: Date }>
  ): AvailabilityReport {
    const report: AvailabilityReport = {
      available: [],
      shortages: [],
      leadTimeIssues: [],
      recommendations: []
    };

    for (const req of requirements) {
      const onHand = this.getOnHandQuantity(req.sku);
      const onOrder = this.getOnOrderQuantity(req.sku);
      const allocated = this.getAllocatedQuantity(req.sku);
      const available = onHand + onOrder - allocated;

      if (available >= req.quantity) {
        report.available.push({
          sku: req.sku,
          required: req.quantity,
          available,
          source: onHand >= req.quantity ? 'on-hand' : 'on-order'
        });
      } else {
        const shortage = req.quantity - available;
        const component = CONSTRUCTION_COMPONENTS[req.sku];
        
        report.shortages.push({
          sku: req.sku,
          description: component?.description || 'Unknown',
          required: req.quantity,
          available,
          shortage,
          neededBy: req.neededBy,
          impact: this.assessShortageImpact(req.sku, shortage),
          alternates: this.findAlternates(component!),
          resolution: this.suggestResolution(req.sku, shortage, req.neededBy)
        });
      }

      // Check lead time
      if (available < req.quantity) {
        const leadTime = this.getQuickestLeadTime(req.sku, shortage);
        const orderBy = new Date(req.neededBy);
        orderBy.setDate(orderBy.getDate() - leadTime);
        
        if (orderBy < new Date()) {
          report.leadTimeIssues.push({
            sku: req.sku,
            leadTime,
            neededBy: req.neededBy,
            orderBy,
            expediteOptions: this.getExpediteOptions(req.sku)
          });
        }
      }
    }

    // Generate recommendations
    if (report.shortages.length > 0) {
      report.recommendations.push('Consider ordering materials immediately to avoid delays');
      report.recommendations.push('Review alternate products for critical shortages');
    }
    
    if (report.leadTimeIssues.length > 0) {
      report.recommendations.push('Expedited shipping may be required for time-critical items');
      report.recommendations.push('Consider phasing deliveries to accommodate lead times');
    }

    return report;
  }

  /**
   * Generate procurement reports
   */
  generateProcurementReport(): ProcurementReport {
    const committedSpend = this.plan.orders
      .filter(o => ['approved', 'submitted', 'shipped', 'delivered'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);

    const pendingSpend = this.plan.orders
      .filter(o => ['draft', 'pending-approval'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0);

    const budgetRemaining = this.plan.totalBudget - committedSpend - pendingSpend;
    const budgetUtilization = ((committedSpend + pendingSpend) / this.plan.totalBudget) * 100;

    return {
      summary: {
        totalBudget: this.plan.totalBudget,
        committedSpend,
        pendingSpend,
        budgetRemaining,
        budgetUtilization,
        orderCount: this.plan.orders.length,
        vendorCount: this.plan.vendors.length
      },
      ordersByStatus: this.groupOrdersByStatus(),
      topVendors: this.getTopVendors(5),
      criticalItems: this.identifyCriticalItems(),
      risks: this.plan.riskAssessment,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Private helper methods
   */
  private initializeVendors(): VendorProfile[] {
    return [
      {
        id: 'vendor-1',
        name: 'Hydrofarm Commercial',
        type: 'distributor',
        contact: {
          primary: {
            name: 'John Smith',
            title: 'Account Manager',
            phone: '800-634-9999',
            email: 'jsmith@hydrofarm.com'
          },
          accounting: {
            name: 'Accounts Payable',
            title: 'AP Department',
            phone: '800-634-9998',
            email: 'ap@hydrofarm.com'
          },
          sales: {
            name: 'Sales Team',
            title: 'Inside Sales',
            phone: '800-634-9999',
            email: 'sales@hydrofarm.com'
          },
          address: {
            street1: '2249 S McDowell Blvd',
            city: 'Petaluma',
            state: 'CA',
            zip: '94954',
            country: 'USA'
          },
          website: 'https://www.hydrofarm.com'
        },
        payment: {
          terms: { type: 'net-30', netDays: 30 },
          accountNumber: 'ACCT-12345',
          taxId: '94-1234567',
          creditLimit: 50000,
          currency: 'USD'
        },
        performance: {
          onTimeDelivery: 94,
          qualityRating: 4.5,
          priceCompetitiveness: 4,
          communicationRating: 5,
          totalOrders: 127,
          totalSpend: 245000,
          lastOrderDate: new Date('2024-01-10'),
          issues: []
        },
        certifications: ['ISO 9001', 'Authorized Distributor'],
        preferredVendor: true,
        notes: 'Primary supplier for mounting hardware'
      },
      {
        id: 'vendor-2',
        name: 'Grainger Industrial Supply',
        type: 'distributor',
        contact: {
          primary: {
            name: 'Sarah Johnson',
            title: 'Strategic Account Manager',
            phone: '800-472-4643',
            email: 'sjohnson@grainger.com'
          },
          accounting: {
            name: 'Accounts Payable',
            title: 'AP Department',
            phone: '800-472-4644',
            email: 'ap@grainger.com'
          },
          sales: {
            name: 'Strategic Accounts',
            title: 'Sales Team',
            phone: '800-472-4643',
            email: 'strategic@grainger.com'
          },
          address: {
            street1: '100 Grainger Pkwy',
            city: 'Lake Forest',
            state: 'IL',
            zip: '60045',
            country: 'USA'
          },
          website: 'https://www.grainger.com'
        },
        payment: {
          terms: { type: '2-10-net-30', netDays: 30, discountPercent: 2, discountDays: 10 },
          accountNumber: 'STRAT-98765',
          taxId: '36-1150280',
          creditLimit: 100000,
          currency: 'USD'
        },
        performance: {
          onTimeDelivery: 97,
          qualityRating: 5,
          priceCompetitiveness: 3.5,
          communicationRating: 4.5,
          totalOrders: 243,
          totalSpend: 487000,
          lastOrderDate: new Date('2024-01-15'),
          issues: []
        },
        certifications: ['ISO 9001', 'ISO 14001', 'OSHA VPP'],
        preferredVendor: true,
        notes: 'Primary electrical and safety supplier'
      },
      {
        id: 'vendor-3',
        name: 'Schneider Electric',
        type: 'manufacturer',
        contact: {
          primary: {
            name: 'Michael Chen',
            title: 'OEM Account Manager',
            phone: '800-392-8781',
            email: 'mchen@se.com'
          },
          accounting: {
            name: 'Accounts Receivable',
            title: 'AR Department',
            phone: '800-392-8782',
            email: 'ar@se.com'
          },
          sales: {
            name: 'OEM Sales',
            title: 'Sales Department',
            phone: '800-392-8781',
            email: 'oem@se.com'
          },
          address: {
            street1: '800 Federal St',
            city: 'Andover',
            state: 'MA',
            zip: '01810',
            country: 'USA'
          },
          website: 'https://www.se.com'
        },
        payment: {
          terms: { type: 'net-45', netDays: 45 },
          accountNumber: 'OEM-45678',
          taxId: '04-2567890',
          creditLimit: 75000,
          currency: 'USD'
        },
        performance: {
          onTimeDelivery: 92,
          qualityRating: 5,
          priceCompetitiveness: 3,
          communicationRating: 4,
          totalOrders: 67,
          totalSpend: 178000,
          lastOrderDate: new Date('2024-01-05'),
          issues: [
            {
              date: new Date('2023-11-15'),
              type: 'delivery',
              description: 'Panel delivery delayed 1 week due to factory backlog',
              resolution: 'Expedited shipping provided at no cost',
              impact: 'low'
            }
          ]
        },
        certifications: ['UL', 'CSA', 'IEC', 'ISO 9001'],
        preferredVendor: true,
        notes: 'Direct manufacturer for panels and breakers'
      },
      {
        id: 'vendor-4',
        name: 'Priva North America',
        type: 'manufacturer',
        contact: {
          primary: {
            name: 'Jan van der Berg',
            title: 'Regional Sales Manager',
            phone: '905-562-7351',
            email: 'jvanderberg@priva.com'
          },
          accounting: {
            name: 'Finance Department',
            title: 'Accounts',
            phone: '905-562-7352',
            email: 'finance.na@priva.com'
          },
          sales: {
            name: 'Sales Team',
            title: 'Sales',
            phone: '905-562-7351',
            email: 'sales.na@priva.com'
          },
          address: {
            street1: '7321 Coleraine Dr',
            city: 'Ruthven',
            state: 'ON',
            zip: 'N0P 2G0',
            country: 'Canada'
          },
          website: 'https://www.priva.com'
        },
        payment: {
          terms: { type: 'net-60', netDays: 60 },
          accountNumber: 'NA-23456',
          taxId: '12-3456789',
          creditLimit: 150000,
          currency: 'USD'
        },
        performance: {
          onTimeDelivery: 95,
          qualityRating: 5,
          priceCompetitiveness: 2.5,
          communicationRating: 5,
          totalOrders: 12,
          totalSpend: 245000,
          lastOrderDate: new Date('2023-12-20'),
          issues: []
        },
        certifications: ['ISO 9001', 'CE', 'UL', 'Horticulture Specialist'],
        preferredVendor: true,
        notes: 'Climate control systems - matches Dalsem standard'
      }
    ];
  }

  private initializeApprovalLevels(): ApprovalLevel[] {
    return [
      { level: 1, title: 'Project Manager', approver: 'PM', limit: 5000, required: true },
      { level: 2, title: 'Purchasing Manager', approver: 'Purchasing', limit: 25000, required: true },
      { level: 3, title: 'Finance Director', approver: 'Finance', limit: 100000, required: true },
      { level: 4, title: 'Executive', approver: 'Executive', limit: Infinity, required: false }
    ];
  }

  private generatePONumber(): string {
    const date = new Date();
    const sequence = this.plan.orders.length + 1;
    return `PO-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${sequence.toString().padStart(4, '0')}`;
  }

  private getVendorPrice(component: ConstructionComponent, vendor: VendorProfile): number {
    // In reality would have vendor-specific pricing
    let price = component.price;
    
    // Apply vendor markup/discount
    if (vendor.preferredVendor) {
      price *= 0.95; // 5% preferred vendor discount
    }
    
    return price;
  }

  private calculateDiscount(component: ConstructionComponent, quantity: number, vendor: VendorProfile): number {
    let discount = 0;
    
    // Quantity discounts
    if (quantity >= 100) discount = 0.10;
    else if (quantity >= 50) discount = 0.05;
    else if (quantity >= 25) discount = 0.02;
    
    // Additional preferred vendor discount
    if (vendor.preferredVendor) {
      discount += 0.02;
    }
    
    return discount;
  }

  private calculateShipping(items: POLineItem[], vendor: VendorProfile): number {
    let totalWeight = 0;
    let totalVolume = 0;
    
    for (const item of items) {
      const component = CONSTRUCTION_COMPONENTS[item.sku];
      if (component) {
        totalWeight += component.weight * item.quantity;
        const volume = (component.dimensions.length * component.dimensions.width * component.dimensions.height) / 1728; // cubic feet
        totalVolume += volume * item.quantity;
      }
    }
    
    // Simplified shipping calculation
    const weightRate = 0.50; // $ per lb
    const volumeRate = 5.00; // $ per cubic foot
    const baseFee = 50; // base shipping fee
    
    return baseFee + (totalWeight * weightRate) + (totalVolume * volumeRate);
  }

  private getShippingAddress(): ShippingAddress {
    return {
      name: this.plan.projectName,
      attention: 'Receiving Department',
      street1: '123 Project Site Road',
      city: 'City',
      state: 'ST',
      zip: '12345',
      country: 'USA',
      phone: '555-0100',
      instructions: 'Call site manager upon arrival'
    };
  }

  private findAlternates(component: ConstructionComponent): AlternateProduct[] {
    // In reality would search database for compatible products
    return [];
  }

  private checkVendorAvailability(
    vendor: VendorProfile,
    component: ConstructionComponent,
    quantity: number
  ): { available: boolean; price: number; leadTime: number } {
    // Simplified availability check
    return {
      available: true,
      price: this.getVendorPrice(component, vendor),
      leadTime: component.leadTime
    };
  }

  private estimateShipping(vendor: VendorProfile, weight: number): number {
    // Simplified shipping estimate
    return 50 + (weight * 0.50);
  }

  private findOptimalVendorCombination(
    vendorOptions: Map<string, VendorOption[]>,
    requirements: Array<{ sku: string; quantity: number; neededBy: Date }>
  ): OptimizationResult {
    // Simplified optimization - in reality would use more complex algorithm
    const selectedVendors = new Map<string, VendorOption>();
    let totalCost = 0;
    let maxLeadTime = 0;

    vendorOptions.forEach((options, sku) => {
      // Select vendor with best combination of price and reliability
      const best = options.reduce((prev, curr) => {
        const prevScore = (1 / prev.totalCost) * prev.reliability;
        const currScore = (1 / curr.totalCost) * curr.reliability;
        return currScore > prevScore ? curr : prev;
      });

      selectedVendors.set(sku, best);
      totalCost += best.totalCost;
      maxLeadTime = Math.max(maxLeadTime, best.leadTime);
    });

    return {
      vendors: Array.from(selectedVendors.values()),
      totalCost,
      maxLeadTime,
      savings: 0, // Would calculate vs. baseline
      riskScore: this.calculateRiskScore(selectedVendors)
    };
  }

  private calculateRiskScore(vendors: Map<string, VendorOption>): number {
    // Simplified risk calculation
    let totalRisk = 0;
    vendors.forEach(option => {
      const reliabilityRisk = (100 - option.reliability) / 100;
      totalRisk += reliabilityRisk;
    });
    return totalRisk / vendors.size;
  }

  private findDeliveryPhase(date: Date): DeliveryPhase | undefined {
    return this.plan.deliverySchedule.phases.find(phase => 
      date >= phase.startDate && date <= phase.endDate
    );
  }

  private updateInventoryOnOrder(order: PurchaseOrder): void {
    for (const item of order.items) {
      this.plan.inventory.onOrder.push({
        sku: item.sku,
        description: item.description,
        quantity: item.quantity,
        location: 'In Transit',
        condition: 'new'
      });
    }
  }

  private updateInventoryReceived(order: PurchaseOrder): void {
    // Move from on order to on hand
    for (const item of order.items) {
      // Remove from on order
      this.plan.inventory.onOrder = this.plan.inventory.onOrder.filter(
        i => !(i.sku === item.sku && i.quantity === item.quantity)
      );
      
      // Add to on hand
      this.plan.inventory.onHand.push({
        sku: item.sku,
        description: item.description,
        quantity: item.quantity,
        location: 'Warehouse A',
        condition: 'new',
        receivedDate: new Date()
      });
    }
  }

  private getOnHandQuantity(sku: string): number {
    return this.plan.inventory.onHand
      .filter(i => i.sku === sku)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  private getOnOrderQuantity(sku: string): number {
    return this.plan.inventory.onOrder
      .filter(i => i.sku === sku)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  private getAllocatedQuantity(sku: string): number {
    return this.plan.inventory.allocated
      .filter(i => i.sku === sku)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  private assessShortageImpact(sku: string, shortage: number): string {
    const component = CONSTRUCTION_COMPONENTS[sku];
    if (!component) return 'Unknown impact';
    
    // Assess based on component category
    switch (component.category) {
      case 'lighting-fixtures':
        return 'Critical - Will delay lighting installation';
      case 'electrical-components':
        return 'Critical - Will stop electrical work';
      case 'mounting-hardware':
        return 'High - Will delay fixture mounting';
      default:
        return 'Medium - May cause minor delays';
    }
  }

  private suggestResolution(sku: string, shortage: number, neededBy: Date): string {
    const leadTime = CONSTRUCTION_COMPONENTS[sku]?.leadTime || 7;
    const orderBy = new Date(neededBy);
    orderBy.setDate(orderBy.getDate() - leadTime);
    
    if (orderBy < new Date()) {
      return 'Expedited shipping required - order immediately';
    } else {
      return `Order by ${orderBy.toLocaleDateString()} for standard delivery`;
    }
  }

  private getQuickestLeadTime(sku: string, quantity: number): number {
    // Check all vendors for quickest delivery
    let quickest = Infinity;
    
    for (const vendor of this.plan.vendors) {
      const component = CONSTRUCTION_COMPONENTS[sku];
      if (component) {
        const availability = this.checkVendorAvailability(vendor, component, quantity);
        if (availability.available) {
          quickest = Math.min(quickest, availability.leadTime);
        }
      }
    }
    
    return quickest === Infinity ? 14 : quickest; // Default 14 days
  }

  private getExpediteOptions(sku: string): ExpediteOption[] {
    return [
      {
        method: 'Air Freight',
        additionalCost: 500,
        leadTimeReduction: 5,
        available: true
      },
      {
        method: 'Expedited Ground',
        additionalCost: 200,
        leadTimeReduction: 2,
        available: true
      }
    ];
  }

  private groupOrdersByStatus(): Record<POStatus, number> {
    const groups: Record<POStatus, number> = {
      'draft': 0,
      'pending-approval': 0,
      'approved': 0,
      'submitted': 0,
      'acknowledged': 0,
      'in-production': 0,
      'shipped': 0,
      'delivered': 0,
      'completed': 0,
      'cancelled': 0
    };

    this.plan.orders.forEach(order => {
      groups[order.status]++;
    });

    return groups;
  }

  private getTopVendors(count: number): VendorSummary[] {
    const vendorTotals = new Map<string, number>();
    
    this.plan.orders.forEach(order => {
      const current = vendorTotals.get(order.vendor.id) || 0;
      vendorTotals.set(order.vendor.id, current + order.total);
    });

    return Array.from(vendorTotals.entries())
      .map(([vendorId, total]) => {
        const vendor = this.plan.vendors.find(v => v.id === vendorId)!;
        return {
          vendor: vendor.name,
          totalSpend: total,
          orderCount: this.plan.orders.filter(o => o.vendor.id === vendorId).length,
          performance: vendor.performance
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, count);
  }

  private identifyCriticalItems(): CriticalItem[] {
    // Identify items that could impact project timeline
    return [];
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Budget recommendations
    const budgetUtilization = (this.plan.orders.reduce((sum, o) => sum + o.total, 0) / this.plan.totalBudget) * 100;
    if (budgetUtilization > 80) {
      recommendations.push('Budget utilization exceeds 80% - review remaining requirements carefully');
    }
    
    // Vendor recommendations
    const singleSourceItems = this.identifySingleSourceItems();
    if (singleSourceItems.length > 0) {
      recommendations.push(`${singleSourceItems.length} items have single source - consider finding alternates`);
    }
    
    return recommendations;
  }

  private identifySingleSourceItems(): string[] {
    // Would identify items only available from one vendor
    return [];
  }
}

// Supporting interfaces
interface ShippingAddress extends Address {
  name: string;
  attention: string;
  phone: string;
  instructions: string;
}

interface VendorOption {
  vendor: VendorProfile;
  sku: string;
  quantity: number;
  unitPrice: number;
  leadTime: number;
  shipping: number;
  reliability: number;
  totalCost: number;
}

interface OptimizationResult {
  vendors: VendorOption[];
  totalCost: number;
  maxLeadTime: number;
  savings: number;
  riskScore: number;
}

interface AvailabilityReport {
  available: Array<{
    sku: string;
    required: number;
    available: number;
    source: 'on-hand' | 'on-order';
  }>;
  shortages: MaterialShortage[];
  leadTimeIssues: Array<{
    sku: string;
    leadTime: number;
    neededBy: Date;
    orderBy: Date;
    expediteOptions: ExpediteOption[];
  }>;
  recommendations: string[];
}

interface ExpediteOption {
  method: string;
  additionalCost: number;
  leadTimeReduction: number;
  available: boolean;
}

interface ProcurementReport {
  summary: {
    totalBudget: number;
    committedSpend: number;
    pendingSpend: number;
    budgetRemaining: number;
    budgetUtilization: number;
    orderCount: number;
    vendorCount: number;
  };
  ordersByStatus: Record<POStatus, number>;
  topVendors: VendorSummary[];
  criticalItems: CriticalItem[];
  risks: SupplyChainRisk[];
  recommendations: string[];
}

interface VendorSummary {
  vendor: string;
  totalSpend: number;
  orderCount: number;
  performance: VendorPerformance;
}

interface CriticalItem {
  sku: string;
  description: string;
  impact: string;
  mitigation: string;
}

/**
 * Advanced procurement analytics
 */
export class ProcurementAnalytics {
  /**
   * Analyze spend patterns and opportunities
   */
  static analyzeSpendPatterns(orders: PurchaseOrder[]): SpendAnalysis {
    const monthlySpend = new Map<string, number>();
    const categorySpend = new Map<string, number>();
    const vendorSpend = new Map<string, number>();
    
    orders.forEach(order => {
      const month = order.dates.created.toISOString().substring(0, 7);
      monthlySpend.set(month, (monthlySpend.get(month) || 0) + order.total);
      
      order.items.forEach(item => {
        const component = CONSTRUCTION_COMPONENTS[item.sku];
        if (component) {
          categorySpend.set(
            component.category,
            (categorySpend.get(component.category) || 0) + item.extendedPrice
          );
        }
      });
      
      vendorSpend.set(
        order.vendor.name,
        (vendorSpend.get(order.vendor.name) || 0) + order.total
      );
    });
    
    return {
      totalSpend: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      spendByMonth: Array.from(monthlySpend.entries()).map(([month, amount]) => ({
        month,
        amount
      })),
      spendByCategory: Array.from(categorySpend.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / orders.reduce((sum, o) => sum + o.total, 0)) * 100
      })),
      topVendors: Array.from(vendorSpend.entries())
        .map(([vendor, amount]) => ({ vendor, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5),
      savingsOpportunities: this.identifySavingsOpportunities(orders)
    };
  }
  
  /**
   * Identify cost savings opportunities
   */
  private static identifySavingsOpportunities(orders: PurchaseOrder[]): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];
    
    // Volume consolidation opportunity
    const skuQuantities = new Map<string, number>();
    orders.forEach(order => {
      order.items.forEach(item => {
        skuQuantities.set(item.sku, (skuQuantities.get(item.sku) || 0) + item.quantity);
      });
    });
    
    skuQuantities.forEach((quantity, sku) => {
      if (quantity >= 50) {
        opportunities.push({
          type: 'volume-discount',
          description: `Consolidate ${sku} orders for volume discount`,
          estimatedSavings: quantity * 0.05 * (CONSTRUCTION_COMPONENTS[sku]?.price || 0),
          effort: 'low',
          implementation: 'Combine orders across projects'
        });
      }
    });
    
    // Payment term optimization
    const earlyPaymentSavings = orders
      .filter(o => o.vendor.payment.terms.type === '2-10-net-30')
      .reduce((sum, o) => sum + (o.total * 0.02), 0);
    
    if (earlyPaymentSavings > 1000) {
      opportunities.push({
        type: 'payment-terms',
        description: 'Take advantage of early payment discounts',
        estimatedSavings: earlyPaymentSavings,
        effort: 'low',
        implementation: 'Pay within 10 days for 2% discount'
      });
    }
    
    return opportunities;
  }
  
  /**
   * Compare vendor performance
   */
  static compareVendorPerformance(vendors: VendorProfile[]): VendorComparison[] {
    return vendors.map(vendor => {
      const overallScore = 
        (vendor.performance.onTimeDelivery * 0.3) +
        (vendor.performance.qualityRating * 20 * 0.3) +
        (vendor.performance.priceCompetitiveness * 20 * 0.2) +
        (vendor.performance.communicationRating * 20 * 0.2);
      
      return {
        vendor: vendor.name,
        scores: {
          onTime: vendor.performance.onTimeDelivery,
          quality: vendor.performance.qualityRating,
          price: vendor.performance.priceCompetitiveness,
          communication: vendor.performance.communicationRating,
          overall: overallScore
        },
        strengths: this.identifyVendorStrengths(vendor),
        weaknesses: this.identifyVendorWeaknesses(vendor),
        recommendation: overallScore >= 80 ? 'preferred' : 
                       overallScore >= 60 ? 'acceptable' : 'review'
      };
    });
  }
  
  private static identifyVendorStrengths(vendor: VendorProfile): string[] {
    const strengths: string[] = [];
    if (vendor.performance.onTimeDelivery >= 95) strengths.push('Excellent delivery reliability');
    if (vendor.performance.qualityRating >= 4.5) strengths.push('High quality products');
    if (vendor.performance.priceCompetitiveness >= 4) strengths.push('Competitive pricing');
    if (vendor.performance.communicationRating >= 4.5) strengths.push('Great communication');
    return strengths;
  }
  
  private static identifyVendorWeaknesses(vendor: VendorProfile): string[] {
    const weaknesses: string[] = [];
    if (vendor.performance.onTimeDelivery < 90) weaknesses.push('Delivery reliability concerns');
    if (vendor.performance.qualityRating < 3.5) weaknesses.push('Quality issues');
    if (vendor.performance.priceCompetitiveness < 3) weaknesses.push('Higher prices');
    if (vendor.performance.communicationRating < 3.5) weaknesses.push('Communication challenges');
    return weaknesses;
  }
}

// Analytics interfaces
interface SpendAnalysis {
  totalSpend: number;
  averageOrderValue: number;
  spendByMonth: Array<{ month: string; amount: number }>;
  spendByCategory: Array<{ category: string; amount: number; percentage: number }>;
  topVendors: Array<{ vendor: string; amount: number }>;
  savingsOpportunities: SavingsOpportunity[];
}

interface SavingsOpportunity {
  type: 'volume-discount' | 'payment-terms' | 'alternative-supplier' | 'specification-change';
  description: string;
  estimatedSavings: number;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
}

interface VendorComparison {
  vendor: string;
  scores: {
    onTime: number;
    quality: number;
    price: number;
    communication: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: 'preferred' | 'acceptable' | 'review';
}