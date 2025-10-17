/**
 * Bill of Materials Generator
 * Advanced BOM generation with quantity takeoffs, cost analysis, and optimization
 */

import { prisma } from '../prisma';
import { redis } from '../redis';
import { EventEmitter } from 'events';
import { GreenhouseModel, Component, Material, BillOfMaterials, UnitType } from './greenhouse-cad-system';
import { MaterialDatabase } from './material-database';

export interface BOMConfiguration {
  includeLabor: boolean;
  includeShipping: boolean;
  includeWaste: boolean;
  wasteFactors: Record<string, number>; // category -> waste percentage
  regionCode: string;
  taxRate: number;
  markupPercentage: number;
}

export interface BOMAnalysis {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalShippingCost: number;
  totalWaste: number;
  totalTax: number;
  totalMarkup: number;
  grandTotal: number;
  
  // Analysis
  costBreakdown: {
    materials: number;
    labor: number;
    shipping: number;
    waste: number;
    tax: number;
    markup: number;
  };
  
  // Optimization opportunities
  optimizations: Array<{
    type: 'material_substitution' | 'quantity_optimization' | 'supplier_optimization';
    description: string;
    potentialSavings: number;
    impact: 'low' | 'medium' | 'high';
  }>;
  
  // Risk factors
  risks: Array<{
    type: 'supply_chain' | 'price_volatility' | 'lead_time';
    description: string;
    probability: number;
    impact: number;
  }>;
}

export interface BOMLineItem {
  id: string;
  itemNumber: string;
  componentId: string;
  materialId: string;
  
  // Description
  description: string;
  specification: string;
  
  // Quantity
  quantity: number;
  unit: UnitType;
  wasteQuantity: number;
  totalQuantity: number;
  
  // Pricing
  unitCost: number;
  materialCost: number;
  wasteCost: number;
  totalCost: number;
  
  // Physical properties
  unitWeight: number;
  totalWeight: number;
  
  // Supplier information
  supplier: string;
  supplierPartNumber: string;
  leadTime: number;
  availability: 'in_stock' | 'available' | 'backordered' | 'discontinued';
  
  // Installation
  laborHours: number;
  laborCost: number;
  installationNotes: string;
  
  // Classification
  category: string;
  subCategory: string;
  criticality: 'critical' | 'important' | 'standard';
  
  // Alternatives
  alternatives: Array<{
    materialId: string;
    description: string;
    costDifference: number;
    performanceDifference: string;
  }>;
}

export interface BOMAssembly {
  id: string;
  name: string;
  sequence: number;
  
  // Components
  components: string[];
  lineItems: string[];
  
  // Resources
  laborHours: number;
  laborCost: number;
  equipmentNeeded: string[];
  toolsNeeded: string[];
  
  // Scheduling
  prerequisites: string[];
  duration: number; // days
  criticalPath: boolean;
  
  // Instructions
  instructions: string;
  safetyRequirements: string[];
  qualityChecks: string[];
  
  // Costs
  materialCost: number;
  totalCost: number;
}

export interface BOMSummary {
  // Totals
  totalLineItems: number;
  totalComponents: number;
  totalMaterials: number;
  totalWeight: number;
  
  // Costs
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  
  // Categories
  categoryCosts: Array<{
    category: string;
    lineItems: number;
    cost: number;
    percentage: number;
  }>;
  
  // Suppliers
  supplierCosts: Array<{
    supplier: string;
    lineItems: number;
    cost: number;
    percentage: number;
    leadTime: number;
  }>;
  
  // Timeline
  longestLeadTime: number;
  averageLeadTime: number;
  criticalPathDuration: number;
  
  // Metrics
  costPerSquareFoot: number;
  weightPerSquareFoot: number;
  laborHoursPerSquareFoot: number;
}

class BOMGenerator extends EventEmitter {
  private materialDatabase: MaterialDatabase;
  private configuration: BOMConfiguration;
  private laborRates: Map<string, number> = new Map();
  private shippingRates: Map<string, number> = new Map();

