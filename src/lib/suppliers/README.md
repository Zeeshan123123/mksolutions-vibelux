# VibeLux Supplier Integration System

A comprehensive supplier integration and procurement management system that connects the VibeLux CAD platform with material suppliers for real-time pricing, automated procurement, and supply chain optimization.

## Overview

The supplier integration system provides:

- **Real-time Supplier Connectivity** - Direct API integration with major greenhouse suppliers
- **Automated Procurement Workflows** - End-to-end procurement from BOM to delivery
- **Intelligent Quote Management** - Multi-supplier quote comparison and optimization
- **Supply Chain Analytics** - Performance tracking and cost optimization
- **Quality Management** - Integrated quality control and inspection workflows

## System Architecture

### Core Components

```
├── supplier-integration.ts      # Main supplier integration engine
├── supplier-api-client.ts       # HTTP client for supplier APIs
├── procurement-workflow.ts      # Procurement workflow engine
└── README.md                    # This documentation
```

### Integration Flow

```
BOM Generation → Supplier Sourcing → Quote Requests → Quote Comparison → 
Approval Workflow → Purchase Orders → Order Tracking → Delivery → Quality Check
```

## Key Features

### 1. Supplier Management
- Multi-supplier configuration and management
- Real-time API connectivity testing
- Supplier performance tracking and analytics
- Automated supplier onboarding and validation

### 2. Procurement Automation
- Automated BOM-to-procurement conversion
- Intelligent supplier selection and routing
- Multi-stage approval workflows
- Real-time order status tracking

### 3. Quote Management
- Parallel quote requests across suppliers
- Intelligent quote comparison algorithms
- Cost optimization recommendations
- Volume discount calculations

### 4. Quality Control
- Integrated quality inspection workflows
- Defect tracking and supplier feedback
- Quality score calculation and reporting
- Corrective action management

### 5. Analytics and Reporting
- Real-time procurement dashboards
- Supplier performance analytics
- Cost savings identification
- Supply chain risk assessment

## Configuration

### Environment Variables

```bash
# Supplier API Configuration
ATLAS_COMMERCIAL_API_KEY=your_atlas_api_key
NEXUS_GLAZING_API_KEY=your_nexus_api_key
PRIVA_SYSTEMS_API_KEY=your_priva_api_key
RIMOL_FASTENERS_API_KEY=your_rimol_api_key
ARGUS_CONTROLS_API_KEY=your_argus_api_key

# Procurement Configuration
PROCUREMENT_WORKFLOW_ENABLED=true
PROCUREMENT_AUTO_APPROVAL_LIMIT=10000
PROCUREMENT_QUALITY_CHECK_REQUIRED=true

# Integration Settings
SUPPLIER_SYNC_INTERVAL=14400000  # 4 hours
SUPPLIER_RATE_LIMIT=60           # requests per minute
SUPPLIER_TIMEOUT=30000           # 30 seconds
```

### Supplier Configuration

```typescript
const supplierConfig: SupplierConfig = {
  id: 'atlas-commercial',
  name: 'Atlas Commercial Greenhouse',
  type: 'structural',
  apiEndpoint: 'https://api.atlascommercial.com/v1',
  apiKey: process.env.ATLAS_COMMERCIAL_API_KEY,
  region: 'North America',
  currency: 'USD',
  minimumOrder: 1000,
  leadTime: 14,
  shippingZones: ['US', 'CA', 'MX'],
  certifications: ['ISO 9001', 'NNGMA'],
  paymentTerms: 'Net 30',
  discount: {
    volume: [
      { minQuantity: 10000, discountPercent: 5 },
      { minQuantity: 50000, discountPercent: 10 }
    ],
    seasonal: [
      { season: 'winter', discountPercent: 8 }
    ]
  },
  status: 'active'
};
```

## Usage Examples

### Basic Supplier Integration

```typescript
import { SupplierIntegration } from './supplier-integration';
import { SupplierAPIClient } from './supplier-api-client';

// Initialize supplier integration
const supplierIntegration = new SupplierIntegration();
const apiClient = new SupplierAPIClient();

await supplierIntegration.initialize();
await apiClient.initializeClient(supplierConfig);

// Get price quotes for BOM items
const quotes = await supplierIntegration.getPriceQuote(bomItems, projectId);

// Compare quotes and select best option
const comparison = await supplierIntegration.compareQuotes(requestId);
console.log('Best overall quote:', comparison.bestOverallQuote);
```

### Procurement Workflow

```typescript
import { ProcurementWorkflowEngine } from './procurement-workflow';

// Initialize procurement workflow
const workflowEngine = new ProcurementWorkflowEngine(supplierIntegration, apiClient);
await workflowEngine.initialize();

// Create procurement project from BOM
const project = await workflowEngine.createProcurementProject(bomItems, {
  name: 'Greenhouse Project Alpha',
  description: 'Material procurement for 10,000 sq ft greenhouse',
  bomId: 'bom_123',
  projectId: 'proj_456',
  priority: 'high',
  budget: 75000,
  currency: 'USD',
  requiredDate: new Date('2024-06-01'),
  deliveryAddress: projectAddress,
  createdBy: 'user_123'
});

// Monitor procurement progress
workflowEngine.on('stage-completed', (event) => {
  console.log(`Stage ${event.stage} completed for project ${event.projectId}`);
});
```

