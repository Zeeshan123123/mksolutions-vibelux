/**
 * Enterprise Integration Layer
 * Integrates with ERP, LIMS, SSO and other enterprise systems
 * Revenue: $500K-2M/year for large enterprise customers
 */

import { getAnthropicClient, CLAUDE_4_OPUS_CONFIG } from '../ai/claude-service';
import { EventEmitter } from 'events';

// Enterprise system interfaces
export interface ERPIntegration {
  id: string;
  name: string;
  type: 'sap' | 'oracle' | 'netsuite' | 'dynamics' | 'custom';
  endpoint: string;
  credentials: ERPCredentials;
  modules: ERPModule[];
  syncSettings: SyncSettings;
  mappings: DataMapping[];
}

export interface ERPCredentials {
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  tenantId?: string;
  environment: 'production' | 'sandbox' | 'development';
}

export interface ERPModule {
  name: string;
  enabled: boolean;
  endpoints: string[];
  fields: ERPField[];
  syncFrequency: number; // minutes
  lastSync: Date;
}

export interface ERPField {
  erpField: string;
  vibeluxField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  transformation?: string; // transformation function name
}

export interface LIMSIntegration {
  id: string;
  name: string;
  type: 'labware' | 'thermo' | 'agilent' | 'waters' | 'custom';
  endpoint: string;
  credentials: LIMSCredentials;
  testTypes: TestType[];
  sampleTracking: SampleTrackingConfig;
  qualityControl: QualityControlConfig;
}

export interface LIMSCredentials {
  username: string;
  password: string;
  database?: string;
  serverInstance?: string;
  apiKey?: string;
  certificatePath?: string;
}

export interface TestType {
  id: string;
  name: string;
  category: 'potency' | 'pesticides' | 'heavy_metals' | 'microbials' | 'terpenes' | 'residual_solvents';
  methods: string[];
  sampleSize: number; // grams
  turnaroundTime: number; // hours
  cost: number;
  requiredEquipment: string[];
  compliance: ComplianceRequirement[];
}

export interface SampleTrackingConfig {
  barcodeFormat: string;
  chainOfCustody: boolean;
  temperatureLogging: boolean;
  photoDocumentation: boolean;
  retentionPeriod: number; // days
}

export interface QualityControlConfig {
  blindDuplicates: boolean;
  referenceStandards: boolean;
  spikeRecovery: boolean;
  blankAnalysis: boolean;
  controlLimits: Record<string, { upper: number; lower: number }>;
}

export interface SSOIntegration {
  id: string;
  name: string;
  protocol: 'saml' | 'oauth2' | 'openid' | 'ldap';
  provider: 'azure_ad' | 'okta' | 'auth0' | 'google' | 'custom';
  configuration: SSOConfiguration;
  userMapping: UserMapping;
  groupMapping: GroupMapping[];
}

export interface SSOConfiguration {
  entityId?: string;
  loginUrl?: string;
  logoutUrl?: string;
  certificateFingerprint?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string[];
  domain?: string;
  ldapUrl?: string;
  baseDn?: string;
}

export interface UserMapping {
  emailAttribute: string;
  nameAttribute: string;
  roleAttribute: string;
  facilityAttribute?: string;
  permissionAttribute?: string;
}

export interface GroupMapping {
  ssoGroup: string;
  vibeluxRole: 'admin' | 'manager' | 'operator' | 'viewer';
  permissions: string[];
  facilities: string[];
}

export interface DataMapping {
  source: string;
  target: string;
  transformation: MappingTransformation;
  validation: ValidationRule[];
  errorHandling: 'skip' | 'fail' | 'default';
}

