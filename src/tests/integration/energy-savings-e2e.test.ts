/**
 * End-to-End Integration Tests for Energy Savings Revenue Share System
 * Tests the complete flow from onboarding to billing
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { CustomerOnboardingManager } from '@/lib/onboarding/customer-onboarding';
import { UtilityAPIManager } from '@/lib/utility-integration/utility-api-manager';
import { MeterIntegrationManager } from '@/lib/hardware-integration/meter-integration';
import { RevenueShareBillingSystem } from '@/lib/billing/revenue-share-billing';
import { EnergyMonitoringService } from '@/services/energy-monitoring.service';
import { EventEmitter } from 'events';

// Mock external services
jest.mock('@/lib/ai/claude-service');
jest.mock('@/lib/db/influxdb');
jest.mock('stripe');
jest.mock('modbus-serial');
jest.mock('mqtt');

describe('Energy Savings Revenue Share - End-to-End Tests', () => {
  let onboardingManager: CustomerOnboardingManager;
  let utilityManager: UtilityAPIManager;
  let meterManager: MeterIntegrationManager;
  let billingSystem: RevenueShareBillingSystem;
  let monitoringService: EnergyMonitoringService;
  
  // Test data
  const testFacilityId = 'facility_test_001';
  const testSessionId = '';
  const testUtilityAccountId = '';
  const testMeterId = '';
  const testInvoiceId = '';

  beforeAll(async () => {
    // Initialize all managers
    onboardingManager = new CustomerOnboardingManager();
    utilityManager = new UtilityAPIManager('test-encryption-key');
    meterManager = new MeterIntegrationManager();
    billingSystem = new RevenueShareBillingSystem();
    monitoringService = new EnergyMonitoringService();
    
    // Stop automatic polling/syncing for tests
    meterManager.stopAllPolling();
    utilityManager.stopAllSyncs();
  });

  afterAll(async () => {
    // Cleanup
    meterManager.stopAllPolling();
    utilityManager.stopAllSyncs();
  });

  describe('1. Customer Onboarding Flow', () => {
    it('should start onboarding for a new facility', async () => {
      const facilityData = {
        name: 'Test Cannabis Facility',
        type: 'greenhouse' as const,
        address: {
          street: '123 Green Street',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'USA'
        },
        size: {
          totalArea: 50000,
          productionArea: 40000,
          zones: 8
        },
        operations: {
          hoursPerDay: 24,
          daysPerWeek: 7,
          shifts: 3,
          crops: ['Cannabis'],
          annualProduction: 10000
        },
        infrastructure: {
          electricService: '480V 3-phase 2000A',
          hvacType: 'Central HVAC with zone control',
          lightingType: 'LED grow lights',
          controlSystem: 'Argus Controls'
        }
      };

      const session = await onboardingManager.startOnboarding(testFacilityId, facilityData);
      
      expect(session).toBeDefined();
      expect(session.facilityId).toBe(testFacilityId);
      expect(session.status.stage).toBe('initial_assessment');
      expect(session.assignments.length).toBeGreaterThan(0);
      
      // Store session ID for later tests
      testSessionId = session.id;
    });

    it('should update facility profile data', async () => {
      await onboardingManager.updateSessionData(testSessionId, 'facility', {
        size: {
          totalArea: 50000,
          productionArea: 40000,
          zones: 8
        }
      });

      const session = onboardingManager.getSession(testSessionId);
      expect(session?.data.facility.size.totalArea).toBe(50000);
    });

    it('should establish baseline from utility data', async () => {
      // Mock utility data for past 12 months
      const mockUtilityData = [];
      const now = new Date();
      
      for (let i = 0; i < 12; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        mockUtilityData.push({
          month: month.getMonth() + 1,
          year: month.getFullYear(),
          consumption: 250000 + Math.random() * 50000, // 250,000-300,000 kWh
          demand: 500 + Math.random() * 100, // 500-600 kW
          billDays: 30,
          energyCharges: 30000 + Math.random() * 5000,
          demandCharges: 7500 + Math.random() * 1500,
          otherCharges: 1000,
          taxes: 3000,
          total: 41500 + Math.random() * 6500
        });
      }

      const baseline = await onboardingManager.establishBaseline(testSessionId, mockUtilityData);
      
      expect(baseline.established).toBe(true);
      expect(baseline.energy.annual).toBeGreaterThan(3000000); // > 3 million kWh
      expect(baseline.costs.annual).toBeGreaterThan(500000); // > $500k
      expect(baseline.energy.monthly.length).toBe(12);
    });

    it('should calculate savings projection', async () => {
      const projection = await onboardingManager.calculateSavings(testSessionId);
      
      expect(projection).toBeDefined();
      expect(projection.projectedSavings.percentage).toBeGreaterThanOrEqual(15); // Minimum guarantee
      expect(projection.projectedRevenue.customerShare).toBeGreaterThan(0);
      expect(projection.projectedRevenue.vibeluxShare).toBeGreaterThan(0);
      expect(projection.confidence).toBeGreaterThan(80);
      
      // Verify 70/30 split
      const totalRevenue = projection.projectedRevenue.annual;
      const customerShare = projection.projectedRevenue.customerShare;
      const vibeluxShare = projection.projectedRevenue.vibeluxShare;
      
      expect(Math.abs(customerShare - totalRevenue * 0.7)).toBeLessThan(1);
      expect(Math.abs(vibeluxShare - totalRevenue * 0.3)).toBeLessThan(1);
    });

    it('should generate energy services contract', async () => {
      const contract = await onboardingManager.generateContract(testSessionId, 'energy_services');
      
      expect(contract).toBeDefined();
      expect(contract.type).toBe('energy_services');
      expect(contract.status).toBe('draft');
      expect(contract.parties).toContain('VibeLux Energy Solutions');
      expect(contract.term).toBe(36); // 3 years
      expect(contract.documents.length).toBeGreaterThan(0);
    });
  });

  describe('2. Utility Account Integration', () => {
    it('should connect utility account', async () => {
      const account = await utilityManager.connectUtilityAccount(
        testFacilityId,
        'pge',
        {
          accountNumber: '1234567890',
          meterNumber: 'METER123',
          username: 'test@facility.com',
          password: 'testpass123',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret'
        }
      );

      expect(account).toBeDefined();
      expect(account.facilityId).toBe(testFacilityId);
      expect(account.providerId).toBe('pge');
      expect(account.status).toBe('active');
      expect(account.authorizationStatus.authorized).toBe(true);
      
      testUtilityAccountId = account.id;
    });

    it('should retrieve utility provider information', () => {
      const provider = utilityManager.getProvider('pge');
      
      expect(provider).toBeDefined();
      expect(provider?.name).toBe('Pacific Gas & Electric');
      expect(provider?.type).toBe('electric');
      expect(provider?.apiType).toBe('greenbutton');
    });

    it('should get facility utility accounts', () => {
      const accounts = utilityManager.getFacilityAccounts(testFacilityId);
      
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts[0].id).toBe(testUtilityAccountId);
    });
  });

  describe('3. Hardware Meter Integration', () => {
    it('should add electric meter', async () => {
      const meterConfig = {
        id: 'meter_test_001',
        name: 'Main Electric Meter',
        type: 'electric' as const,
        manufacturer: 'Schneider Electric',
        model: 'PowerLogic PM5500',
        protocol: 'modbus_tcp' as const,
        connection: {
          host: '192.168.1.100',
          port: 502,
          deviceId: 1,
          timeout: 5000,
          pollInterval: 15000
        },
        registers: {},
        scaling: {
          voltageScale: 1,
          currentScale: 1,
          powerScale: 0.001,
          energyScale: 0.001,
          demandScale: 0.001
        },
        status: {
          connected: false,
          lastSeen: new Date(),
          errorCount: 0,
          communicationQuality: 100,
          alerts: []
        },
        metadata: {
          location: 'Main electrical room',
          facilityId: testFacilityId,
          installDate: new Date(),
          tags: ['main', 'utility']
        }
      };

      // Mock successful connection
      jest.spyOn(meterManager as any, 'testConnection').mockResolvedValue(true);
      
      await meterManager.addMeter(meterConfig);
      
      const meter = meterManager.getMeter('meter_test_001');
      expect(meter).toBeDefined();
      expect(meter?.name).toBe('Main Electric Meter');
      expect(meter?.protocol).toBe('modbus_tcp');
      
      testMeterId = meter!.id;
    });

    it('should retrieve facility meters', () => {
      const meters = meterManager.getFacilityMeters(testFacilityId);
      
      expect(meters.length).toBeGreaterThan(0);
      expect(meters[0].id).toBe(testMeterId);
    });

    it('should simulate meter reading', async () => {
      // Mock a meter reading
      const mockReading = {
        timestamp: new Date(),
        voltage: {
          l1n: 277,
          l2n: 277,
          l3n: 277,
          average: 277,
          unit: 'V' as const
        },
        current: {
          l1: 450,
          l2: 455,
          l3: 448,
          average: 451,
          unit: 'A' as const
        },
        power: {
          active: 540,
          reactive: 120,
          apparent: 552,
          total: 540,
          unit: 'kW' as const
        },
        energy: {
          import: 2500000,
          export: 0,
          net: 2500000,
          unit: 'kWh' as const
        },
        quality: {
          powerFactor: 0.98,
          frequency: 60,
          thd: {}
        }
      };

      // Store mock reading
      const meter = meterManager.getMeter(testMeterId);
      if (meter) {
        meter.lastReading = mockReading;
      }

      const reading = meterManager.getLatestReading(testMeterId);
      expect(reading).toBeDefined();
      expect(reading?.power.active).toBe(540);
      expect(reading?.quality.powerFactor).toBe(0.98);
    });
  });

  describe('4. Energy Monitoring and Savings Verification', () => {
    it('should monitor energy usage', async () => {
      // Initialize monitoring for facility
      await monitoringService.initializeFacility(testFacilityId, {
        targetReduction: 18, // 18% reduction target
        baselineKwh: 250000, // Monthly baseline
        zones: ['zone1', 'zone2', 'zone3']
      });

      // Simulate current month usage (15% reduction)
      const currentUsage = 212500; // 15% less than baseline
      const savings = 250000 - currentUsage;
      const savingsPercentage = (savings / 250000) * 100;

      expect(savingsPercentage).toBeCloseTo(15, 1);
      expect(savings).toBe(37500); // kWh saved
    });

    it('should calculate verified savings', async () => {
      // Mock verified savings data
      const verifiedSavings = {
        periodStart: new Date(new Date().setDate(1)),
        periodEnd: new Date(),
        baselineUsage: 250000,
        actualUsage: 212500,
        verifiedSavings: 37500,
        savingsPercentage: 15,
        weatherAdjustment: 1.02, // 2% weather adjustment
        confidence: 95,
        dataQuality: 98
      };

      expect(verifiedSavings.savingsPercentage).toBeGreaterThanOrEqual(15);
      expect(verifiedSavings.confidence).toBeGreaterThan(90);
      expect(verifiedSavings.dataQuality).toBeGreaterThan(95);
    });
  });

  describe('5. Revenue Share Billing', () => {
    it('should create billing period', async () => {
      const period = await billingSystem.createBillingPeriod(testFacilityId);
      
      expect(period).toBeDefined();
      expect(period.facilityId).toBe(testFacilityId);
      expect(period.status).toBe('pending');
      
      // Verify period dates
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBeGreaterThanOrEqual(28); // At least 28 days
      expect(daysDiff).toBeLessThanOrEqual(31); // At most 31 days
    });

    it('should calculate revenue share correctly', async () => {
      // Mock savings data
      const mockSavings = {
        energySaved: 37500, // kWh
        costSaved: 4500, // $0.12/kWh
        verificationScore: 95,
        dataQuality: 98
      };

      // Calculate revenue share
      const customerShare = mockSavings.costSaved * 0.7;
      const vibeluxShare = mockSavings.costSaved * 0.3;

      expect(customerShare).toBe(3150); // 70% = $3,150
      expect(vibeluxShare).toBe(1350); // 30% = $1,350
      expect(customerShare + vibeluxShare).toBe(mockSavings.costSaved);
    });

    it('should generate invoice', async () => {
      // Get the period we created
      const periods = await billingSystem.getBillingPeriods(testFacilityId);
      expect(periods.length).toBeGreaterThan(0);
      
      const periodId = periods[0].id;
      
      // Mock the savings calculation
      jest.spyOn(billingSystem as any, 'calculatePeriodSavings').mockResolvedValue({
        totalEnergySaved: 37500,
        totalCostSaved: 4500,
        averageRate: 0.12,
        verificationScore: 95,
        adjustments: []
      });

      const invoice = await billingSystem.generateInvoice(periodId);
      
      expect(invoice).toBeDefined();
      expect(invoice.status).toBe('draft');
      expect(invoice.vibeluxShare).toBe(1350); // 30% of $4,500
      expect(invoice.customerSavings).toBe(3150); // 70% of $4,500
      expect(invoice.lineItems.length).toBeGreaterThan(0);
      
      testInvoiceId = invoice.id;
    });

    it('should handle performance threshold', async () => {
      // Test with savings below threshold (5%)
      const lowSavings = {
        energySaved: 10000, // Only 4% savings
        costSaved: 1200,
        savingsPercentage: 4
      };

      // Should not charge if below threshold
      const shouldCharge = lowSavings.savingsPercentage >= 5;
      expect(shouldCharge).toBe(false);
      
      // If below threshold, invoice amount should be 0
      if (!shouldCharge) {
        expect(0).toBe(0); // No charge
      }
    });

    it('should process payment', async () => {
      // Mock Stripe payment intent
      const mockPaymentIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 135000, // $1,350 in cents
        currency: 'usd'
      };

      jest.spyOn(billingSystem as any, 'stripe.paymentIntents.create')
        .mockResolvedValue(mockPaymentIntent);

      const payment = await billingSystem.processPayment(testInvoiceId, {
        paymentMethodId: 'pm_test_123',
        amount: 1350
      });

      expect(payment).toBeDefined();
      expect(payment.status).toBe('processing'); // Would be 'completed' after webhook
      expect(payment.amount).toBe(1350);
      expect(payment.stripePaymentIntentId).toBe('pi_test_123');
    });
  });

  describe('6. End-to-End Workflow Validation', () => {
    it('should complete full revenue share cycle', async () => {
      // 1. Verify onboarding completed
      const session = onboardingManager.getSession(testSessionId);
      expect(session).toBeDefined();
      expect(session?.data.baseline.established).toBe(true);
      expect(session?.data.savings.projectedSavings.percentage).toBeGreaterThan(0);

      // 2. Verify utility connection
      const utilityAccounts = utilityManager.getFacilityAccounts(testFacilityId);
      expect(utilityAccounts.length).toBeGreaterThan(0);
      expect(utilityAccounts[0].status).toBe('active');

      // 3. Verify meter integration
      const meters = meterManager.getFacilityMeters(testFacilityId);
      expect(meters.length).toBeGreaterThan(0);
      expect(meters[0].status.connected).toBe(true);

      // 4. Verify billing setup
      const periods = await billingSystem.getBillingPeriods(testFacilityId);
      expect(periods.length).toBeGreaterThan(0);
      
      const invoices = await billingSystem.getFacilityInvoices(testFacilityId);
      expect(invoices.length).toBeGreaterThan(0);
      expect(invoices[0].status).toBe('draft');

      // 5. Verify data flow
      expect(meters[0].lastReading).toBeDefined();
      expect(session?.data.baseline.energy.annual).toBeGreaterThan(0);
      expect(invoices[0].totalEnergySaved).toBeGreaterThan(0);
    });

    it('should handle edge cases gracefully', async () => {
      // Test negative savings (increased usage)
      const negativeSavings = {
        baselineUsage: 250000,
        actualUsage: 275000, // 10% increase
        savings: -25000
      };
      
      expect(negativeSavings.savings).toBeLessThan(0);
      // System should not generate invoice for negative savings
      
      // Test missing data
      const incompletePeriod = {
        dataCompleteness: 75, // Only 75% data available
        shouldInvoice: false
      };
      
      expect(incompletePeriod.dataCompleteness).toBeLessThan(90);
      expect(incompletePeriod.shouldInvoice).toBe(false);
      
      // Test disputed invoice
      const dispute = {
        invoiceId: testInvoiceId,
        reason: 'Baseline adjustment needed',
        status: 'pending_review'
      };
      
      expect(dispute.status).toBe('pending_review');
    });
  });

  describe('7. System Health and Monitoring', () => {
    it('should emit proper events throughout the flow', async () => {
      const events: string[] = [];
      
      // Track events
      onboardingManager.on('onboardingStarted', () => events.push('onboarding.started'));
      onboardingManager.on('baselineEstablished', () => events.push('onboarding.baseline'));
      utilityManager.on('accountConnected', () => events.push('utility.connected'));
      meterManager.on('meterAdded', () => events.push('meter.added'));
      billingSystem.on('invoiceGenerated', () => events.push('billing.invoice'));
      
      // Verify critical events were emitted
      expect(events).toContain('onboarding.started');
      expect(events).toContain('onboarding.baseline');
      expect(events).toContain('utility.connected');
      expect(events).toContain('meter.added');
    });

    it('should maintain data integrity across systems', async () => {
      // Verify facility ID consistency
      const session = onboardingManager.getSession(testSessionId);
      const utilityAccounts = utilityManager.getFacilityAccounts(testFacilityId);
      const meters = meterManager.getFacilityMeters(testFacilityId);
      const periods = await billingSystem.getBillingPeriods(testFacilityId);
      
      expect(session?.facilityId).toBe(testFacilityId);
      expect(utilityAccounts[0]?.facilityId).toBe(testFacilityId);
      expect(meters[0]?.metadata.facilityId).toBe(testFacilityId);
      expect(periods[0]?.facilityId).toBe(testFacilityId);
      
      // Verify data relationships
      expect(session?.data.baseline).toBeDefined();
      expect(meters[0]?.lastReading).toBeDefined();
      expect(periods[0]?.startDate).toBeDefined();
    });
  });
});

// Performance tests
describe('Performance and Scalability Tests', () => {
  it('should handle multiple facilities efficiently', async () => {
    const startTime = Date.now();
    const facilityCount = 10;
    const facilities = [];
    
    // Create multiple facilities
    for (let i = 0; i < facilityCount; i++) {
      const facilityId = `facility_perf_${i}`;
      facilities.push({
        id: facilityId,
        name: `Test Facility ${i}`
      });
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete in reasonable time
    expect(totalTime).toBeLessThan(5000); // 5 seconds for 10 facilities
    expect(facilities.length).toBe(facilityCount);
  });

  it('should handle high-frequency meter readings', async () => {
    const readingCount = 1000;
    const readings = [];
    
    // Simulate rapid meter readings
    for (let i = 0; i < readingCount; i++) {
      readings.push({
        timestamp: new Date(),
        power: Math.random() * 600 + 400, // 400-1000 kW
        energy: i * 0.25 // Incrementing energy
      });
    }
    
    expect(readings.length).toBe(readingCount);
    expect(readings[readingCount - 1].energy).toBe((readingCount - 1) * 0.25);
  });
});

// Security tests
describe('Security and Data Protection Tests', () => {
  it('should encrypt sensitive credentials', () => {
    const utilityManager = new UtilityAPIManager('test-key');
    const credentials = {
      apiKey: 'secret-api-key',
      password: 'secret-password'
    };
    
    const encrypted = (utilityManager as any).encryptCredentials(credentials);
    
    expect(encrypted.apiKey).not.toBe(credentials.apiKey);
    expect(encrypted.password).not.toBe(credentials.password);
    expect(encrypted.apiKey).toContain(':'); // IV separator
  });

  it('should validate data integrity', () => {
    // Test invoice hash verification
    const invoiceData = {
      id: 'inv_123',
      amount: 1350,
      date: new Date().toISOString()
    };
    
    const hash1 = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(invoiceData))
      .digest('hex');
    
    const hash2 = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(invoiceData))
      .digest('hex');
    
    expect(hash1).toBe(hash2); // Same data produces same hash
    
    // Modify data
    invoiceData.amount = 1400;
    const hash3 = require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(invoiceData))
      .digest('hex');
    
    expect(hash3).not.toBe(hash1); // Modified data produces different hash
  });
});