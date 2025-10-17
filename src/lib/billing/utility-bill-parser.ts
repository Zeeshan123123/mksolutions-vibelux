/**
 * Utility Bill Parser & API Integration
 * Automatically extracts billing data from PDFs and utility APIs
 */

import { logger } from '@/lib/logging/production-logger';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import OpenAI from 'openai';

// Supported utility companies and their APIs
export const UTILITY_APIS = {
  'PG&E': {
    apiUrl: 'https://api.pge.com/GreenButtonConnect',
    authType: 'oauth2',
    dataFormat: 'greenbutton',
    supported: true
  },
  'SCE': {
    apiUrl: 'https://api.sce.com/api/v2',
    authType: 'oauth2',
    dataFormat: 'json',
    supported: true
  },
  'ConEd': {
    apiUrl: 'https://api.coned.com/api/v1',
    authType: 'apikey',
    dataFormat: 'json',
    supported: true
  },
  'ComEd': {
    apiUrl: 'https://api.comed.com/api',
    authType: 'oauth2',
    dataFormat: 'greenbutton',
    supported: true
  },
  'Duke Energy': {
    apiUrl: 'https://api.duke-energy.com/v1',
    authType: 'oauth2',
    dataFormat: 'json',
    supported: true
  },
  'Florida Power & Light': {
    apiUrl: 'https://api.fpl.com/v2',
    authType: 'oauth2',
    dataFormat: 'json',
    supported: true
  },
  'Xcel Energy': {
    apiUrl: 'https://api.xcelenergy.com',
    authType: 'oauth2',
    dataFormat: 'greenbutton',
    supported: true
  }
};

export interface UtilityBillData {
  // Account Information
  accountNumber: string;
  customerName: string;
  serviceAddress: string;
  meterNumber: string;
  
  // Billing Period
  billDate: Date;
  periodStart: Date;
  periodEnd: Date;
  billingDays: number;
  
  // Usage Data
  kwhUsage: number;
  previousUsage: number;
  peakDemand?: number;
  powerFactor?: number;
  
  // Cost Breakdown
  energyCharges: number;
  demandCharges?: number;
  transmissionCharges?: number;
  distributionCharges?: number;
  taxes: number;
  fees: number;
  totalCost: number;
  
  // Rate Information
  rateSchedule: string;
  energyRate: number; // $/kWh
  demandRate?: number; // $/kW
  timeOfUseRates?: {
    peak: number;
    offPeak: number;
    superOffPeak?: number;
  };
  
  // Additional Data
  utilityCompany: string;
  documentUrl?: string;
  rawData?: any;
  confidence: number; // 0-100 parsing confidence
}