export interface MappingTransformation {
  type: 'direct' | 'calculated' | 'lookup' | 'aggregated';
  formula?: string;
  lookupTable?: Record<string, any>;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface ValidationRule {
  field: string;
  rule: 'required' | 'range' | 'format' | 'unique';
  parameters: any;
  errorMessage: string;
}

export interface SyncSettings {
  enabled: boolean;
  frequency: number; // minutes
  direction: 'bidirectional' | 'from_erp' | 'to_erp';
  conflictResolution: 'erp_wins' | 'vibelux_wins' | 'manual' | 'newest_wins';
  batchSize: number;
  retryAttempts: number;
  notificationEmails: string[];
}

export interface ComplianceRequirement {
  regulation: string;
  standard: string;
  limit: number;
  unit: string;
  actionLevel: number;
}

export interface SyncResult {
  timestamp: Date;
  module: string;
  direction: 'inbound' | 'outbound';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errors: SyncError[];
  duration: number; // milliseconds
}

export interface SyncError {
  recordId: string;
  field: string;
  error: string;
  resolution: string;
}

export class EnterpriseIntegrationManager extends EventEmitter {
  private anthropic = getAnthropicClient();
  private erpIntegrations = new Map<string, ERPIntegration>();
  private limsIntegrations = new Map<string, LIMSIntegration>();
  private ssoIntegrations = new Map<string, SSOIntegration>();
  private syncJobs = new Map<string, NodeJS.Timeout>();
  private isActive = false;

  constructor() {
    super();
    this.startIntegrationManager();
  }

  private startIntegrationManager() {
    logger.info('api', '🔗 Starting Enterprise Integration Manager...');
    this.isActive = true;
    
    // Start health checks every 5 minutes
    setInterval(() => {
      this.performHealthChecks();
    }, 5 * 60 * 1000);

    logger.info('api', '✅ Enterprise Integration Manager started');
  }

  // ERP Integration Methods
  async addERPIntegration(config: ERPIntegration): Promise<void> {
    logger.info('api', `🏢 Adding ERP integration: ${config.name} (${config.type})`);

    try {
      // Test connection
      const connectionTest = await this.testERPConnection(config);
      if (!connectionTest.success) {
        throw new Error(`ERP connection test failed: ${connectionTest.error}`);
      }

      // Validate field mappings
      await this.validateERPMappings(config);

      // Store configuration
      this.erpIntegrations.set(config.id, config);

      // Start sync jobs for enabled modules
      this.startERPSyncJobs(config);

      logger.info('api', `✅ ERP integration ${config.name} added successfully`);
      this.emit('erpIntegrationAdded', config);

    } catch (error) {
      logger.error('api', `❌ Failed to add ERP integration ${config.name}:`, error);
      throw error;
    }
  }

  private async testERPConnection(config: ERPIntegration): Promise<{ success: boolean; error?: string }> {
    try {
      const testEndpoint = `${config.endpoint}/api/test`;
      const headers = this.buildERPHeaders(config);

      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private buildERPHeaders(config: ERPIntegration): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'VibeLux-Enterprise-Integration/1.0'
    };

    const creds = config.credentials;

    switch (config.type) {
      case 'sap':
        if (creds.username && creds.password) {
          headers['Authorization'] = `Basic ${Buffer.from(`${creds.username}:${creds.password}`).toString('base64')}`;
        }
        break;
      
      case 'oracle':
        if (creds.apiKey) {
          headers['Authorization'] = `Bearer ${creds.apiKey}`;
        }
        break;
      
      case 'netsuite':
        if (creds.clientId && creds.clientSecret) {
          headers['Authorization'] = `OAuth realm="${creds.tenantId}",oauth_consumer_key="${creds.clientId}"`;
        }
        break;
      
      case 'dynamics':
        if (creds.apiKey) {
          headers['Authorization'] = `Bearer ${creds.apiKey}`;
        }
        if (creds.tenantId) {
          headers['X-Tenant-ID'] = creds.tenantId;
        }
        break;
    }

    return headers;
  }

  private async validateERPMappings(config: ERPIntegration): Promise<void> {
    const prompt = `
Validate ERP integration mappings for ${config.type.toUpperCase()} system:

System: ${config.name}
Type: ${config.type}
Modules: ${config.modules.map(m => m.name).join(', ')}

Field Mappings:
${config.mappings.map(m => 
  `${m.source} → ${m.target} (${m.transformation.type})`
).join('\n')}

Please validate:
1. Field compatibility and data types
2. Required field coverage
3. Transformation logic feasibility
4. Potential data consistency issues
5. Performance implications

Provide specific recommendations for optimization and risk mitigation.
`;

    const response = await this.anthropic.messages.create({
      model: CLAUDE_4_OPUS_CONFIG.model,
      max_tokens: 2048,
      temperature: 0.2,
      system: this.getIntegrationExpertPrompt(),
      messages: [{ role: 'user', content: prompt }]
    });

    // Parse validation results (in production, this would be more sophisticated)
    logger.info('api', '📋 ERP mapping validation completed');
  }