  constructor(materialDatabase: MaterialDatabase) {
    super();
    this.materialDatabase = materialDatabase;
    this.configuration = this.getDefaultConfiguration();
    this.initializeLaborRates();
    this.initializeShippingRates();
  }

  /**
   * Generate comprehensive BOM from greenhouse model
   */
  async generateBOM(
    model: GreenhouseModel,
    configuration?: Partial<BOMConfiguration>
  ): Promise<BillOfMaterials> {
    try {
      // Merge configuration
      this.configuration = { ...this.configuration, ...configuration };
      
      // Generate line items
      const lineItems = await this.generateLineItems(model);
      
      // Generate assemblies
      const assemblies = await this.generateAssemblies(model, lineItems);
      
      // Generate summary
      const summary = this.generateSummary(lineItems, assemblies, model);
      
      // Perform analysis
      const analysis = await this.performBOMAnalysis(lineItems, assemblies, model);
      
      const bom: BillOfMaterials = {
        id: this.generateId('bom'),
        greenhouseId: model.id,
        summary: {
          totalComponents: summary.totalComponents,
          totalWeight: summary.totalWeight,
          totalCost: summary.total,
          totalLaborHours: assemblies.reduce((sum, a) => sum + a.laborHours, 0)
        },
        categories: summary.categoryCosts,
        lineItems: lineItems.map(item => ({
          id: item.id,
          componentId: item.componentId,
          itemNumber: item.itemNumber,
          description: item.description,
          materialId: item.materialId,
          quantity: item.totalQuantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost: item.totalCost,
          weight: item.totalWeight,
          supplier: item.supplier,
          leadTime: item.leadTime,
          notes: item.installationNotes
        })),
        assemblies: assemblies.map(assembly => ({
          name: assembly.name,
          sequence: assembly.sequence,
          components: assembly.components,
          laborHours: assembly.laborHours,
          tools: assembly.toolsNeeded,
          materials: assembly.lineItems
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.emit('bom-generated', { bom, analysis });
      return bom;
    } catch (error) {
      logger.error('api', 'Failed to generate BOM:', error );
      throw error;
    }
  }

  /**
   * Generate detailed line items from components
   */
  private async generateLineItems(model: GreenhouseModel): Promise<BOMLineItem[]> {
    const lineItems: BOMLineItem[] = [];
    const components = this.getAllComponents(model);
    
    for (const component of components) {
      const material = this.materialDatabase.getMaterial(component.materialId);
      if (!material) continue;
      
      // Calculate quantities with waste
      const baseQuantity = component.properties.quantity;
      const wastePercentage = this.configuration.wasteFactors[component.category] || 0.1;
      const wasteQuantity = baseQuantity * wastePercentage;
      const totalQuantity = baseQuantity + wasteQuantity;
      
      // Calculate costs
      const unitCost = this.calculateUnitCost(material, totalQuantity, component.properties.unit);
      const materialCost = baseQuantity * unitCost;
      const wasteCost = wasteQuantity * unitCost;
      const totalCost = materialCost + wasteCost;
      
      // Calculate labor
      const laborRate = this.laborRates.get(component.assembly.skillLevel) || 35;
      const laborCost = component.assembly.laborHours * laborRate;
      
      // Find alternatives
      const alternatives = await this.findAlternatives(material, component);
      
      const lineItem: BOMLineItem = {
        id: this.generateId('line'),
        itemNumber: this.generateItemNumber(component),
        componentId: component.id,
        materialId: material.id,
        description: `${component.name} - ${material.name}`,
        specification: this.generateSpecification(component, material),
        quantity: baseQuantity,
        unit: component.properties.unit,
        wasteQuantity,
        totalQuantity,
        unitCost,
        materialCost,
        wasteCost,
        totalCost,
        unitWeight: component.properties.weight / baseQuantity,
        totalWeight: component.properties.weight,
        supplier: material.suppliers[0]?.name || 'TBD',
        supplierPartNumber: material.model,
        leadTime: material.availability.leadTime,
        availability: this.determineAvailability(material),
        laborHours: component.assembly.laborHours,
        laborCost,
        installationNotes: component.assembly.instructions,
        category: component.category,
        subCategory: component.subLayer || 'general',
        criticality: this.determineCriticality(component),
        alternatives
      };
      
      lineItems.push(lineItem);
    }
    
    return lineItems.sort((a, b) => a.itemNumber.localeCompare(b.itemNumber));
  }

  /**
   * Generate assembly sequences
   */
  private async generateAssemblies(
    model: GreenhouseModel,
    lineItems: BOMLineItem[]
  ): Promise<BOMAssembly[]> {
    const assemblies: BOMAssembly[] = [];
    const components = this.getAllComponents(model);
    
    // Group components by assembly sequence
    const sequenceMap = new Map<number, Component[]>();
    for (const component of components) {
      const sequence = component.assembly.sequence;
      const existing = sequenceMap.get(sequence) || [];
      existing.push(component);
      sequenceMap.set(sequence, existing);
    }
    
    // Generate assemblies
    for (const [sequence, sequenceComponents] of sequenceMap) {
      const relatedLineItems = lineItems.filter(item => 
        sequenceComponents.some(comp => comp.id === item.componentId)
      );
      
      const assembly: BOMAssembly = {
        id: this.generateId('assembly'),
        name: this.getAssemblyName(sequence),
        sequence,
        components: sequenceComponents.map(c => c.id),
        lineItems: relatedLineItems.map(item => item.id),
        laborHours: sequenceComponents.reduce((sum, c) => sum + c.assembly.laborHours, 0),
        laborCost: relatedLineItems.reduce((sum, item) => sum + item.laborCost, 0),
        equipmentNeeded: this.getEquipmentNeeded(sequence),
        toolsNeeded: [...new Set(sequenceComponents.flatMap(c => c.assembly.tools))],
        prerequisites: this.getPrerequisites(sequence),
        duration: this.calculateAssemblyDuration(sequenceComponents),
        criticalPath: this.isCriticalPath(sequence),
        instructions: this.generateAssemblyInstructions(sequenceComponents),
        safetyRequirements: this.getSafetyRequirements(sequence),
        qualityChecks: this.getQualityChecks(sequence),
        materialCost: relatedLineItems.reduce((sum, item) => sum + item.totalCost, 0),
        totalCost: relatedLineItems.reduce((sum, item) => sum + item.totalCost + item.laborCost, 0)
      };
      
      assemblies.push(assembly);
    }
    
    return assemblies.sort((a, b) => a.sequence - b.sequence);
  }

  /**
   * Generate BOM summary
   */
  private generateSummary(
    lineItems: BOMLineItem[],
    assemblies: BOMAssembly[],
    model: GreenhouseModel
  ): BOMSummary {
    const totalMaterialCost = lineItems.reduce((sum, item) => sum + item.totalCost, 0);
    const totalLaborCost = lineItems.reduce((sum, item) => sum + item.laborCost, 0);
    const subtotal = totalMaterialCost + totalLaborCost;
    
    const tax = this.configuration.taxRate * subtotal;
    const shipping = this.calculateShipping(lineItems);
    const total = subtotal + tax + shipping;
    
    // Category breakdown
    const categoryMap = new Map<string, { items: number; cost: number }>();
    for (const item of lineItems) {
      const existing = categoryMap.get(item.category) || { items: 0, cost: 0 };
      existing.items += 1;
      existing.cost += item.totalCost;
      categoryMap.set(item.category, existing);
    }
    
    const categoryCosts = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      lineItems: data.items,
      cost: data.cost,
      percentage: (data.cost / totalMaterialCost) * 100
    }));
    
    // Supplier breakdown
    const supplierMap = new Map<string, { items: number; cost: number; leadTime: number }>();
    for (const item of lineItems) {
      const existing = supplierMap.get(item.supplier) || { items: 0, cost: 0, leadTime: 0 };
      existing.items += 1;
      existing.cost += item.totalCost;
      existing.leadTime = Math.max(existing.leadTime, item.leadTime);
      supplierMap.set(item.supplier, existing);
    }
    
    const supplierCosts = Array.from(supplierMap.entries()).map(([supplier, data]) => ({
      supplier,
      lineItems: data.items,
      cost: data.cost,
      percentage: (data.cost / totalMaterialCost) * 100,
      leadTime: data.leadTime
    }));
    
    // Area calculations
    const area = model.parameters.dimensions.length * model.parameters.dimensions.width;
    
    return {
      totalLineItems: lineItems.length,
      totalComponents: lineItems.reduce((sum, item) => sum + item.quantity, 0),
      totalMaterials: new Set(lineItems.map(item => item.materialId)).size,
      totalWeight: lineItems.reduce((sum, item) => sum + item.totalWeight, 0),
      subtotal,
      tax,
      shipping,
      total,
      categoryCosts,
      supplierCosts,
      longestLeadTime: Math.max(...lineItems.map(item => item.leadTime)),
      averageLeadTime: lineItems.reduce((sum, item) => sum + item.leadTime, 0) / lineItems.length,
      criticalPathDuration: this.calculateCriticalPathDuration(assemblies),
      costPerSquareFoot: total / area,
      weightPerSquareFoot: lineItems.reduce((sum, item) => sum + item.totalWeight, 0) / area,
      laborHoursPerSquareFoot: lineItems.reduce((sum, item) => sum + item.laborHours, 0) / area
    };
  }

  /**
   * Perform comprehensive BOM analysis
   */
  private async performBOMAnalysis(
    lineItems: BOMLineItem[],
    assemblies: BOMAssembly[],
    model: GreenhouseModel
  ): Promise<BOMAnalysis> {
    const totalMaterialCost = lineItems.reduce((sum, item) => sum + item.materialCost, 0);
    const totalLaborCost = lineItems.reduce((sum, item) => sum + item.laborCost, 0);
    const totalShippingCost = this.calculateShipping(lineItems);
    const totalWaste = lineItems.reduce((sum, item) => sum + item.wasteCost, 0);
    const totalTax = this.configuration.taxRate * (totalMaterialCost + totalLaborCost);
    const totalMarkup = this.configuration.markupPercentage * totalMaterialCost;
    const grandTotal = totalMaterialCost + totalLaborCost + totalShippingCost + totalWaste + totalTax + totalMarkup;
    
    // Generate optimizations
    const optimizations = await this.generateOptimizations(lineItems, model);
    
    // Generate risk assessment
    const risks = await this.generateRiskAssessment(lineItems, assemblies);
    
    return {
      totalMaterialCost,
      totalLaborCost,
      totalShippingCost,
      totalWaste,
      totalTax,
      totalMarkup,
      grandTotal,
      costBreakdown: {
        materials: (totalMaterialCost / grandTotal) * 100,
        labor: (totalLaborCost / grandTotal) * 100,
        shipping: (totalShippingCost / grandTotal) * 100,
        waste: (totalWaste / grandTotal) * 100,
        tax: (totalTax / grandTotal) * 100,
        markup: (totalMarkup / grandTotal) * 100
      },
      optimizations,
      risks
    };
  }

  /**
   * Generate optimization recommendations
   */
  private async generateOptimizations(
    lineItems: BOMLineItem[],
    model: GreenhouseModel
  ): Promise<BOMAnalysis['optimizations']> {
    const optimizations: BOMAnalysis['optimizations'] = [];
    
    // Material substitution opportunities
    for (const item of lineItems) {
      if (item.alternatives.length > 0) {
        const bestAlternative = item.alternatives
          .sort((a, b) => a.costDifference - b.costDifference)[0];
        
        if (bestAlternative.costDifference < -100) {
          optimizations.push({
            type: 'material_substitution',
            description: `Replace ${item.description} with ${bestAlternative.description}`,
            potentialSavings: Math.abs(bestAlternative.costDifference),
            impact: 'medium'
          });
        }
      }
    }
    
    // Quantity optimization
    const categoryQuantities = new Map<string, { items: BOMLineItem[]; totalCost: number }>();
    for (const item of lineItems) {
      const existing = categoryQuantities.get(item.category) || { items: [], totalCost: 0 };
      existing.items.push(item);
      existing.totalCost += item.totalCost;
      categoryQuantities.set(item.category, existing);
    }
    
    for (const [category, data] of categoryQuantities) {
      if (data.totalCost > 5000) {
        const potentialSavings = data.totalCost * 0.05; // 5% bulk discount
        optimizations.push({
          type: 'quantity_optimization',
          description: `Bulk purchasing for ${category} materials`,
          potentialSavings,
          impact: 'low'
        });
      }
    }
    
    // Supplier optimization
    const supplierCosts = new Map<string, number>();
    for (const item of lineItems) {
      const existing = supplierCosts.get(item.supplier) || 0;
      supplierCosts.set(item.supplier, existing + item.totalCost);
    }
    
    if (supplierCosts.size > 5) {
      optimizations.push({
        type: 'supplier_optimization',
        description: 'Consolidate suppliers to reduce logistics costs',
        potentialSavings: 1000,
        impact: 'medium'
      });
    }
    
    return optimizations;
  }

  /**
   * Generate risk assessment
   */
  private async generateRiskAssessment(
    lineItems: BOMLineItem[],
    assemblies: BOMAssembly[]
  ): Promise<BOMAnalysis['risks']> {
    const risks: BOMAnalysis['risks'] = [];
    
    // Supply chain risks
    const criticalItems = lineItems.filter(item => item.criticality === 'critical');
    const highRiskSuppliers = criticalItems.filter(item => item.leadTime > 30);
    
    if (highRiskSuppliers.length > 0) {
      risks.push({
        type: 'supply_chain',
        description: `${highRiskSuppliers.length} critical items have lead times > 30 days`,
        probability: 0.3,
        impact: 8
      });
    }
    
    // Price volatility risk
    const steelItems = lineItems.filter(item => item.category === 'frame');
    const steelCost = steelItems.reduce((sum, item) => sum + item.totalCost, 0);
    
    if (steelCost > 10000) {
      risks.push({
        type: 'price_volatility',
        description: 'High steel content subject to price fluctuations',
        probability: 0.6,
        impact: 6
      });
    }
    
    // Lead time risk
    const avgLeadTime = lineItems.reduce((sum, item) => sum + item.leadTime, 0) / lineItems.length;
    if (avgLeadTime > 14) {
      risks.push({
        type: 'lead_time',
        description: 'Average lead time exceeds 2 weeks',
        probability: 0.4,
        impact: 5
      });
    }
    
    return risks;
  }

  // Helper methods
  
  private getDefaultConfiguration(): BOMConfiguration {
    return {
      includeLabor: true,
      includeShipping: true,
      includeWaste: true,
      wasteFactors: {
        'frame': 0.05,
        'glazing': 0.15,
        'foundation': 0.10,
        'hardware': 0.20,
        'sealant': 0.25
      },
      regionCode: 'US',
      taxRate: 0.08,
      markupPercentage: 0.15
    };
  }
  
  private initializeLaborRates(): void {
    this.laborRates.set('basic', 25);
    this.laborRates.set('intermediate', 35);
    this.laborRates.set('advanced', 50);
  }
  
  private initializeShippingRates(): void {
    this.shippingRates.set('standard', 0.05);
    this.shippingRates.set('expedited', 0.10);
    this.shippingRates.set('freight', 0.15);
  }
  
  private getAllComponents(model: GreenhouseModel): Component[] {
    const components: Component[] = [];
    
    // Collect all structural components
    components.push(...model.structure.foundation);
    components.push(...model.structure.frame);
    components.push(...model.structure.glazing);
    components.push(...model.structure.doors);
    components.push(...model.structure.hardware);
    
    // Collect all system components
    components.push(...model.systems.ventilation);
    components.push(...model.systems.electrical);
    components.push(...model.systems.plumbing);
    components.push(...model.systems.hvac);
    components.push(...model.systems.automation);
    
    return components;
  }
  
  private calculateUnitCost(material: Material, quantity: number, unit: UnitType): number {
    return this.materialDatabase.calculateMaterialCost(material.id, quantity, unit) / quantity;
  }
  
  private generateItemNumber(component: Component): string {
    const prefix = component.type.substring(0, 3).toUpperCase();
    const category = component.category.substring(0, 3).toUpperCase();
    const sequence = component.id.substring(component.id.length - 3);
    return `${prefix}-${category}-${sequence}`;
  }
  
  private generateSpecification(component: Component, material: Material): string {
    const specs = [];
    
    if (material.specifications.dimensions.length) {
      specs.push(`${material.specifications.dimensions.length}"L`);
    }
    if (material.specifications.dimensions.width) {
      specs.push(`${material.specifications.dimensions.width}"W`);
    }
    if (material.specifications.dimensions.thickness) {
      specs.push(`${material.specifications.dimensions.thickness}"T`);
    }
    if (material.specifications.finish) {
      specs.push(material.specifications.finish);
    }
    
    return specs.join(' x ');
  }
  
  private determineAvailability(material: Material): BOMLineItem['availability'] {
    if (material.availability.leadTime <= 3) return 'in_stock';
    if (material.availability.leadTime <= 14) return 'available';
    if (material.availability.leadTime <= 30) return 'backordered';
    return 'discontinued';
  }
  
  private determineCriticality(component: Component): BOMLineItem['criticality'] {
    if (component.category === 'foundation' || component.category === 'frame') {
      return 'critical';
    }
    if (component.category === 'glazing' || component.category === 'doors') {
      return 'important';
    }
    return 'standard';
  }
  
  private async findAlternatives(material: Material, component: Component): Promise<BOMLineItem['alternatives']> {
    const alternatives: BOMLineItem['alternatives'] = [];
    
    // Find materials in same category
    const similarMaterials = this.materialDatabase.getMaterialsByCategory(material.category)
      .filter(m => m.id !== material.id)
      .slice(0, 3);
    
    for (const altMaterial of similarMaterials) {
      const altCost = this.calculateUnitCost(altMaterial, component.properties.quantity, component.properties.unit);
      const originalCost = this.calculateUnitCost(material, component.properties.quantity, component.properties.unit);
      
      alternatives.push({
        materialId: altMaterial.id,
        description: altMaterial.name,
        costDifference: (altCost - originalCost) * component.properties.quantity,
        performanceDifference: 'Similar performance characteristics'
      });
    }
    
    return alternatives;
  }
  
  private calculateShipping(lineItems: BOMLineItem[]): number {
    const totalWeight = lineItems.reduce((sum, item) => sum + item.totalWeight, 0);
    const totalCost = lineItems.reduce((sum, item) => sum + item.totalCost, 0);
    
    // Use weight-based or cost-based shipping, whichever is higher
    const weightBasedShipping = totalWeight * 0.50; // $0.50 per pound
    const costBasedShipping = totalCost * 0.05; // 5% of material cost
    
    return Math.max(weightBasedShipping, costBasedShipping);
  }
  
  private getAssemblyName(sequence: number): string {
    const names = {
      0: 'Site Preparation & Foundation',
      1: 'Frame Structure Installation',
      2: 'Roof System Installation',
      3: 'Glazing Installation',
      4: 'Door & Hardware Installation',
      5: 'Ventilation System Installation',
      6: 'Electrical System Installation',
      7: 'Plumbing System Installation',
      8: 'HVAC System Installation',
      9: 'Automation System Installation',
      10: 'Final Inspection & Testing'
    };
    return names[sequence as keyof typeof names] || `Assembly Phase ${sequence}`;
  }
  
  private getEquipmentNeeded(sequence: number): string[] {
    const equipment = {
      0: ['excavator', 'concrete_mixer', 'compactor'],
      1: ['crane', 'scaffold', 'welding_equipment'],
      2: ['lift', 'rigging_equipment'],
      3: ['glass_suction_cups', 'glazing_tools'],
      4: ['basic_tools'],
      5: ['electrical_tools', 'ductwork_tools'],
      6: ['electrical_tools', 'conduit_bender'],
      7: ['plumbing_tools', 'pipe_cutter'],
      8: ['hvac_tools', 'refrigeration_tools'],
      9: ['control_panel_tools', 'computer']
    };
    return equipment[sequence as keyof typeof equipment] || [];
  }
  
  private getPrerequisites(sequence: number): string[] {
    const prerequisites = {
      0: [],
      1: ['foundation_cured'],
      2: ['frame_complete'],
      3: ['roof_structure_complete'],
      4: ['glazing_complete'],
      5: ['structure_complete'],
      6: ['structure_complete'],
      7: ['structure_complete'],
      8: ['electrical_rough_in'],
      9: ['all_systems_installed']
    };
    return prerequisites[sequence as keyof typeof prerequisites] || [];
  }
  
  private calculateAssemblyDuration(components: Component[]): number {
    const totalLaborHours = components.reduce((sum, c) => sum + c.assembly.laborHours, 0);
    const workingHoursPerDay = 8;
    const workersAssigned = 2;
    return Math.ceil(totalLaborHours / (workingHoursPerDay * workersAssigned));
  }
  
  private isCriticalPath(sequence: number): boolean {
    // Critical path items are those that delay overall completion
    const criticalSequences = [0, 1, 2, 3]; // Foundation, frame, roof, glazing
    return criticalSequences.includes(sequence);
  }
  
  private generateAssemblyInstructions(components: Component[]): string {
    const instructions = components.map(c => `- ${c.assembly.instructions}`).join('\n');
    return `Assembly Instructions:\n${instructions}`;
  }
  
  private getSafetyRequirements(sequence: number): string[] {
    const safety = {
      0: ['hard_hat', 'safety_vest', 'steel_toe_boots'],
      1: ['hard_hat', 'safety_harness', 'fall_protection'],
      2: ['hard_hat', 'safety_harness', 'fall_protection'],
      3: ['hard_hat', 'safety_glasses', 'cut_resistant_gloves'],
      4: ['hard_hat', 'safety_glasses'],
      5: ['hard_hat', 'safety_glasses'],
      6: ['hard_hat', 'electrical_safety_equipment'],
      7: ['hard_hat', 'safety_glasses'],
      8: ['hard_hat', 'safety_glasses'],
      9: ['hard_hat', 'safety_glasses']
    };
    return safety[sequence as keyof typeof safety] || ['hard_hat', 'safety_glasses'];
  }
  
  private getQualityChecks(sequence: number): string[] {
    const checks = {
      0: ['level_check', 'dimension_check', 'concrete_strength_test'],
      1: ['plumb_check', 'square_check', 'connection_torque'],
      2: ['structural_integrity', 'waterproofing_test'],
      3: ['seal_integrity', 'thermal_performance'],
      4: ['operation_test', 'seal_check'],
      5: ['airflow_test', 'control_test'],
      6: ['electrical_test', 'grounding_test'],
      7: ['pressure_test', 'leak_test'],
      8: ['performance_test', 'calibration_check'],
      9: ['system_integration_test', 'commissioning']
    };
    return checks[sequence as keyof typeof checks] || ['visual_inspection'];
  }
  
  private calculateCriticalPathDuration(assemblies: BOMAssembly[]): number {
    const criticalAssemblies = assemblies.filter(a => a.criticalPath);
    return criticalAssemblies.reduce((sum, a) => sum + a.duration, 0);
  }
  
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { BOMGenerator };
export default BOMGenerator;