export class UtilityBillParser {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  /**
   * Parse utility bill from multiple sources
   */
  async parseBill(source: {
    type: 'pdf' | 'image' | 'api' | 'manual';
    data: Buffer | string | any;
    utilityCompany?: string;
  }): Promise<UtilityBillData> {
    logger.info('billing', `Parsing utility bill from ${source.type}`);
    
    switch (source.type) {
      case 'pdf':
        return this.parsePDFBill(source.data as Buffer, source.utilityCompany);
      case 'image':
        return this.parseImageBill(source.data as Buffer, source.utilityCompany);
      case 'api':
        return this.parseAPIData(source.data, source.utilityCompany!);
      case 'manual':
        return this.validateManualEntry(source.data);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }
  
  /**
   * Parse PDF utility bill using AI
   */
  private async parsePDFBill(pdfBuffer: Buffer, utilityCompany?: string): Promise<UtilityBillData> {
    try {
      // Extract text from PDF
      const pdfData = await pdfParse(pdfBuffer);
      const text = pdfData.text;
      
      // Use GPT-4 to extract structured data
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a utility bill parser. Extract the following information from the bill text and return as JSON:
              - accountNumber
              - customerName
              - serviceAddress
              - meterNumber
              - billDate (ISO format)
              - periodStart (ISO format)
              - periodEnd (ISO format)
              - billingDays
              - kwhUsage
              - previousUsage
              - peakDemand (if available)
              - energyCharges
              - demandCharges (if available)
              - taxes
              - fees
              - totalCost
              - rateSchedule
              - energyRate (per kWh)
              - utilityCompany
              
              If any field is not found, use null. All monetary values should be in dollars (no $ symbol).`
          },
          {
            role: 'user',
            content: `Parse this ${utilityCompany || 'utility'} bill:\n\n${text.substring(0, 8000)}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      });
      
      const parsedData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and enhance parsed data
      return this.validateAndEnhanceBillData(parsedData, text);
      
    } catch (error) {
      logger.error('billing', 'PDF parsing failed', error as Error);
      throw new Error('Failed to parse PDF bill');
    }
  }
  
  /**
   * Parse image bill using OCR + AI
   */
  private async parseImageBill(imageBuffer: Buffer, utilityCompany?: string): Promise<UtilityBillData> {
    try {
      // Use Tesseract.js for OCR
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(imageBuffer);
      await worker.terminate();
      
      // Now parse the OCR text using GPT-4
      return this.parsePDFBill(Buffer.from(text), utilityCompany);
      
    } catch (error) {
      logger.error('billing', 'Image OCR failed', error as Error);
      throw new Error('Failed to parse image bill');
    }
  }
  
  /**
   * Connect to utility API and fetch data
   */
  async connectToUtilityAPI(params: {
    utilityCompany: string;
    accountNumber: string;
    credentials: {
      username?: string;
      password?: string;
      apiKey?: string;
      accessToken?: string;
    };
  }): Promise<UtilityBillData[]> {
    const utilityConfig = UTILITY_APIS[params.utilityCompany];
    
    if (!utilityConfig || !utilityConfig.supported) {
      throw new Error(`Utility company ${params.utilityCompany} not supported`);
    }
    
    logger.info('billing', `Connecting to ${params.utilityCompany} API`);
    
    try {
      // Handle OAuth2 authentication
      if (utilityConfig.authType === 'oauth2') {
        const token = await this.getOAuth2Token(utilityConfig, params.credentials);
        params.credentials.accessToken = token;
      }
      
      // Fetch billing data
      const response = await fetch(`${utilityConfig.apiUrl}/accounts/${params.accountNumber}/bills`, {
        headers: {
          'Authorization': utilityConfig.authType === 'apikey' 
            ? `ApiKey ${params.credentials.apiKey}`
            : `Bearer ${params.credentials.accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Parse based on data format
      if (utilityConfig.dataFormat === 'greenbutton') {
        return this.parseGreenButtonData(data);
      } else {
        return this.parseAPIData(data, params.utilityCompany);
      }
      
    } catch (error) {
      logger.error('billing', 'API connection failed', error as Error);
      throw error;
    }
  }
  
  /**
   * Parse Green Button standard data format
   */
  private parseGreenButtonData(data: any): UtilityBillData[] {
    const bills: UtilityBillData[] = [];
    
    // Green Button XML/JSON parsing
    const entries = data.feed?.entry || [];
    
    for (const entry of entries) {
      const content = entry.content;
      const intervalBlock = content.IntervalBlock;
      
      if (!intervalBlock) continue;
      
      const bill: UtilityBillData = {
        accountNumber: content.accountId || '',
        customerName: content.customerName || '',
        serviceAddress: content.serviceLocation || '',
        meterNumber: content.meterId || '',
        billDate: new Date(intervalBlock.interval.start),
        periodStart: new Date(intervalBlock.interval.start),
        periodEnd: new Date(intervalBlock.interval.end),
        billingDays: 0,
        kwhUsage: 0,
        previousUsage: 0,
        energyCharges: 0,
        taxes: 0,
        fees: 0,
        totalCost: 0,
        rateSchedule: content.tariffProfile || '',
        energyRate: 0,
        utilityCompany: '',
        confidence: 95
      };
      
      // Calculate usage from interval readings
      for (const reading of intervalBlock.IntervalReading || []) {
        bill.kwhUsage += reading.value / 1000; // Convert Wh to kWh
        if (reading.cost) {
          bill.totalCost += reading.cost / 100; // Convert cents to dollars
        }
      }
      
      // Calculate billing days
      bill.billingDays = Math.round(
        (bill.periodEnd.getTime() - bill.periodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Calculate rate
      if (bill.kwhUsage > 0) {
        bill.energyRate = bill.totalCost / bill.kwhUsage;
      }
      
      bills.push(bill);
    }
    
    return bills;
  }
  
  /**
   * Parse utility-specific API data
   */
  private parseAPIData(data: any, utilityCompany: string): UtilityBillData[] {
    // Map utility-specific JSON to standard format
    const bills: UtilityBillData[] = [];
    
    // Handle different utility formats
    switch (utilityCompany) {
      case 'PG&E':
        return this.parsePGEData(data);
      case 'SCE':
        return this.parseSCEData(data);
      case 'ConEd':
        return this.parseConEdData(data);
      default:
        // Generic parsing
        const billArray = Array.isArray(data) ? data : [data];
        
        for (const billData of billArray) {
          bills.push({
            accountNumber: billData.accountNumber || billData.account_number || '',
            customerName: billData.customerName || billData.customer_name || '',
            serviceAddress: billData.serviceAddress || billData.service_address || '',
            meterNumber: billData.meterNumber || billData.meter_number || '',
            billDate: new Date(billData.billDate || billData.bill_date),
            periodStart: new Date(billData.periodStart || billData.period_start),
            periodEnd: new Date(billData.periodEnd || billData.period_end),
            billingDays: billData.billingDays || billData.billing_days || 30,
            kwhUsage: billData.kwhUsage || billData.kwh_usage || 0,
            previousUsage: billData.previousUsage || billData.previous_usage || 0,
            peakDemand: billData.peakDemand || billData.peak_demand,
            energyCharges: billData.energyCharges || billData.energy_charges || 0,
            demandCharges: billData.demandCharges || billData.demand_charges,
            taxes: billData.taxes || 0,
            fees: billData.fees || 0,
            totalCost: billData.totalCost || billData.total_cost || billData.amount || 0,
            rateSchedule: billData.rateSchedule || billData.rate_schedule || '',
            energyRate: billData.energyRate || billData.energy_rate || 0,
            utilityCompany,
            rawData: billData,
            confidence: 90
          });
        }
    }
    
    return bills;
  }
  
  /**
   * Parse PG&E specific data format
   */
  private parsePGEData(data: any): UtilityBillData[] {
    const bills: UtilityBillData[] = [];
    
    for (const bill of data.bills || []) {
      bills.push({
        accountNumber: bill.accountId,
        customerName: data.accountHolder,
        serviceAddress: bill.servicePoint.address,
        meterNumber: bill.servicePoint.meterId,
        billDate: new Date(bill.statementDate),
        periodStart: new Date(bill.servicePeriod.start),
        periodEnd: new Date(bill.servicePeriod.end),
        billingDays: bill.servicePeriod.days,
        kwhUsage: bill.usage.electricity.total,
        previousUsage: bill.usage.electricity.previous,
        peakDemand: bill.demand?.peak,
        energyCharges: bill.charges.energy,
        demandCharges: bill.charges.demand,
        transmissionCharges: bill.charges.transmission,
        distributionCharges: bill.charges.distribution,
        taxes: bill.charges.taxes,
        fees: bill.charges.fees,
        totalCost: bill.totalAmount,
        rateSchedule: bill.tariff,
        energyRate: bill.rates.energy,
        demandRate: bill.rates.demand,
        timeOfUseRates: {
          peak: bill.rates.touPeak,
          offPeak: bill.rates.touOffPeak,
          superOffPeak: bill.rates.touSuperOffPeak
        },
        utilityCompany: 'PG&E',
        confidence: 100
      });
    }
    
    return bills;
  }
  
  /**
   * Parse SCE specific data format
   */
  private parseSCEData(data: any): UtilityBillData[] {
    const bills: UtilityBillData[] = [];
    
    for (const statement of data.statements || []) {
      bills.push({
        accountNumber: statement.account.number,
        customerName: statement.account.name,
        serviceAddress: statement.service.address,
        meterNumber: statement.meter.id,
        billDate: new Date(statement.date),
        periodStart: new Date(statement.period.from),
        periodEnd: new Date(statement.period.to),
        billingDays: statement.period.days,
        kwhUsage: statement.electricity.kwh,
        previousUsage: statement.electricity.previousKwh,
        peakDemand: statement.demand?.max,
        energyCharges: statement.costs.generation,
        demandCharges: statement.costs.demand,
        transmissionCharges: statement.costs.transmission,
        distributionCharges: statement.costs.distribution,
        taxes: statement.costs.taxes,
        fees: statement.costs.publicPurpose,
        totalCost: statement.total,
        rateSchedule: statement.rate.schedule,
        energyRate: statement.rate.perKwh,
        demandRate: statement.rate.perKw,
        utilityCompany: 'SCE',
        confidence: 100
      });
    }
    
    return bills;
  }
  
  /**
   * Parse ConEd specific data format
   */
  private parseConEdData(data: any): UtilityBillData[] {
    const bills: UtilityBillData[] = [];
    
    for (const invoice of data.invoices || []) {
      bills.push({
        accountNumber: invoice.accountNumber,
        customerName: invoice.customerName,
        serviceAddress: invoice.premiseAddress,
        meterNumber: invoice.meterNumber,
        billDate: new Date(invoice.billDate),
        periodStart: new Date(invoice.readingPeriod.start),
        periodEnd: new Date(invoice.readingPeriod.end),
        billingDays: invoice.readingPeriod.days,
        kwhUsage: invoice.consumption.kwh,
        previousUsage: invoice.consumption.previousKwh,
        peakDemand: invoice.peakDemand,
        energyCharges: invoice.charges.supply + invoice.charges.delivery,
        taxes: invoice.charges.taxes,
        fees: invoice.charges.otherCharges,
        totalCost: invoice.totalDue,
        rateSchedule: invoice.rateClass,
        energyRate: invoice.effectiveRate,
        utilityCompany: 'ConEd',
        confidence: 100
      });
    }
    
    return bills;
  }
  
  /**
   * Get OAuth2 token for utility API
   */
  private async getOAuth2Token(config: any, credentials: any): Promise<string> {
    const tokenUrl = `${config.apiUrl}/oauth/token`;
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
        client_id: process.env.UTILITY_CLIENT_ID || '',
        client_secret: process.env.UTILITY_CLIENT_SECRET || ''
      })
    });
    
    if (!response.ok) {
      throw new Error('OAuth2 authentication failed');
    }
    
    const data = await response.json();
    return data.access_token;
  }
  
  /**
   * Validate and enhance parsed bill data
   */
  private validateAndEnhanceBillData(data: any, originalText?: string): UtilityBillData {
    // Set defaults and validate
    const bill: UtilityBillData = {
      accountNumber: data.accountNumber || 'UNKNOWN',
      customerName: data.customerName || '',
      serviceAddress: data.serviceAddress || '',
      meterNumber: data.meterNumber || '',
      billDate: data.billDate ? new Date(data.billDate) : new Date(),
      periodStart: data.periodStart ? new Date(data.periodStart) : new Date(),
      periodEnd: data.periodEnd ? new Date(data.periodEnd) : new Date(),
      billingDays: data.billingDays || 30,
      kwhUsage: parseFloat(data.kwhUsage) || 0,
      previousUsage: parseFloat(data.previousUsage) || 0,
      peakDemand: data.peakDemand ? parseFloat(data.peakDemand) : undefined,
      energyCharges: parseFloat(data.energyCharges) || 0,
      demandCharges: data.demandCharges ? parseFloat(data.demandCharges) : undefined,
      taxes: parseFloat(data.taxes) || 0,
      fees: parseFloat(data.fees) || 0,
      totalCost: parseFloat(data.totalCost) || 0,
      rateSchedule: data.rateSchedule || '',
      energyRate: parseFloat(data.energyRate) || 0,
      utilityCompany: data.utilityCompany || this.detectUtilityCompany(originalText || ''),
      confidence: 0
    };
    
    // Calculate confidence score
    let confidence = 0;
    let fieldsFound = 0;
    const totalFields = 15;
    
    if (bill.accountNumber !== 'UNKNOWN') fieldsFound++;
    if (bill.customerName) fieldsFound++;
    if (bill.serviceAddress) fieldsFound++;
    if (bill.kwhUsage > 0) fieldsFound++;
    if (bill.totalCost > 0) fieldsFound++;
    if (bill.billDate.getTime() > 0) fieldsFound++;
    if (bill.periodStart.getTime() > 0) fieldsFound++;
    if (bill.periodEnd.getTime() > 0) fieldsFound++;
    if (bill.energyCharges > 0) fieldsFound++;
    if (bill.rateSchedule) fieldsFound++;
    if (bill.energyRate > 0) fieldsFound++;
    if (bill.utilityCompany) fieldsFound++;
    
    confidence = Math.round((fieldsFound / totalFields) * 100);
    bill.confidence = confidence;
    
    // Validate totals
    if (bill.totalCost === 0 && bill.energyCharges > 0) {
      bill.totalCost = bill.energyCharges + (bill.demandCharges || 0) + bill.taxes + bill.fees;
    }
    
    // Calculate energy rate if missing
    if (bill.energyRate === 0 && bill.kwhUsage > 0 && bill.energyCharges > 0) {
      bill.energyRate = bill.energyCharges / bill.kwhUsage;
    }
    
    // Calculate billing days if missing
    if (bill.billingDays === 0) {
      bill.billingDays = Math.round(
        (bill.periodEnd.getTime() - bill.periodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    
    return bill;
  }
  
  /**
   * Detect utility company from text
   */
  private detectUtilityCompany(text: string): string {
    const companies = Object.keys(UTILITY_APIS);
    const textLower = text.toLowerCase();
    
    for (const company of companies) {
      if (textLower.includes(company.toLowerCase())) {
        return company;
      }
    }
    
    // Check for common utility company names
    if (textLower.includes('pacific gas')) return 'PG&E';
    if (textLower.includes('southern california edison')) return 'SCE';
    if (textLower.includes('consolidated edison')) return 'ConEd';
    if (textLower.includes('commonwealth edison')) return 'ComEd';
    if (textLower.includes('duke')) return 'Duke Energy';
    if (textLower.includes('florida power')) return 'Florida Power & Light';
    if (textLower.includes('xcel')) return 'Xcel Energy';
    
    return 'Unknown';
  }
  
  /**
   * Validate manual entry data
   */
  private validateManualEntry(data: any): UtilityBillData {
    return this.validateAndEnhanceBillData(data);
  }
}

// Export singleton instance
export const utilityBillParser = new UtilityBillParser();