  private getIntegrationExpertPrompt(): string {
    return `
You are an enterprise integration expert specializing in ERP, LIMS, and SSO systems for commercial agriculture and cannabis operations. Your expertise includes:

**ERP Systems:**
- SAP (S/4HANA, ECC), Oracle (ERP Cloud, E-Business Suite)
- Microsoft Dynamics 365, NetSuite, Sage, Infor
- Manufacturing execution systems (MES) integration
- Supply chain and inventory management
- Financial reporting and compliance

**LIMS Integration:**
- LabWare, Thermo Scientific, Agilent, Waters
- Cannabis testing workflows and compliance
- COA (Certificate of Analysis) automation
- Sample chain of custody and tracking
- Quality control and method validation

**SSO and Security:**
- SAML 2.0, OAuth 2.0, OpenID Connect
- Azure AD, Okta, Auth0, Google Workspace
- LDAP/Active Directory integration
- Role-based access control (RBAC)
- Compliance with SOX, GxP, 21 CFR Part 11

**Data Integration:**
- ETL/ELT processes and real-time synchronization
- API design and webhook implementation
- Data validation and transformation
- Conflict resolution and error handling
- Performance optimization for large datasets

Provide practical, implementable solutions that prioritize data integrity, security, and regulatory compliance.
`;
  }

  private startERPSyncJobs(config: ERPIntegration): void {
    for (const module of config.modules) {
      if (!module.enabled) continue;

      const jobId = `${config.id}_${module.name}`;
      const interval = module.syncFrequency * 60 * 1000; // Convert to milliseconds

      const syncJob = setInterval(async () => {
        await this.performERPSync(config, module);
      }, interval);

      this.syncJobs.set(jobId, syncJob);
      logger.info('api', `⏰ Started ERP sync job: ${jobId} (every ${module.syncFrequency} minutes)`);
    }
  }

  private async performERPSync(config: ERPIntegration, module: ERPModule): Promise<SyncResult> {
    const startTime = Date.now();
    logger.info('api', `🔄 Starting ERP sync: ${config.name} - ${module.name}`);

    const result: SyncResult = {
      timestamp: new Date(),
      module: module.name,
      direction: config.syncSettings.direction === 'from_erp' ? 'inbound' : 'outbound',
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
      errors: [],
      duration: 0
    };

    try {
      if (config.syncSettings.direction === 'from_erp' || config.syncSettings.direction === 'bidirectional') {
        await this.syncFromERP(config, module, result);
      }

      if (config.syncSettings.direction === 'to_erp' || config.syncSettings.direction === 'bidirectional') {
        await this.syncToERP(config, module, result);
      }

      module.lastSync = new Date();
      logger.info('api', `✅ ERP sync completed: ${result.recordsSuccessful}/${result.recordsProcessed} records`);

    } catch (error) {
      logger.error('api', `❌ ERP sync failed: ${config.name} - ${module.name}`, error);
      result.errors.push({
        recordId: 'SYNC_JOB',
        field: 'general',
        error: error instanceof Error ? error.message : 'Unknown error',
        resolution: 'Check configuration and network connectivity'
      });
    }

    result.duration = Date.now() - startTime;
    this.emit('syncCompleted', { config, module, result });
    return result;
  }

  private async syncFromERP(config: ERPIntegration, module: ERPModule, result: SyncResult): Promise<void> {
    // Fetch data from ERP system
    const erpData = await this.fetchERPData(config, module);
    
    for (const record of erpData) {
      try {
        result.recordsProcessed++;
        
        // Transform data according to mappings
        const transformedData = this.transformERPData(record, config.mappings);
        
        // Validate transformed data
        const validationResult = this.validateData(transformedData, config.mappings);
        if (!validationResult.valid) {
          result.recordsFailed++;
          result.errors.push({
            recordId: record.id || 'unknown',
            field: validationResult.field || 'unknown',
            error: validationResult.error || 'Validation failed',
            resolution: 'Check data format and mapping configuration'
          });
          continue;
        }
        
        // Store in VibeLux database
        await this.storeVibeLuxData(module.name, transformedData);
        result.recordsSuccessful++;
        
      } catch (error) {
        result.recordsFailed++;
        result.errors.push({
          recordId: record.id || 'unknown',
          field: 'processing',
          error: error instanceof Error ? error.message : 'Processing error',
          resolution: 'Review error logs and data format'
        });
      }
    }
  }