### Real-time Supplier Data

```typescript
// Get real-time product availability
const inventory = await apiClient.getInventory(supplierId, skuList);

// Search supplier catalog
const products = await apiClient.searchProducts(supplierId, {
  category: 'structural',
  keywords: 'galvanized frame',
  minPrice: 100,
  maxPrice: 1000,
  availability: true
});

// Track order status
const orderStatus = await apiClient.getOrderStatus(supplierId, orderId);
console.log('Order status:', orderStatus.data.status);
```

## Supported Suppliers

### Structural Components
- **Atlas Commercial Greenhouse** - Complete greenhouse structures
- **Nexus Greenhouse Systems** - Modular greenhouse components
- **Rimol Greenhouse Systems** - Structural frames and hardware

### Glazing Systems
- **Nexus Glazing Systems** - Polycarbonate and glass glazing
- **Palram Americas** - Specialty glazing materials
- **Gallina USA** - Professional glazing systems

### Climate Control
- **Priva Climate Systems** - Complete climate control solutions
- **Argus Control Systems** - Environmental monitoring and control
- **Phason Controls** - Ventilation and heating systems

### Fasteners & Hardware
- **Rimol Fastening Systems** - Specialized greenhouse fasteners
- **Penn State Industries** - Industrial fasteners and hardware
- **Fastenal** - General industrial supplies

## API Integration

### Supplier API Standards

The system supports multiple API standards:

- **RESTful APIs** - HTTP/JSON based APIs
- **GraphQL** - For flexible data queries
- **WebSocket** - Real-time updates and notifications
- **Webhooks** - Event-driven notifications

### Authentication Methods

- **API Keys** - Simple key-based authentication
- **OAuth 2.0** - Secure token-based authentication
- **JWT Tokens** - JSON Web Token authentication
- **mTLS** - Mutual TLS certificate authentication

### Rate Limiting

The system implements intelligent rate limiting:

- **Per-supplier limits** - Respects individual supplier rate limits
- **Request queuing** - Queues requests when limits are reached
- **Backoff strategies** - Exponential backoff for failed requests
- **Priority handling** - Prioritizes urgent requests

## Data Models

### Supplier Configuration

```typescript
interface SupplierConfig {
  id: string;
  name: string;
  type: 'structural' | 'glazing' | 'systems' | 'fasteners' | 'electrical';
  apiEndpoint: string;
  apiKey: string;
  region: string;
  currency: string;
  minimumOrder: number;
  leadTime: number;
  shippingZones: string[];
  certifications: string[];
  paymentTerms: string;
  discount: {
    volume: Array<{ minQuantity: number; discountPercent: number }>;
    seasonal: Array<{ season: string; discountPercent: number }>;
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}
```

### Price Quote

```typescript
interface PriceQuote {
  quoteId: string;
  supplierId: string;
  requestId: string;
  items: Array<{
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    availability: string;
    leadTime: number;
  }>;
  totalAmount: number;
  currency: string;
  taxes: number;
  shipping: number;
  discount: number;
  validUntil: Date;
  paymentTerms: string;
  deliveryTerms: string;
  confidence: number;
}
```

### Purchase Order

```typescript
interface PurchaseOrder {
  orderId: string;
  supplierId: string;
  projectId: string;
  orderDate: Date;
  requestedDeliveryDate: Date;
  status: 'draft' | 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered';
  items: Array<{
    sku: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: string;
    tracking?: string;
  }>;
  totalAmount: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  specialInstructions: string;
}
```

## Workflow Configuration

### Procurement Stages

1. **Sourcing Stage** (24 hours)
   - Identify qualified suppliers
   - Evaluate supplier capabilities
   - Filter by category and region

2. **Quoting Stage** (48 hours)
   - Send quote requests to suppliers
   - Collect and validate quotes
   - Calculate pricing comparisons

3. **Approval Stage** (72 hours)
   - Route for technical approval
   - Obtain financial approval
   - Secure management approval

4. **Ordering Stage** (4 hours)
   - Generate purchase orders
   - Submit orders to suppliers
   - Confirm order acceptance

5. **Receiving Stage** (1 week)
   - Track order shipments
   - Coordinate deliveries
   - Confirm receipt

6. **Quality Check Stage** (24 hours)
   - Inspect received materials
   - Verify specifications
   - Document quality results

### Approval Workflows

```typescript
const approvalRules = {
  technical: { threshold: 10000, approvers: ['technical_manager'] },
  financial: { threshold: 25000, approvers: ['financial_manager'] },
  management: { threshold: 50000, approvers: ['general_manager'] }
};
```

