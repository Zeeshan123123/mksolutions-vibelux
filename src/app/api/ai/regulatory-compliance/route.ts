import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/production-logger';
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { facilityId, jurisdiction, businessType, facilitySize, analysisType } = await request.json();

    if (!facilityId || !jurisdiction || !businessType) {
      return NextResponse.json(
        { error: 'Facility ID, jurisdiction, and business type are required' },
        { status: 400 }
      );
    }

    // Check if Claude API is available
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    const useClaudeAPI = claudeApiKey && claudeApiKey !== 'sk-ant-api-dev-placeholder-key-for-development';

    let complianceData;

    if (useClaudeAPI) {
      try {
        complianceData = await generateClaudeCompliance(jurisdiction, businessType, facilitySize);
      } catch (error) {
        logger.warn('api', 'Claude API failed, using rule-based compliance:', error);
        complianceData = generateRuleBasedCompliance(jurisdiction, businessType, facilitySize);
      }
    } else {
      complianceData = generateRuleBasedCompliance(jurisdiction, businessType, facilitySize);
    }

    return NextResponse.json({
      success: true,
      ...complianceData,
      analysisType: useClaudeAPI ? 'claude_ai' : 'rule_based',
      facilityId,
      jurisdiction,
      businessType,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('api', 'Regulatory compliance API error:', error );
    return NextResponse.json(
      { error: 'Failed to analyze regulatory compliance' },
      { status: 500 }
    );
  }
}