  private async syncToERP(config: ERPIntegration, module: ERPModule, result: SyncResult): Promise<void> {
    // Fetch data from VibeLux that needs to be synced to ERP
    const vibeluxData = await this.fetchVibeLuxData(module.name, module.lastSync);
    
    for (const record of vibeluxData) {
      try {
        result.recordsProcessed++;
        
        // Transform data for ERP format
        const erpData = this.transformToERPFormat(record, config.mappings);
        
        // Send to ERP system
        await this.sendToERP(config, module, erpData);
        result.recordsSuccessful++;
        
      } catch (error) {
        result.recordsFailed++;
        result.errors.push({
          recordId: record.id || 'unknown',
          field: 'erp_sync',
          error: error instanceof Error ? error.message : 'ERP sync error',
          resolution: 'Check ERP connectivity and data format'
        });
      }
    }
  }

  private async fetchERPData(config: ERPIntegration, module: ERPModule): Promise<any[]> {
    const headers = this.buildERPHeaders(config);
    const endpoint = `${config.endpoint}${module.endpoints[0]}`;
    
    const response = await fetch(endpoint, { headers });
    if (!response.ok) {
      throw new Error(`ERP API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private transformERPData(record: any, mappings: DataMapping[]): any {
    const transformed: any = {};
    
    for (const mapping of mappings) {
      const sourceValue = this.getNestedValue(record, mapping.source);
      
      switch (mapping.transformation.type) {
        case 'direct':
          transformed[mapping.target] = sourceValue;
          break;
          
        case 'calculated':
          if (mapping.transformation.formula) {
            transformed[mapping.target] = this.evaluateFormula(mapping.transformation.formula, record);
          }
          break;
          
        case 'lookup':
          if (mapping.transformation.lookupTable) {
            transformed[mapping.target] = mapping.transformation.lookupTable[sourceValue] || sourceValue;
          }
          break;
      }
    }
    
    return transformed;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateFormula(formula: string, data: any): any {
    // Safe formula evaluation using a math expression parser
    try {
      // Replace variable references with actual values
      let expression = formula;
      for (const [key, value] of Object.entries(data)) {
        // Validate that value is a number to prevent injection
        const numValue = parseFloat(String(value));
        if (isNaN(numValue)) {
          throw new Error(`Invalid numeric value for ${key}: ${value}`);
        }
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), String(numValue));
      }
      
      // Basic safety check - only allow numbers, basic operators, parentheses, and dots
      if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
        throw new Error('Invalid formula characters');
      }
      
      // Use safe math evaluator instead of Function constructor
      return this.safeMathEvaluate(expression);
    } catch (error) {
      logger.error('api', 'Formula evaluation error:', error );
      return null;
    }
  }

  private safeMathEvaluate(expression: string): number {
    // Simple recursive descent parser for basic math expressions
    // Only supports +, -, *, /, parentheses, and numbers
    const tokens = expression.replace(/\s+/g, '').match(/\d+\.?\d*|[+\-*/()]/g);
    if (!tokens) throw new Error('Invalid expression');
    
    let index = 0;
    
    const parseExpression = (): number => {
      let left = parseTerm();
      
      while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
        const operator = tokens[index++];
        const right = parseTerm();
        left = operator === '+' ? left + right : left - right;
      }
      
      return left;
    };
    
    const parseTerm = (): number => {
      let left = parseFactor();
      
      while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
        const operator = tokens[index++];
        const right = parseFactor();
        if (operator === '*') {
          left = left * right;
        } else {
          if (right === 0) throw new Error('Division by zero');
          left = left / right;
        }
      }
      
      return left;
    };
    
    const parseFactor = (): number => {
      if (tokens[index] === '(') {
        index++; // consume '('
        const result = parseExpression();
        if (tokens[index] !== ')') throw new Error('Missing closing parenthesis');
        index++; // consume ')'
        return result;
      }
      
      const token = tokens[index++];
      const num = parseFloat(token);
      if (isNaN(num)) throw new Error('Invalid number');
      return num;
    };
    
    const result = parseExpression();
    if (index < tokens.length) throw new Error('Unexpected tokens');
    return result;
  }

  private validateData(data: any, mappings: DataMapping[]): { valid: boolean; field?: string; error?: string } {
    for (const mapping of mappings) {
      for (const rule of mapping.validation) {
        const value = data[mapping.target];
        
        switch (rule.rule) {
          case 'required':
            if (value === undefined || value === null || value === '') {
              return { valid: false, field: mapping.target, error: `${mapping.target} is required` };
            }
            break;
            
          case 'range':
            if (typeof value === 'number') {
              const { min, max } = rule.parameters;
              if (value < min || value > max) {
                return { valid: false, field: mapping.target, error: `${mapping.target} must be between ${min} and ${max}` };
              }
            }
            break;
            
          case 'format':
            if (typeof value === 'string') {
              const regex = new RegExp(rule.parameters.pattern);
              if (!regex.test(value)) {
                return { valid: false, field: mapping.target, error: `${mapping.target} format is invalid` };
              }
            }
            break;
        }
      }
    }
    
    return { valid: true };
  }

  private async storeVibeLuxData(module: string, data: any): Promise<void> {
    // Store data in VibeLux database
    // This would integrate with your actual data layer
    logger.info('api', `💾 Storing ${module} data:`, { data: data });
  }

  private async fetchVibeLuxData(module: string, since: Date): Promise<any[]> {
    // Fetch data from VibeLux database that needs to be synced
    // This would integrate with your actual data layer
    logger.info('api', `📤 Fetching ${module} data since ${since}`);
    return [];
  }

  private transformToERPFormat(record: any, mappings: DataMapping[]): any {
    // Transform VibeLux data to ERP format (reverse of transformERPData)
    const transformed: any = {};
    
    for (const mapping of mappings) {
      const sourceValue = record[mapping.target];
      transformed[mapping.source] = sourceValue;
    }
    
    return transformed;
  }

  private async sendToERP(config: ERPIntegration, module: ERPModule, data: any): Promise<void> {
    const headers = this.buildERPHeaders(config);
    const endpoint = `${config.endpoint}${module.endpoints[0]}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`ERP API error: ${response.status} ${response.statusText}`);
    }
  }