## Performance Metrics

### Key Performance Indicators

- **On-time Delivery** - Percentage of orders delivered on schedule
- **Quality Score** - Percentage of items passing quality inspection
- **Cost Savings** - Total savings achieved through optimization
- **Supplier Performance** - Composite score of supplier reliability
- **Procurement Cycle Time** - Average time from BOM to delivery

### Optimization Features

- **Volume Discounts** - Automatic calculation and application
- **Seasonal Pricing** - Time-based pricing optimization
- **Multi-supplier Comparison** - Intelligent quote analysis
- **Risk Assessment** - Supply chain risk evaluation
- **Inventory Optimization** - Just-in-time delivery coordination

## Error Handling

### Common Error Scenarios

1. **API Connectivity Issues**
   - Network timeouts
   - Authentication failures
   - Rate limit exceeded

2. **Data Validation Errors**
   - Invalid supplier responses
   - Malformed quote data
   - Missing required fields

3. **Business Logic Errors**
   - Insufficient inventory
   - Pricing discrepancies
   - Delivery conflicts

### Error Recovery

```typescript
// Automatic retry with exponential backoff
const retryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOn: [408, 429, 500, 502, 503, 504]
};

// Graceful degradation
const fallbackOptions = {
  useCache: true,
  estimateAvailability: true,
  notifyManualIntervention: true
};
```

## Security

### Data Protection

- **Encryption at Rest** - All supplier data encrypted
- **Encryption in Transit** - TLS 1.3 for all communications
- **API Key Management** - Secure key storage and rotation
- **Access Control** - Role-based permissions

### Compliance

- **PCI DSS** - Payment card industry compliance
- **SOC 2 Type II** - Security and availability controls
- **GDPR** - Data privacy and protection
- **ISO 27001** - Information security management

## Testing

### Unit Tests

```bash
# Run supplier integration tests
npm test src/lib/suppliers/supplier-integration.test.ts

# Run API client tests
npm test src/lib/suppliers/supplier-api-client.test.ts

# Run procurement workflow tests
npm test src/lib/suppliers/procurement-workflow.test.ts
```

### Integration Tests

```bash
# Test supplier API connections
npm run test:integration:suppliers

# Test procurement workflows
npm run test:integration:procurement

# Test quote comparison algorithms
npm run test:integration:quotes
```

### Performance Tests

```bash
# Load test supplier APIs
npm run test:performance:suppliers

# Stress test procurement workflows
npm run test:performance:procurement
```

## Monitoring and Observability

### Metrics Collection

- **Request Latency** - API response times
- **Error Rates** - Failed requests by supplier
- **Throughput** - Requests per second
- **Cache Hit Rates** - Cache effectiveness

### Alerting

- **Supplier Downtime** - API connectivity issues
- **Quality Issues** - Failed quality checks
- **Budget Overruns** - Cost threshold violations
- **Delivery Delays** - Schedule deviations

### Logging

```typescript
// Structured logging with correlation IDs
logger.info('Quote request sent', {
  supplierId: 'atlas-commercial',
  requestId: 'req_123',
  itemCount: 25,
  timestamp: new Date().toISOString()
});
```

## Deployment

### Production Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  supplier-integration:
    image: vibelux/supplier-integration:latest
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:password@db:5432/vibelux
    depends_on:
      - redis
      - postgres
    ports:
      - "3001:3001"
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: supplier-integration
spec:
  replicas: 3
  selector:
    matchLabels:
      app: supplier-integration
  template:
    metadata:
      labels:
        app: supplier-integration
    spec:
      containers:
      - name: supplier-integration
        image: vibelux/supplier-integration:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run tests: `npm test`
5. Start development server: `npm run dev`

### Adding New Suppliers

1. Create supplier configuration in `supplier-integration.ts`
2. Implement API client methods in `supplier-api-client.ts`
3. Add supplier-specific tests
4. Update documentation

### Workflow Customization

1. Define new workflow stages in `procurement-workflow.ts`
2. Implement stage execution logic
3. Add workflow configuration
4. Test workflow execution

## Support and Maintenance

### Regular Maintenance Tasks

- **API Key Rotation** - Monthly supplier API key updates
- **Performance Monitoring** - Weekly performance reviews
- **Data Cleanup** - Monthly cleanup of old procurement data
- **Security Updates** - Regular security patches and updates

### Troubleshooting

Common issues and solutions:

1. **Supplier API Timeout**
   - Check network connectivity
   - Verify API endpoint status
   - Review rate limiting settings

2. **Quote Comparison Errors**
   - Validate quote data format
   - Check currency conversion
   - Verify supplier configuration

3. **Procurement Workflow Stalls**
   - Check approval queue status
   - Verify user permissions
   - Review workflow configuration

For additional support, contact the VibeLux development team or refer to the API documentation.