async function generateClaudeCompliance(jurisdiction: string, businessType: string, facilitySize: string) {
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  const prompt = `You are an expert cannabis industry regulatory compliance consultant with deep knowledge of federal, state, and local regulations for cannabis businesses. Analyze compliance requirements for this facility.

**Facility Profile:**
- Jurisdiction: ${jurisdiction}
- Business Type: ${businessType}
- Facility Size: ${facilitySize}

**Analysis Requirements:**
Please provide a comprehensive compliance analysis covering:

1. **Federal Regulations:**
   - OSHA workplace safety requirements
   - DEA controlled substance regulations
   - FDA food safety (if applicable)
   - Environmental regulations
   - Financial compliance (banking, taxes)

2. **State Regulations:**
   - ${jurisdiction} cannabis control regulations
   - Licensing requirements
   - Testing and quality standards
   - Security requirements
   - Packaging and labeling
   - Record keeping and tracking

3. **Local Regulations:**
   - Zoning compliance
   - Building codes
   - Fire safety
   - Waste management
   - Water usage

**Current Regulatory Landscape (2025):**
Consider recent updates and emerging regulations in the cannabis industry.

Provide exactly 5 compliance items and 3 regulatory updates in this JSON format:
{
  "complianceItems": [
    {
      "id": "unique-id",
      "regulation": "Specific regulation name/number",
      "jurisdiction": "Federal|State|Local",
      "category": "safety|quality|security|environmental|financial|operational",
      "status": "compliant|warning|violation|pending",
      "priority": "low|medium|high|critical",
      "title": "Compliance requirement title",
      "description": "What is required",
      "requirement": "Specific regulatory requirement",
      "currentState": "Current compliance status",
      "gapAnalysis": "What needs to be done",
      "dueDate": "2025-02-15",
      "lastReviewed": "2024-12-01",
      "confidence": 90,
      "actions": [
        {
          "id": "action-id",
          "type": "document|process|training|equipment|inspection",
          "title": "Action title",
          "description": "What needs to be done",
          "priority": "low|medium|high|critical",
          "deadline": "2025-01-30",
          "status": "pending|in_progress|completed|overdue",
          "estimatedHours": 8,
          "cost": 500
        }
      ],
      "documentation": ["Required documents"],
      "estimatedCost": 500,
      "estimatedTime": "8 hours"
    }
  ],
  "regulatoryUpdates": [
    {
      "id": "update-id",
      "regulation": "Regulation name",
      "jurisdiction": "Federal|State|Local",
      "title": "Update title",
      "summary": "Summary of changes",
      "effectiveDate": "2025-03-01",
      "impact": "low|medium|high|critical",
      "category": "Category",
      "actionRequired": true
    }
  ]
}

Focus on:
- Current and emerging compliance risks
- Practical implementation steps
- Realistic timelines and costs
- High-impact compliance gaps
- Recent regulatory changes affecting ${businessType} operations in ${jurisdiction}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': claudeApiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // Extract JSON from Claude's response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const result = JSON.parse(jsonMatch[0]);
    return {
      complianceItems: result.complianceItems || [],
      regulatoryUpdates: result.regulatoryUpdates || []
    };
  }
  
  throw new Error('Failed to parse Claude response');
}

function generateRuleBasedCompliance(jurisdiction: string, businessType: string, facilitySize: string) {
  const complianceItems: any[] = [];
  const regulatoryUpdates: any[] = [];

  // Federal OSHA Requirements (Universal)
  complianceItems.push({
    id: 'osha-hazcom',
    regulation: 'OSHA 29 CFR 1910.1200',
    jurisdiction: 'Federal',
    category: 'safety',
    status: 'warning',
    priority: 'high',
    title: 'Hazard Communication Standard',
    description: 'Maintain Safety Data Sheets and provide chemical hazard training',
    requirement: 'Current SDS for all chemicals, annual employee training, proper labeling',
    currentState: 'Training completed 10 months ago, some SDS may be outdated',
    gapAnalysis: 'Need to update SDS library and conduct refresher training',
    dueDate: '2025-02-28',
    lastReviewed: '2024-06-15',
    confidence: 95,
    actions: [
      {
        id: 'sds-update',
        type: 'document',
        title: 'Update Chemical SDS Library',
        description: 'Obtain current SDS for all cultivation chemicals and cleaning products',
        priority: 'high',
        deadline: '2025-01-31',
        status: 'pending',
        estimatedHours: 6,
        cost: 0
      },
      {
        id: 'hazcom-training',
        type: 'training',
        title: 'Annual Hazcom Training',
        description: 'Conduct comprehensive chemical safety training for all employees',
        priority: 'medium',
        deadline: '2025-02-28',
        status: 'pending',
        estimatedHours: 12,
        cost: 800
      }
    ],
    documentation: ['SDS Library', 'Training Records', 'Chemical Inventory'],
    estimatedCost: 800,
    estimatedTime: '18 hours'
  });

  // State-specific regulations based on jurisdiction
  if (jurisdiction.toLowerCase().includes('california')) {
    complianceItems.push({
      id: 'ca-testing',
      regulation: 'California Cannabis Regulations',
      jurisdiction: 'California',
      category: 'quality',
      status: 'violation',
      priority: 'critical',
      title: 'Mandatory Testing Requirements',
      description: 'All cultivation batches must pass required testing before distribution',
      requirement: 'Test for pesticides, heavy metals, microbials, potency, residual solvents',
      currentState: 'Testing facility experiencing delays, 2 batches pending results',
      gapAnalysis: 'Need backup testing laboratory contract to avoid compliance violations',
      dueDate: '2025-01-15',
      lastReviewed: '2024-12-28',
      confidence: 98,
      actions: [
        {
          id: 'backup-lab',
          type: 'process',
          title: 'Secure Backup Testing Lab',
          description: 'Contract with additional laboratory for testing redundancy',
          priority: 'critical',
          deadline: '2025-01-10',
          status: 'in_progress',
          estimatedHours: 20,
          cost: 3000
        }
      ],
      documentation: ['Testing Results', 'Lab Contracts', 'COAs'],
      estimatedCost: 3000,
      estimatedTime: '20 hours'
    });

    complianceItems.push({
      id: 'ca-security',
      regulation: 'California Security Requirements',
      jurisdiction: 'California',
      category: 'security',
      status: 'compliant',
      priority: 'medium',
      title: 'Video Surveillance System',
      description: '24/7 video surveillance with 90-day retention requirement',
      requirement: 'Continuous recording, 90-day storage, real-time monitoring capability',
      currentState: 'System operational with 120-day retention, monitored by security service',
      gapAnalysis: 'System exceeds requirements, consider optimizing storage costs',
      dueDate: '2025-12-31',
      lastReviewed: '2024-12-15',
      confidence: 99,
      actions: [],
      documentation: ['Security System Logs', 'Monitoring Service Agreement'],
      estimatedCost: 0,
      estimatedTime: '0 hours'
    });
  }

  // Business type specific requirements
  if (businessType === 'cultivation') {
    complianceItems.push({
      id: 'pesticide-use',
      regulation: 'EPA Pesticide Regulations',
      jurisdiction: 'Federal',
      category: 'environmental',
      status: 'warning',
      priority: 'high',
      title: 'Pesticide Use and Record Keeping',
      description: 'Proper pesticide application and detailed record maintenance',
      requirement: 'Licensed applicator, proper storage, detailed application records',
      currentState: 'Records maintained but applicator license expires in 60 days',
      gapAnalysis: 'Need to renew applicator license and update storage procedures',
      dueDate: '2025-03-01',
      lastReviewed: '2024-11-30',
      confidence: 90,
      actions: [
        {
          id: 'license-renewal',
          type: 'process',
          title: 'Renew Pesticide Applicator License',
          description: 'Complete continuing education and license renewal process',
          priority: 'high',
          deadline: '2025-02-15',
          status: 'pending',
          estimatedHours: 16,
          cost: 450
        }
      ],
      documentation: ['Applicator License', 'Application Records', 'Storage Logs'],
      estimatedCost: 450,
      estimatedTime: '16 hours'
    });
  }

  // Facility size specific requirements
  if (facilitySize === 'large') {
    complianceItems.push({
      id: 'environmental-monitoring',
      regulation: 'Environmental Protection Requirements',
      jurisdiction: 'State',
      category: 'environmental',
      status: 'pending',
      priority: 'medium',
      title: 'Water Usage and Waste Management',
      description: 'Large facilities require enhanced environmental monitoring',
      requirement: 'Water usage reporting, waste management plan, environmental impact assessment',
      currentState: 'Basic monitoring in place, formal reporting system needed',
      gapAnalysis: 'Implement comprehensive environmental monitoring and reporting system',
      dueDate: '2025-06-30',
      lastReviewed: '2024-12-01',
      confidence: 85,
      actions: [
        {
          id: 'monitoring-system',
          type: 'equipment',
          title: 'Install Environmental Monitoring System',
          description: 'Deploy automated water and waste monitoring with reporting capabilities',
          priority: 'medium',
          deadline: '2025-04-30',
          status: 'pending',
          estimatedHours: 40,
          cost: 5500
        }
      ],
      documentation: ['Environmental Impact Assessment', 'Monitoring Reports'],
      estimatedCost: 5500,
      estimatedTime: '40 hours'
    });
  }

  // Generate regulatory updates
  regulatoryUpdates.push(
    {
      id: 'packaging-update',
      regulation: 'Cannabis Packaging Standards',
      jurisdiction: jurisdiction,
      title: 'Enhanced Child-Resistant Packaging Requirements',
      summary: 'New standards for child-resistant packaging with additional testing requirements effective March 2025',
      effectiveDate: '2025-03-01',
      impact: 'medium',
      category: 'packaging',
      actionRequired: true
    },
    {
      id: 'testing-update',
      regulation: 'Quality Control Standards',
      jurisdiction: jurisdiction,
      title: 'Expanded Microbial Testing Requirements',
      summary: 'Additional microbial testing requirements including new pathogen screening protocols',
      effectiveDate: '2025-04-15',
      impact: 'high',
      category: 'quality',
      actionRequired: true
    },
    {
      id: 'security-update',
      regulation: 'Security Enhancement Requirements',
      jurisdiction: 'Federal',
      title: 'Enhanced Transportation Security Protocols',
      summary: 'New federal guidelines for cannabis product transportation and manifest requirements',
      effectiveDate: '2025-05-01',
      impact: 'medium',
      category: 'security',
      actionRequired: true
    }
  );

  return {
    complianceItems: complianceItems.slice(0, 5),
    regulatoryUpdates: regulatoryUpdates.slice(0, 3)
  };
}