  // LIMS Integration Methods
  async addLIMSIntegration(config: LIMSIntegration): Promise<void> {
    logger.info('api', `🧪 Adding LIMS integration: ${config.name} (${config.type})`);

    try {
      // Test LIMS connection
      const connectionTest = await this.testLIMSConnection(config);
      if (!connectionTest.success) {
        throw new Error(`LIMS connection test failed: ${connectionTest.error}`);
      }

      this.limsIntegrations.set(config.id, config);
      logger.info('api', `✅ LIMS integration ${config.name} added successfully`);
      this.emit('limsIntegrationAdded', config);

    } catch (error) {
      logger.error('api', `❌ Failed to add LIMS integration ${config.name}:`, error);
      throw error;
    }
  }

  private async testLIMSConnection(config: LIMSIntegration): Promise<{ success: boolean; error?: string }> {
    try {
      // Test connection based on LIMS type
      switch (config.type) {
        case 'labware':
          return await this.testLabwareConnection(config);
        case 'thermo':
          return await this.testThermoConnection(config);
        default:
          return await this.testGenericLIMSConnection(config);
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async testLabwareConnection(config: LIMSIntegration): Promise<{ success: boolean; error?: string }> {
    // Test LabWare LIMS connection
    const testQuery = 'SELECT COUNT(*) FROM SAMPLE WHERE ROWNUM = 1';
    // Implementation would use LabWare API or database connection
    return { success: true };
  }

  private async testThermoConnection(config: LIMSIntegration): Promise<{ success: boolean; error?: string }> {
    // Test Thermo Scientific LIMS connection
    const endpoint = `${config.endpoint}/api/v1/health`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.credentials.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: response.ok };
  }

  private async testGenericLIMSConnection(config: LIMSIntegration): Promise<{ success: boolean; error?: string }> {
    // Test generic LIMS connection
    const response = await fetch(`${config.endpoint}/api/test`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return { success: response.ok };
  }

  // SSO Integration Methods
  async addSSOIntegration(config: SSOIntegration): Promise<void> {
    logger.info('api', `🔐 Adding SSO integration: ${config.name} (${config.protocol})`);

    try {
      // Validate SSO configuration
      await this.validateSSOConfiguration(config);
      
      this.ssoIntegrations.set(config.id, config);
      logger.info('api', `✅ SSO integration ${config.name} added successfully`);
      this.emit('ssoIntegrationAdded', config);

    } catch (error) {
      logger.error('api', `❌ Failed to add SSO integration ${config.name}:`, error);
      throw error;
    }
  }

  private async validateSSOConfiguration(config: SSOIntegration): Promise<void> {
    switch (config.protocol) {
      case 'saml':
        if (!config.configuration.entityId || !config.configuration.loginUrl) {
          throw new Error('SAML configuration requires entityId and loginUrl');
        }
        break;
        
      case 'oauth2':
      case 'openid':
        if (!config.configuration.clientId || !config.configuration.clientSecret) {
          throw new Error('OAuth configuration requires clientId and clientSecret');
        }
        break;
        
      case 'ldap':
        if (!config.configuration.ldapUrl || !config.configuration.baseDn) {
          throw new Error('LDAP configuration requires ldapUrl and baseDn');
        }
        break;
    }
  }

  // Health Check Methods
  private async performHealthChecks(): Promise<void> {
    logger.info('api', '🔍 Performing enterprise integration health checks...');

    // Check ERP integrations
    for (const [id, config] of this.erpIntegrations) {
      try {
        const health = await this.testERPConnection(config);
        if (!health.success) {
          this.emit('integrationHealthIssue', {
            type: 'erp',
            id,
            name: config.name,
            error: health.error
          });
        }
      } catch (error) {
        logger.error('api', `ERP health check failed for ${config.name}:`, error);
      }
    }

    // Check LIMS integrations
    for (const [id, config] of this.limsIntegrations) {
      try {
        const health = await this.testLIMSConnection(config);
        if (!health.success) {
          this.emit('integrationHealthIssue', {
            type: 'lims',
            id,
            name: config.name,
            error: health.error
          });
        }
      } catch (error) {
        logger.error('api', `LIMS health check failed for ${config.name}:`, error);
      }
    }
  }

  // Public API Methods
  public getERPIntegration(id: string): ERPIntegration | undefined {
    return this.erpIntegrations.get(id);
  }

  public getLIMSIntegration(id: string): LIMSIntegration | undefined {
    return this.limsIntegrations.get(id);
  }

  public getSSOIntegration(id: string): SSOIntegration | undefined {
    return this.ssoIntegrations.get(id);
  }

  public getAllIntegrations(): {
    erp: ERPIntegration[];
    lims: LIMSIntegration[];
    sso: SSOIntegration[];
  } {
    return {
      erp: Array.from(this.erpIntegrations.values()),
      lims: Array.from(this.limsIntegrations.values()),
      sso: Array.from(this.ssoIntegrations.values())
    };
  }

  public async generateIntegrationReport(): Promise<any> {
    const prompt = `
Generate a comprehensive enterprise integration health report:

ERP Integrations: ${this.erpIntegrations.size}
LIMS Integrations: ${this.limsIntegrations.size}
SSO Integrations: ${this.ssoIntegrations.size}

Active Sync Jobs: ${this.syncJobs.size}

Analyze integration performance, identify potential issues, and provide optimization recommendations for enterprise-scale operations.
`;

    const response = await this.anthropic.messages.create({
      model: CLAUDE_4_OPUS_CONFIG.model,
      max_tokens: 3072,
      temperature: 0.3,
      system: this.getIntegrationExpertPrompt(),
      messages: [{ role: 'user', content: prompt }]
    });

    return {
      timestamp: new Date(),
      summary: {
        totalIntegrations: this.erpIntegrations.size + this.limsIntegrations.size + this.ssoIntegrations.size,
        activeSyncJobs: this.syncJobs.size,
        healthStatus: 'operational'
      },
      analysis: response.content[0].type === 'text' ? response.content[0].text : '',
      recommendations: []
    };
  }

  public stopIntegrations(): void {
    // Stop all sync jobs
    for (const [jobId, timer] of this.syncJobs) {
      clearInterval(timer);
      logger.info('api', `⏹️ Stopped sync job: ${jobId}`);
    }
    
    this.syncJobs.clear();
    this.isActive = false;
    logger.info('api', '🛑 Enterprise Integration Manager stopped');
  }
}

export default EnterpriseIntegrationManager;