# VibeLux - Professional Greenhouse Design Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Claude AI](https://img.shields.io/badge/Claude-4_Opus-FF6B35)](https://www.anthropic.com/)
[![Build Status](https://img.shields.io/badge/build-deployed-green)](https://vibelux.ai)

> Professional greenhouse design platform with **95%+ industry-standard quality** construction documentation

**Latest Update**: January 28, 2025 - Professional Standards Implementation

## 🌟 Overview

VibeLux revolutionizes horticultural lighting design through **conversational AI** that asks intelligent questions to create perfect lighting solutions. Unlike traditional tools that require extensive technical knowledge, VibeLux guides users through an intuitive conversation to generate professional-grade BIM designs.

### 🧠 Conversational AI Features

- 🗣️ **Natural Language Input** - Describe your needs in plain English
- ❓ **Intelligent Questioning** - AI asks only the most impactful clarifying questions
- 🎯 **Context Awareness** - Remembers conversation history and builds understanding
- 🤖 **Smart Defaults** - Uses industry best practices for missing information
- ⚡ **Minimal Friction** - 2-3 questions to generate professional designs
- 🔄 **Iterative Refinement** - Easy modifications and optimizations

### 🏗️ Professional BIM Integration

- **Autodesk Forge** - 3D BIM models with professional metadata
- **CAD Export** - DWG, IFC, Revit files with proper layer structure
- **DLC Database** - 2,000+ qualified horticultural fixtures
- **Complete Documentation** - BOMs, installation guides, commissioning plans
- **Energy Simulation** - PPFD mapping, uniformity analysis, power calculations

## 🚀 How It Works

### 1. Start a Conversation
```
User: "I need lighting for a cannabis grow room"
```

### 2. AI Asks Smart Questions
```
AI: "I need a few key details to create the optimal design:

1. What are your facility dimensions? 
   (Essential for fixture placement calculations)

2. What growth stage will you focus on?
   □ Vegetative (400-600 PPFD)
   □ Flowering (600-900 PPFD) 
   □ Both stages

3. Do you have any power limitations?
   □ No constraints
   □ Limited to existing electrical service
   □ Specific budget (please specify)"
```

### 3. Generate Complete Design
```json
{
  "design": {
    "fixtures": 24,
    "totalPower": "8,160W",
    "averagePPFD": "785 μmol/m²/s",
    "uniformity": "83%",
    "efficacy": "2.1 μmol/J"
  },
  "deliverables": {
    "bimModel": "Autodesk Forge 3D model",
    "cadFiles": ["facility.dwg", "lighting.ifc", "assembly.rvt"],
    "documentation": ["BOM.xlsx", "install_guide.pdf", "commissioning.pdf"]
  }
}
```

## 🎯 Quick Start

### Try the Conversational Designer

```bash
# Start with a simple request
curl -X POST https://vibelux.ai/api/ai/conversational-design?action=start \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "I need lighting for a 40x20 foot cannabis facility"
  }'

# AI will respond with clarifying questions
# Answer them to get your complete design
```

### Example Conversations

**Minimal Input → Professional Output**
```
User: "Help me light a vertical farm"
AI: "What crops and how many levels?"
User: "Lettuce, 6 levels, 20x40 space"
AI: [Generates complete design with 18 fixtures, full specifications]
```

**Complex Requirements**
```
User: "Research facility for multiple crops, need flexible spectrum control"
AI: "What's your research focus and mounting constraints?"
User: "Plant physiology studies, 12ft ceilings, need spectrum tunability"  
AI: [Generates modular system with tunable LED arrays]
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Anthropic API key (Claude 4 Opus access)
- Autodesk Forge credentials

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/vibelux-app.git
cd vibelux-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your API keys to .env.local

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

```env
# Core Services
DATABASE_URL="postgresql://user:pass@host:5432/vibelux"
ANTHROPIC_API_KEY="sk-ant-api3-your-key"
FORGE_CLIENT_ID="your-forge-app-id"
FORGE_CLIENT_SECRET="your-forge-secret"

# Authentication & Payments
NEXTAUTH_SECRET="your-nextauth-secret"
STRIPE_SECRET_KEY="sk_test_your-stripe-key"

# Optional Services
RESEND_API_KEY="re_your-email-key"
SENTRY_DSN="your-sentry-dsn"
```

## 🗣️ Conversational API

### Start Design Conversation

```typescript
POST /api/ai/conversational-design?action=start

{
  "userInput": "I need lighting for my grow facility",
  "context": null // Optional: previous conversation context
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "phase": "clarification",
    "confidence": 0.4,
    "readyToDesign": false,
    "clarificationQuestions": [
      {
        "id": "facility_dimensions",
        "question": "What are your facility dimensions?",
        "type": "text",
        "priority": "critical",
        "impact": "Essential for fixture placement calculations"
      }
    ],
    "nextSteps": ["Answer questions to improve design accuracy"]
  }
}
```

### Answer Questions

```typescript
POST /api/ai/conversational-design?action=answer

{
  "questionId": "facility_dimensions", 
  "answer": "40 feet by 20 feet by 12 feet high",
  "context": { /* conversation context */ }
}
```

### Question Types

- **Critical** - Required for basic design (dimensions, crop type)
- **Important** - Improves optimization (power limits, mounting height)
- **Optional** - Fine-tuning (manufacturer preferences, aesthetics)

## 🏗️ Architecture

### Conversational AI Flow

```mermaid
graph TD
    A[User Input] --> B[AI Analysis]
    B --> C{Sufficient Info?}
    C -->|No| D[Generate Questions]
    C -->|Yes| E[Create Design]
    D --> F[User Answers]
    F --> B
    E --> G[BIM Model]
    E --> H[CAD Export]
    E --> I[Documentation]
```

### Core Components

- **Conversational Engine** - Context-aware question generation
- **BIM Generator** - Autodesk Forge integration 
- **Optimization Engine** - Multi-objective design optimization
- **CAD Exporter** - Professional format generation
- **Documentation System** - Complete project deliverables

## 💡 AI Capabilities

### Intelligent Questioning

The AI understands **impact vs. effort** and asks questions strategically:

```typescript
// High-impact questions asked first
const criticalQuestions = [
  "facility_dimensions",    // Affects fixture count/layout
  "crop_requirements",      // Determines PPFD targets  
  "power_constraints"       // Limits fixture selection
];

// Optimization questions asked if time permits
const importantQuestions = [
  "uniformity_requirements", // Fine-tunes spacing
  "mounting_constraints",    // Affects beam angles
  "energy_priorities"        // Influences efficiency focus
];
```

### Smart Defaults

AI uses industry best practices when information is missing:

- **Cannabis Flowering** → 800 PPFD, 12/12 photoperiod
- **Leafy Greens** → 250 PPFD, 16-hour photoperiod  
- **Research Facility** → Flexible spectrum, adjustable mounting
- **Uniformity Target** → 80% minimum for commercial operations

### Context Memory

Conversation context includes:
- Previous questions and answers
- Inferred project requirements
- Confidence levels for each parameter
- Assumptions made by the AI
- Design constraints and preferences

## 🔧 Advanced Features

### Multi-Objective Optimization

The AI optimizes simultaneously for:
- **Light Uniformity** (min/max PPFD ratio)
- **Energy Efficiency** (μmol/J efficacy)
- **Installation Cost** (fixture count optimization)
- **Operational Cost** (annual energy consumption)

### Professional Deliverables

Every design includes:
- **3D BIM Model** (Autodesk Forge format)
- **CAD Files** (DWG, IFC, Revit with proper layers)
- **Bill of Materials** (Parts, specifications, suppliers)
- **Installation Documentation** (Procedures, safety, timeline)
- **Commissioning Plans** (Testing, validation, certification)
- **Maintenance Schedules** (Cleaning, replacement, monitoring)

### Real Fixture Integration

- **2,000+ DLC-qualified fixtures** with current specifications
- **Live manufacturer data** (PPF, efficacy, beam angles, dimensions)
- **Automatic updates** from manufacturer databases
- **Custom fixture support** for special applications

## 📊 Example Projects

### Cannabis Cultivation Facility

**Input:** "40x20 cannabis room, flowering stage"
**AI Questions:** Power limits? Mounting height? Uniformity requirements?
**Output:** 
- 24 fixtures, 680W each (16.3kW total)
- 815 μmol/m²/s average PPFD
- 87% uniformity, 2.1 μmol/J efficacy
- Complete electrical design with panel schedules

### Research Greenhouse

**Input:** "Need flexible lighting for plant research"
**AI Questions:** Crop variety? Spectral control needs? Mounting flexibility?
**Output:**
- Modular LED arrays with R/B/FR/W control
- Individual fixture dimming capability
- Adjustable mounting system
- Research protocol templates

### Vertical Farm

**Input:** "Lettuce production, 6 levels, maximize efficiency"
**AI Questions:** Level spacing? Production goals? Automation level?
**Output:**
- Level-specific fixture selection
- Optimized spectrum for each growth stage  
- Automated control integration
- Production optimization analysis

## 🚀 Deployment

### Production Deployment

```bash
# Build application
npm run build

# Deploy to Vercel
vercel --prod

# Configure production environment
vercel env add DATABASE_URL
vercel env add ANTHROPIC_API_KEY
vercel env add FORGE_CLIENT_ID
```

### Performance Optimization

- **CDN Integration** - Static assets via Vercel Edge Network
- **Database Optimization** - Connection pooling, query optimization
- **AI Response Caching** - Common questions cached for speed
- **Progressive Loading** - 3D models load incrementally

## 📈 Business Model

### Subscription Tiers

| Feature | Starter ($29/mo) | Professional ($99/mo) | Enterprise ($299/mo) |
|---------|------------------|----------------------|---------------------|
| Conversational Design | ✅ Basic | ✅ Advanced | ✅ Full |
| Fixture Database | 500 fixtures | 2,000+ fixtures | Unlimited |
| CAD Export | PDF only | DWG, IFC | All formats |
| AI Questions | 3 per design | Unlimited | Priority support |
| BIM Integration | ❌ | ✅ | ✅ |
| API Access | ❌ | Limited | Full |

### Target Markets

- **Primary:** Lighting consultants and design firms
- **Secondary:** Grow facility operators and contractors  
- **Enterprise:** Equipment manufacturers and system integrators

## 🤝 Contributing

### Development Guidelines

- **Conversational Design** - Focus on user experience and question quality
- **AI Prompting** - Improve question generation and context understanding
- **BIM Integration** - Enhance CAD export and professional documentation
- **Performance** - Optimize response times and resource usage

### Feature Requests

Use our built-in feature request system:
```
Visit: /feature-request
Or API: POST /api/feature-request
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** - Claude 4 Opus conversational AI
- **Autodesk** - Forge platform and BIM tools
- **DesignLights Consortium** - Horticultural fixture database
- **Next.js Team** - Full-stack React framework

---

**VibeLux** - Making professional lighting design accessible through conversation

🌐 [vibelux.ai](https://vibelux.ai) | 💬 [Discord Community](https://discord.gg/vibelux)# Enhanced builds enabled Fri Aug  8 20:51:59 CDT 2025
# mksolutions-vibelux
